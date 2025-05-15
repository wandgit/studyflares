import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { ChatMessage } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>;
  initialMessages?: Message[];
  placeholder?: string;
  messages?: ChatMessage[];
  isLoading?: boolean;
}

const ChatInterface = ({
  onSendMessage,
  initialMessages = [],
  placeholder = 'Ask a question about your study materials...',
  messages: externalMessages,
  isLoading: externalLoading,
}: ChatInterfaceProps) => {
  // Use internal state if no external messages are provided
  const [internalMessages, setInternalMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Determine if we're using controlled or uncontrolled behavior
  const isControlled = externalMessages !== undefined;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [internalMessages, externalMessages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle message submission
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    if (!isControlled) {
      // Uncontrolled mode - manage messages internally
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: inputValue,
        isUser: true,
        timestamp: new Date(),
      };

      setInternalMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setInternalLoading(true);

      try {
        const response = await onSendMessage(inputValue);
        
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: response,
          isUser: false,
          timestamp: new Date(),
        };

        setInternalMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        // Handle error
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          isUser: false,
          timestamp: new Date(),
        };

        setInternalMessages((prev) => [...prev, errorMessage]);
      } finally {
        setInternalLoading(false);
      }
    } else {
      // Controlled mode - just call the handler and let parent manage state
      await onSendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Convert external messages to the internal format if needed
  const displayMessages = isControlled 
    ? externalMessages.map((msg, index) => ({
        id: `${msg.role}-${index}`,
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(), // We don't have timestamps in external messages
      }))
    : internalMessages;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={48} className="text-accent mb-4" />
            <h3 className="font-sans text-xl mb-2">Ask me anything!</h3>
            <p className="text-text opacity-70 max-w-md">
              I can help you understand concepts, create study guides, and answer questions about your materials.
            </p>
          </div>
        ) : (
          displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] p-4 ${
                  message.isUser 
                    ? 'bg-leather text-white' 
                    : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {message.isUser ? (
                      <div className="w-8 h-8 rounded-full bg-dark-leather flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-light-beige flex items-center justify-center">
                        <Bot size={16} className="text-dark-leather" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${message.isUser ? 'text-white' : 'text-text'}`}>
                      {message.isUser ? message.content : (
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            code: ({ node, inline, className, children, ...props }: { 
                              node?: any; 
                              inline?: boolean; 
                              className?: string; 
                              children?: React.ReactNode; 
                              [key: string]: any; 
                            }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <pre className={className}>
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </p>
                    <p className={`text-xs mt-1 ${message.isUser ? 'text-white text-opacity-70' : 'text-text text-opacity-50'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-light-beige flex items-center justify-center">
                    <Loader2 size={16} className="text-dark-leather animate-spin" />
                  </div>
                </div>
                <p className="text-sm text-text">Thinking...</p>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-secondary">
        <div className="flex items-end space-x-2">
          <div className="flex-1 neu-card p-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent focus:outline-none resize-none min-h-[60px] max-h-[200px] p-2"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading}
            leftIcon={<Send size={16} />}
            aria-label="Send message"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
