import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with the API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Model configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8048,
};

/**
 * Process content before sending to Gemini
 * This handles special markers like PDF content
 * @param content The content to process
 * @returns The processed content with appropriate instructions
 */
function processContent(content: string): string {
  // Check if this is PDF content
  if (content.startsWith('[PDF_DOCUMENT:')) {
    const pdfName = content.match(/\[PDF_DOCUMENT:(.*?)\]/)?.[1] || 'document.pdf';
    return `This is a PDF document named "${pdfName}". Please analyze this document and extract the key information as if you could see its contents. Focus on identifying the main topics, key concepts, definitions, and important facts that would be relevant for creating educational materials using the Feynman Learning Technique.`;
  }
  
  // Regular content, return as is
  return content;
}

/**
 * Generate a study guide based on the provided content
 * @param content The content to generate a study guide from
 * @returns A promise that resolves to the generated study guide
 */
export async function generateStudyGuide(content: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig: {
        ...generationConfig,
        maxOutputTokens: 10000,
      },

    });

    const processedContent = processContent(content);
    const prompt = `
    Based on the following content, create a unique and original study guide that explains the concepts in your own words. Use the Feynman Learning Technique to break down complex ideas into simpler terms:
    ${processedContent}
    
    Important guidelines:
    1. DO NOT copy phrases directly from the source material
    2. Explain everything in your own words, as if you're teaching a friend
    3. Use original examples and analogies not found in the source material
    4. Focus on understanding and practical applications rather than memorization
    
    Please structure the study guide with:
    1. A brief introduction to the topic in everyday language
    2. Main concepts explained through original analogies and examples
    3. Real-world applications that demonstrate practical relevance
    4. Common questions and misconceptions addressed in conversational style
    5. Practice exercises or thought experiments to reinforce understanding
    6. A concise summary of key takeaways
    
    Format using Markdown with clear headings and bullet points. Remember to keep explanations original and avoid direct quotes from the source material.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error('Error generating study guide:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate study guide: ${error.message}`);
    }
    throw new Error('Failed to generate study guide due to an unknown error.');
  }
}

/**
 * Generate flashcards based on the provided content
 * @param content The content to generate flashcards from
 * @returns A promise that resolves to an array of flashcards
 */
export async function generateFlashcards(
  content: string
): Promise<Array<{ question: string; answer: string }>> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig: {
        ...generationConfig,
        maxOutputTokens: 10000,
      },
    });

    const processedContent = processContent(content);
    const prompt = `
    Create educational flashcards that promote deep learning by transforming this content into question-answer pairs. Follow these guidelines:

    1. Question Creation:
       - Ask "how" and "why" questions that require explanation
       - Create scenario-based questions that apply concepts
       - Ask for comparisons between related ideas
       - Request examples of practical applications

    2. Answer Formation:
       - Explain concepts using analogies and metaphors
       - Connect ideas to real-world examples
       - Break down complex processes into steps
       - Focus on understanding over memorization

    3. Avoid Direct Quotes:
       - Rephrase all content in your own words
       - Use different terminology while preserving meaning
       - Create original examples not found in the source
       - Synthesize information from multiple concepts

    Content to analyze:
    ${processedContent}

    Generate 15-20 flashcards formatted as a JSON array of objects with:
    {
      "question": "A thought-provoking question that tests understanding",
      "answer": "A clear, original explanation using analogies and examples"
    }
    Example:
    [
      {
        "question": "How would you explain photosynthesis to a 12-year-old?",
        "answer": "Photosynthesis is like a plant's way of making food. Plants use sunlight, water, and air to create sugar, which gives them energy to grow. During this process, they release oxygen that we breathe."
      }
    ]
    
    Return ONLY the JSON array with no additional text or explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    try {
      const sanitizedResponse = response
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Properly escape newlines
        .replace(/\r/g, '\\r') // Properly escape carriage returns
        .trim();

      try {
        // Try to parse the sanitized JSON directly
        return JSON.parse(sanitizedResponse);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = sanitizedResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) {
          throw new Error('Failed to parse flashcards from model response');
        }
        
        const flashcardsJson = jsonMatch[0];
        return JSON.parse(flashcardsJson);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate flashcards: ${error.message}`);
      }
      throw new Error('Failed to generate flashcards due to an unknown error.');
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
    throw new Error('Failed to generate flashcards due to an unknown error.');
  }
}

/**
 * Generate a quiz based on the provided content
 * @param content The content to generate a quiz from
 * @returns A promise that resolves to an array of quiz questions
 */
export async function generateQuiz(
  content: string,
  difficulty: QuestionDifficulty = QuestionDifficulty.BEGINNER,
  numQuestions: number = 20
): Promise<Array<QuizQuestion>> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig: {
        ...generationConfig,
        maxOutputTokens: 4096,
      },
    });

    const processedContent = processContent(content);
    
    // Adjust difficulty-specific requirements
    const difficultyRequirements = {
      [QuestionDifficulty.BEGINNER]: 'Focus on basic concepts and definitions. Questions should test fundamental understanding.',
      [QuestionDifficulty.INTERMEDIATE]: 'Include application of concepts and relationships between ideas. Questions should require deeper understanding.',
      [QuestionDifficulty.ADVANCED]: 'Focus on complex relationships and advanced applications. Include analysis and problem-solving.',
      [QuestionDifficulty.EXPERT]: 'Emphasize synthesis of multiple concepts and edge cases. Include challenging scenarios.',
      [QuestionDifficulty.MASTER]: 'Test mastery through complex problem-solving and deep conceptual understanding. Include expert-level applications.'
    }[difficulty];

    const prompt = `Based on the following content, create a ${difficulty} level quiz. Generate exactly ${numQuestions} unique multiple-choice questions.

${difficultyRequirements}

Content: ${processedContent}

For each question:
1. Make it ${difficulty} level difficulty
2. Include 4 options with one correct answer
3. Provide a clear explanation for the correct answer
4. Assign points based on difficulty (Beginner: 10, Intermediate: 20, Advanced: 30, Expert: 40, Master: 50)

Make sure:
1. Generate EXACTLY ${numQuestions} questions, no more and no less
2. Questions test understanding and application at ${difficulty} level
3. Options are clear and distinct
4. Explanations help understanding
5. All questions follow JSON format

Format the response as a JSON array with objects containing:
- question: string
- options: string[]
- correctAnswer: string (must be one of the options)
- explanation: string
- difficulty: string ("${difficulty}")
- points: number (${DIFFICULTY_POINTS[difficulty]} points per question)

IMPORTANT: The response MUST contain exactly ${numQuestions} questions. If you cannot generate ${numQuestions} unique questions, reuse concepts with different angles or examples.

    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    try {
      // Parse and validate the questions
      const questions = JSON.parse(response) as Array<QuizQuestion>;
      
      // Validate question count
      if (questions.length !== numQuestions) {
        console.warn(`Generated ${questions.length} questions instead of ${numQuestions}. Adjusting...`);
        
        // If we have too few questions, duplicate some
        while (questions.length < numQuestions) {
          const questionToCopy = questions[Math.floor(Math.random() * questions.length)];
          questions.push({
            ...questionToCopy,
            question: `Similar concept: ${questionToCopy.question}`,
          });
        }
        
        // If we have too many questions, take the first numQuestions
        if (questions.length > numQuestions) {
          questions.splice(numQuestions);
        }
      }
      
      // Ensure all questions have correct difficulty and points
      return questions.map(q => ({
        ...q,
        difficulty: difficulty,
        points: DIFFICULTY_POINTS[difficulty]
      }));
    } catch (e) {
      // If direct parsing fails, try to clean and extract JSON from the response
      let cleanedResponse = response
        .trim() // Remove leading/trailing whitespace
        .replace(/^[^[]*/, '') // Remove any text before the first [
        .replace(/][^]*$/, ']') // Remove any text after the last ]
        .replace(/[\u0000-\u001F]/g, '') // Remove control characters
        .replace(/([{[,]\s*)(\w+)\s*:/g, '$1"$2":') // Ensure property names are quoted
        .replace(/:\s*'([^']*)'/g, ':"$1"') // Convert single quotes to double quotes
        .replace(/([\[{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":'); // Ensure all keys are properly quoted

      try {
        const questions = JSON.parse(cleanedResponse) as Array<QuizQuestion>;
        // Validate and adjust question count
        if (questions.length !== numQuestions) {
          console.warn(`Generated ${questions.length} questions instead of ${numQuestions}. Adjusting...`);
          
          // If we have too few questions, duplicate some
          while (questions.length < numQuestions) {
            const questionToCopy = questions[Math.floor(Math.random() * questions.length)];
            questions.push({
              ...questionToCopy,
              question: `Similar concept: ${questionToCopy.question}`,
            });
          }
          
          // If we have too many questions, take the first numQuestions
          if (questions.length > numQuestions) {
            questions.splice(numQuestions);
          }
        }
        
        // Ensure all questions have correct difficulty and points
        return questions.map(q => ({
          ...q,
          difficulty: difficulty,
          points: DIFFICULTY_POINTS[difficulty]
        }));
      } catch (e2) {
        // If cleaning didn't help, try to extract JSON array pattern
        const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) {
          // Log the raw response for debugging
          console.error('Failed to parse quiz response. Raw response:', response);
          throw new Error(`Failed to parse quiz response for ${difficulty} level`);
        }
        
        try {
          const quizJson = jsonMatch[0];
          const questions = JSON.parse(quizJson) as Array<QuizQuestion>;
          
          // Validate question structure
          const invalidQuestions = questions.filter(q => {
            return !q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
                   !q.correctAnswer || !q.explanation;
          });
          
          if (invalidQuestions.length > 0) {
            console.error('Invalid question structure:', invalidQuestions);
            throw new Error(`Invalid question structure in ${difficulty} level quiz`);
          }
          
          // Validate and adjust question count
          if (questions.length < numQuestions / 2) {
            // If we have less than half the required questions, something went wrong
            throw new Error(`Not enough valid questions generated for ${difficulty} level`);
          }
          
          // Adjust question count if needed
          if (questions.length !== numQuestions) {
            console.warn(`Generated ${questions.length} questions instead of ${numQuestions}. Adjusting...`);
            
            // If we have too few questions, duplicate some with variations
            while (questions.length < numQuestions) {
              const questionToCopy = questions[Math.floor(Math.random() * questions.length)];
              const newQuestion = {
                ...questionToCopy,
                question: `Similar concept: ${questionToCopy.question}`,
                explanation: `Alternative explanation: ${questionToCopy.explanation}`
              };
              questions.push(newQuestion);
            }
            
            // If we have too many questions, take a random subset to maintain variety
            if (questions.length > numQuestions) {
              const shuffled = [...questions].sort(() => Math.random() - 0.5);
              questions.length = 0;
              questions.push(...shuffled.slice(0, numQuestions));
            }
          }
          
          // Ensure all questions have correct difficulty and points
          return questions.map(q => ({
            ...q,
            difficulty: difficulty,
            points: DIFFICULTY_POINTS[difficulty]
          }));
        } catch (error) {
          console.error('Error processing quiz JSON:', error);
          throw new Error(`Failed to process ${difficulty} level quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
    throw new Error('Failed to generate quiz due to an unknown error.');
  }
}

// Define the chat message type
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

// Define quiz question difficulty levels with corresponding point values
export enum QuestionDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
  MASTER = 'Master'
}

export const DIFFICULTY_POINTS: Record<QuestionDifficulty, number> = {
  [QuestionDifficulty.BEGINNER]: 10,
  [QuestionDifficulty.INTERMEDIATE]: 20,
  [QuestionDifficulty.ADVANCED]: 30,
  [QuestionDifficulty.EXPERT]: 40,
  [QuestionDifficulty.MASTER]: 50
};

export const DIFFICULTY_ORDER: QuestionDifficulty[] = [
  QuestionDifficulty.BEGINNER,
  QuestionDifficulty.INTERMEDIATE,
  QuestionDifficulty.ADVANCED,
  QuestionDifficulty.EXPERT,
  QuestionDifficulty.MASTER
];

// Define quiz question type with scoring
export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  points: number;
};

/**
 * Chat with the AI about the provided content
 * @param messages The chat history
 * @param content The reference content
 * @returns A promise that resolves to the AI's response
 */
export async function chatWithAI(
  messages: Array<ChatMessage>,
  content: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig,
    });

    // Start a chat session
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig,
    });

    const processedContent = processContent(content);
    // Add context about the content
    const contextMessage = `
    I want you to act as a helpful educational AI assistant using the Feynman Learning Technique. 
    I'm studying the following material:
    
    ${processedContent}
    
    Please help me understand this material by answering my questions about it.
    When explaining concepts:
    1. Use simple, plain language as if I'm a beginner
    2. Use analogies and examples to make complex ideas intuitive
    3. Break down complicated topics into smaller, easier-to-understand parts
    4. Avoid unnecessary jargon, and when you must use technical terms, explain them
    
    Base your answers on the provided content and your knowledge.
    If you don't know the answer or if it's not related to the content, please say so.
    `;

    // Send the context message first if this is the first message
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'user')) {
      await chat.sendMessage(contextMessage);
    }

    // Get the user's latest message
    const userMessage = messages[messages.length - 1].content;
    
    // Send the user's message and get the response
    const result = await chat.sendMessage(userMessage);
    const response = await result.response.text();
    
    return response;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get a response: ${error.message}`);
    }
    throw new Error('Failed to get a response due to an unknown error.');
  }
}

/**
 * Extract key information from uploaded documents
 * @param content The content to extract information from
 * @returns A promise that resolves to the extracted information
 */
export interface ConceptMapNode {
  id: number;
  label: string;
  level: number;
  category?: string;
  description?: string;
  examples?: string[];
}

export interface ConceptMapEdge {
  id: number;
  from: number;
  to: number;
  label?: string;
  type?: string;
}

export interface ConceptMap {
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
}

export interface ConceptMap {
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
}

/**
 * Validates and adjusts a concept map to ensure it meets our requirements
 */
function validateAndAdjustConceptMap(conceptMap: ConceptMap): ConceptMap {
  if (!conceptMap.nodes || !Array.isArray(conceptMap.nodes)) {
    throw new Error('Invalid concept map: missing or invalid nodes array');
  }

  if (!conceptMap.edges || !Array.isArray(conceptMap.edges)) {
    throw new Error('Invalid concept map: missing or invalid edges array');
  }

  // Ensure we have enough nodes
  if (conceptMap.nodes.length < 15) {
    console.warn(`Generated ${conceptMap.nodes.length} nodes instead of at least 15. Adjusting...`);
    
    // If we have too few nodes, duplicate some with variations
    while (conceptMap.nodes.length < 15) {
      const nodeToCopy = conceptMap.nodes[Math.floor(Math.random() * conceptMap.nodes.length)];
      const newNode = {
        ...nodeToCopy,
        id: conceptMap.nodes.length + 1,
        label: `Related concept: ${nodeToCopy.label}`,
        description: `Alternative perspective on ${nodeToCopy.label}`,
        examples: [...(nodeToCopy.examples || [])]
      };
      
      // Add an edge from the original to the new node
      conceptMap.edges.push({
        id: conceptMap.edges.length + 1,
        from: nodeToCopy.id,
        to: newNode.id,
        label: 'relates to',
        type: 'relationship'
      });
      
      conceptMap.nodes.push(newNode);
    }
  }

  // Ensure all nodes have required fields
  conceptMap.nodes = conceptMap.nodes.map(node => ({
    ...node,
    level: node.level || 1,
    category: node.category || 'Concept',
    description: node.description || `Understanding of ${node.label}`,
    examples: node.examples || []
  }));

  // Ensure all edges have required fields
  conceptMap.edges = conceptMap.edges.map(edge => ({
    ...edge,
    label: edge.label || 'relates to',
    type: edge.type || 'relationship'
  }));

  return conceptMap;
}

export async function generateConceptMap(content: string): Promise<ConceptMap> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig,
    });

    const processedContent = processContent(content);
    const prompt = `
    Analyze the following content and synthesize it into an insightful concept map that reveals key relationships and patterns. Your goal is to help learners understand, retain, and recall the information through meaningful connections:
    ${processedContent}

    Create a concept map that emphasizes:

    1. Core Concepts & Principles:
       - Identify fundamental ideas that form the foundation
       - Show how these core concepts influence or enable other concepts
       - Highlight key principles that recur throughout the content

    2. Meaningful Relationships:
       - Connect related concepts with specific relationship types:
         * Cause and Effect: "leads to", "results in", "triggers"
         * Dependencies: "requires", "depends on", "enables"
         * Classifications: "type of", "example of", "category of"
         * Processes: "flows to", "transforms into", "cycles through"
         * Support: "strengthens", "enhances", "reinforces"

    3. Cross-Disciplinary Connections:
       - Identify concepts that bridge multiple topics
       - Show how different areas influence each other
       - Highlight patterns that emerge across different sections

    4. Practical Applications:
       - Link theoretical concepts to real-world examples
       - Show how concepts apply in different contexts
       - Connect abstract ideas to concrete implementations

    5. Knowledge Building:
       - Show prerequisites and advanced concepts
       - Indicate which concepts build upon others
       - Mark difficulty levels (1=foundational, 2=intermediate, 3=advanced)

    6. Problem-Solving Paths:
       - Show how different concepts combine to solve problems
       - Highlight decision points and alternative approaches
       - Indicate best practices and common pitfalls
    
    Format your response as a valid JSON object with:
    1. nodes: Array of {
       id: number, 
       label: string,
       level: number,
       category: string,
       description: string,
       examples: string[]
    }
    2. edges: Array of {
       id: number,
       from: number,
       to: number,
       label: string,
       type: string
    }
    
    Example format:
    {
      "nodes": [
        {
          "id": 1,
          "label": "Information Security",
          "level": 1,
          "category": "Core Concept",
          "description": "The practice of protecting information from unauthorized access",
          "examples": ["Encryption", "Access Control"]
        }
      ],
      "edges": [
        {
          "id": 1,
          "from": 1,
          "to": 2,
          "label": "implements",
          "type": "implementation"
        }
      ]
    }
    
    Ensure the concept map:
    - Has at least 15-20 interconnected nodes
    - Uses meaningful relationship labels
    - Includes practical examples
    - Shows clear hierarchical structure
    - Highlights cross-disciplinary connections
    
    Return ONLY the JSON object with no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    try {
      // First try direct parsing
      let conceptMap = JSON.parse(response) as ConceptMap;
      return validateAndAdjustConceptMap(conceptMap);
    } catch (e) {
      // If direct parsing fails, try to clean the response
      try {
        // Remove markdown formatting if present
        let cleanedResponse = response
          .replace(/^```json\s*/, '') // Remove leading ```json
          .replace(/\s*```$/, '') // Remove trailing ```
          .trim();

        // Try to parse the cleaned response
        let conceptMap = JSON.parse(cleanedResponse) as ConceptMap;
        return validateAndAdjustConceptMap(conceptMap);
      } catch (e2) {
        // If cleaning didn't help, try to extract JSON object pattern
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('Error parsing concept map:', e2);
          throw new Error('Failed to parse concept map - no valid JSON found');
        }
        
        try {
          let conceptMap = JSON.parse(jsonMatch[0]) as ConceptMap;
          return validateAndAdjustConceptMap(conceptMap);
        } catch (e3) {
          console.error('Error parsing extracted JSON:', e3);
          throw new Error('Failed to parse concept map - invalid JSON structure');
        }
      }
    }
  } catch (error) {
    console.error('Error generating concept map:', error);
    throw new Error('Failed to generate concept map: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function extractInformation(content: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      safetySettings,
      generationConfig,
    });

    const processedContent = processContent(content);
    const prompt = `
    Extract and summarize the key information from the following content using the Feynman Learning Technique:
    ${processedContent}
    
    The Feynman Learning Technique involves explaining concepts in simple, plain language as if teaching a beginner.
    
    Please identify and explain in simple terms:
    1. Main topics and themes
    2. Key concepts and how they work
    3. Important relationships between ideas
    4. Practical applications or examples
    5. Any notable insights or conclusions
    
    Format your response using Markdown with appropriate headings, bullet points, and emphasis.
    Focus on making complex ideas intuitive and accessible.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error('Error extracting information:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract information: ${error.message}`);
    }
    throw new Error('Failed to extract information due to an unknown error.');
  }
}

export interface ExamQuestion {
  id: string;
  type: 'essay' | 'shortAnswer' | 'problemSolving' | 'multipleChoice';
  question: string;
  points: number;
  options?: string[];
  correctOption?: number;
  rubric: string;
}

export interface Exam {
  id: string;
  questions: ExamQuestion[];
  duration: number;
}

// Utility function to sanitize Gemini response
const sanitizeResponse = (response: string): string => {
  try {
    // Remove any non-JSON content before the first {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    const jsonStr = response.slice(jsonStart, jsonEnd);
    
    // Remove control characters and properly escape newlines
    return jsonStr
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\r?\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .trim();
  } catch (error) {
    console.error('Error sanitizing response:', error);
    throw new Error('Failed to sanitize the AI response');
  }
};

export const generateExam = async (content: string, duration: number): Promise<Exam> => {
  const prompt = `
    You are an expert educator tasked with creating an exam based on the following study material.
    Generate a comprehensive exam that tests understanding and knowledge of the provided content.

    Create exactly:
    - 10 multiple choice questions (with 4 options each)
    - 10 short answer questions
    - 5 problem solving questions
    - 5 essay questions

    For each question:
    1. The question should directly test concepts from the provided content
    2. Include clear grading criteria in the rubric
    3. For multiple choice: provide 4 distinct options and mark the correct one
    4. For problem solving and essay: include detailed evaluation criteria

    Points allocation:
    - Multiple Choice: 1 point each
    - Short Answer: 2 points each
    - Problem Solving: 5 points each
    - Essay: 5 points each

    Study Material:
    ${content}

    Return ONLY a JSON object in this exact format, with no additional text or explanations:
    {
      "questions": [
        {
          "type": "multipleChoice",
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correctOption": 0,
          "points": 1,
          "rubric": "..."
        },
        {
          "type": "shortAnswer",
          "question": "...",
          "points": 2,
          "rubric": "..."
        }
      ]
    }
  `;

  try {
    console.log('Generating exam with content:', content.substring(0, 100) + '...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log('Raw response:', response);
    
    const sanitizedResponse = sanitizeResponse(response);
    console.log('Sanitized response:', sanitizedResponse);
    
    const examData = JSON.parse(sanitizedResponse);
    
    if (!examData.questions || !Array.isArray(examData.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    // Validate each question
    const validTypes = ['multipleChoice', 'shortAnswer', 'problemSolving', 'essay'];
    examData.questions.forEach((q: any, index: number) => {
      if (!validTypes.includes(q.type)) {
        throw new Error(`Invalid question type at index ${index}: ${q.type}`);
      }
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Invalid question text at index ${index}`);
      }
      if (!q.points || typeof q.points !== 'number') {
        throw new Error(`Invalid points at index ${index}`);
      }
      if (q.type === 'multipleChoice' && (!Array.isArray(q.options) || q.options.length !== 4)) {
        throw new Error(`Invalid options for multiple choice question at index ${index}`);
      }
    });

    return {
      id: crypto.randomUUID(),
      questions: examData.questions.map((q: any) => ({
        id: crypto.randomUUID(),
        ...q
      })),
      duration
    };
  } catch (error) {
    console.error('Failed to generate exam:', error);
    throw new Error('Failed to generate exam. Please check the console for details.');
  }
};

export interface GradingState {
  isGrading: boolean;
  error?: string;
}

export interface AIGradingResponse {
  questionScores: Record<string, number>;
  feedback: Record<string, string>;
  improvements: Record<string, string[]>;
  keyConcepts: Record<string, string[]>;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ExamReport {
  score: number;
  questionScores: Record<string, number>;
  feedback: Record<string, string>;
  improvements: Record<string, string[]>;
  keyConcepts: Record<string, string[]>;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

export const gradeExam = async (
  exam: Exam,
  answers: Record<string, string>,
  onStateChange?: (state: GradingState) => void
): Promise<ExamReport> => {
  try {
    // Set loading state
    onStateChange?.({ isGrading: true });
  // --- Prompt Construction ---
  const prompt = `You are an experienced teacher grading a student's exam. Provide detailed, constructive feedback that helps the student understand their mistakes and how to improve. Focus on being supportive while maintaining high academic standards.

**Instructions:**
1. **Evaluate Each Answer:**
   - For Multiple Choice: Full points for correct answer, 0 for incorrect
   - For other types: Grade based on the rubric criteria
   - Always grade the STUDENT'S actual answer, not any AI-generated content

2. **Provide Detailed Feedback:**
   When giving feedback, follow this structure:
   - Start with what the student did well (in green): '<span class="text-green-500">Good understanding of [specific concept]...</span>'
   - For mistakes, explain why they're wrong (in red): '<span class="text-red-500">Your answer about [X] shows a misunderstanding because [detailed explanation]...</span>'
   - Give specific improvement suggestions (in yellow): '<span class="text-yellow-500">To improve, focus on [specific aspect] by [actionable step]...</span>'

3. **Improvement Suggestions:**
   - Give 1-2 specific, actionable suggestions
   - Focus on what the student can do better next time

4. **Key Concepts:**
   - List EXACTLY 4 main concepts needed to answer the question
   - Choose the most fundamental concepts if there are more
   - Make them clear and specific to the question

5. **Response Format:**
   Return a JSON object with:
   - questionScores: Points earned per question
   - feedback: Detailed, colored feedback for each answer
   - improvements: Specific, actionable suggestions
   - keyConcepts: 4 key concepts per question
   - overallFeedback: A supportive teacher's remarks about overall performance
   - strengths: List of 2-3 areas where the student showed good understanding
   - weaknesses: List of 2-3 areas needing improvement

**JSON Output Format:**
\`\`\`json
{
  "questionScores": {
    "<question_id>": <points_earned_for_this_question>
    // Repeat for each question_id
  },
  "feedback": {
    "<question_id>": "<Detailed, constructive feedback explaining the score based on the answer and rubric/correct option. Explain misunderstandings if any.>"
    // Repeat for each question_id
  },
  "improvements": {
    "<question_id>": [
      "<Actionable suggestion 1>",
      "<Actionable suggestion 2>"
      // Provide 1-2 suggestions
    ]
    // Repeat for each question_id
  },
  "keyConcepts": {
     "<question_id>": [
        "<Relevant concept 1>",
        "<Relevant concept 2>"
        // List key concepts for this specific question
     ]
     // Repeat for each question_id
  }
}
\`\`\`

**Exam Details & Student Answers:**

${exam.questions.map(q => `
---
Question ID: ${q.id}
Type: ${q.type}
Points Possible: ${q.points}
Question Text: ${q.question}
${q.type === 'multipleChoice' ? `Options: ${q.options?.join(' | ')}
Correct Option: ${q.options?.[q.correctOption || 0]}` : ''}
${q.rubric ? `Rubric: ${q.rubric}` : 'Rubric: N/A (Grade based on correctness for non-MCQ types if no rubric provided)'}
Student Answer: ${answers[q.id] || 'No Answer Provided'}
---
`).join('\n')}

Begin JSON output now:
`;

  // --- AI Call and Processing ---
    console.log('Grading exam with prompt...');

    // Add explicit JSON format to prompt
    const promptWithFormat = `${prompt}

Please respond ONLY with a valid JSON object in this exact format:
{
  "questionScores": { "questionId": "number" },
  "feedback": { "questionId": "string" },
  "improvements": { "questionId": ["string"] },
  "keyConcepts": { "questionId": ["string"] },
  "overallFeedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"]
}

Input data:
${JSON.stringify({ exam, answers }, null, 2)}`;

    const result = await model.generateContent(promptWithFormat);

    const response = await result.response.text();
    console.log('Raw AI response:', response);

    // More robust JSON extraction
    let jsonStr = '';
    
    // First try to find JSON between code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // If no code blocks, try to find a JSON object directly
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0].trim();
      }
    }

    if (!jsonStr) {
      console.error('No JSON found in response');
      throw new Error('Invalid response format: No JSON found');
    }

    // Clean up common JSON issues
    jsonStr = jsonStr
      // Remove any non-JSON text before the first {
      .replace(/^[^{]*({.*})[^}]*$/, '$1')
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      // Fix trailing commas
      .replace(/,\s*([}\]])/g, '$1')
      // Fix missing quotes around property names
      .replace(/([{,]\s*)([\w]+)\s*:/g, '$1"$2":')
      // Escape newlines in strings
      .replace(/(["'])([^"']*?)\n([^"']*?)(["'])/g, '$1$2\\n$3$4')
      // Remove any remaining newlines outside of strings
      .replace(/\s*\n\s*/g, ' ')
      // Ensure proper string values
      .replace(/:\s*([^\s"'\[{][^,}\]]*)/g, ': "$1"')
      // Fix double quotes
      .replace(/"{2,}/g, '"')
      // Remove any remaining whitespace between tokens
      .replace(/\s+/g, ' ').trim()
    console.log('Cleaned JSON string:', jsonStr);

    let partialReport: AIGradingResponse;
    try {
      // Try to parse the cleaned JSON
      partialReport = JSON.parse(jsonStr) as AIGradingResponse;
      console.log('Successfully parsed JSON:', partialReport);
    } catch (error: any) {
      console.error('Failed to parse JSON:', error);
      console.error('JSON string that failed:', jsonStr);
      
      // Try to identify the specific issue
      const position = error.message.match(/position (\d+)/)?.[1];
      if (position) {
        const problemArea = jsonStr.substring(Math.max(0, Number(position) - 20), 
                                           Math.min(jsonStr.length, Number(position) + 20));
        console.error(`Problem area in JSON (around position ${position}):`, problemArea);
      }
      
      throw new Error(`Failed to parse grading response: ${error?.message || 'Unknown error'}`);
    }

    // Validate required fields
    if (!partialReport.questionScores || !partialReport.feedback || 
        !partialReport.improvements || !partialReport.keyConcepts) {
      console.error('Missing required fields in response:', partialReport);
      throw new Error('Invalid response format: Missing required fields');
    }

    // Initialize new fields if they don't exist
    partialReport.overallFeedback = partialReport.overallFeedback || '';
    partialReport.strengths = partialReport.strengths || [];
    partialReport.weaknesses = partialReport.weaknesses || [];

    // --- Validation ---
    // Validate required fields exist
    if (!partialReport.questionScores || typeof partialReport.questionScores !== 'object' ||
        !partialReport.feedback || typeof partialReport.feedback !== 'object' ||
        !partialReport.improvements || typeof partialReport.improvements !== 'object' ||
        !partialReport.keyConcepts || typeof partialReport.keyConcepts !== 'object') {
      console.error('Invalid report format - missing or incorrect top-level keys:', partialReport);
      throw new Error('Invalid report format received from AI');
    }

    // Validate and format the report
    for (const question of exam.questions) {
      // Validate scores
      if (partialReport.questionScores[question.id] === undefined || typeof partialReport.questionScores[question.id] !== 'number') {
        console.error(`Missing or invalid score for question ${question.id}`);
        partialReport.questionScores[question.id] = 0;
        partialReport.feedback[question.id] = '<span class="text-red-500">Score could not be determined. Please review this answer manually.</span>';
      }

      // Ensure feedback has proper HTML formatting
      if (!partialReport.feedback[question.id]) {
        partialReport.feedback[question.id] = '<span class="text-yellow-500">No feedback available.</span>';
      } else {
        // Fix any escaped HTML tags
        partialReport.feedback[question.id] = partialReport.feedback[question.id]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\\n/g, '<br/>');
      }

      // Ensure improvements exist
      if (!partialReport.improvements[question.id] || !partialReport.improvements[question.id].length) {
        partialReport.improvements[question.id] = ['Review the material and try again.'];
      }

      // Ensure exactly 4 key concepts
      if (!partialReport.keyConcepts[question.id] || !partialReport.keyConcepts[question.id].length) {
        partialReport.keyConcepts[question.id] = [
          'Understanding of core concepts',
          'Application of knowledge',
          'Critical thinking',
          'Problem-solving skills'
        ];
      } else if (partialReport.keyConcepts[question.id].length > 4) {
        partialReport.keyConcepts[question.id] = partialReport.keyConcepts[question.id].slice(0, 4);
      } else while (partialReport.keyConcepts[question.id].length < 4) {
        partialReport.keyConcepts[question.id].push(
          ['Critical thinking', 'Problem-solving', 'Concept application', 'Knowledge integration'][partialReport.keyConcepts[question.id].length]
        );
      }
    }

    // Calculate total score
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = Object.values(partialReport.questionScores).reduce((sum: number, score: number) => sum + score, 0);
    const scorePercentage = (earnedPoints / totalPoints) * 100;

    // Generate overall feedback if not provided
    if (!partialReport.overallFeedback) {
      const performanceLevel = scorePercentage >= 90 ? 'excellent' :
                             scorePercentage >= 80 ? 'very good' :
                             scorePercentage >= 70 ? 'good' :
                             scorePercentage >= 60 ? 'fair' : 'needs improvement';
      
      partialReport.overallFeedback = `<span class="text-${scorePercentage >= 60 ? 'green' : 'yellow'}-500">
        Your overall performance was ${performanceLevel} (${Math.round(scorePercentage)}%). 
        ${scorePercentage >= 60 ?
          'You demonstrated good understanding in several areas.' :
          'While there are areas for improvement, keep working hard and you will see progress.'}
      </span>`;
    }

    // Ensure strengths and weaknesses exist
    if (!partialReport.strengths || !partialReport.strengths.length) {
      partialReport.strengths = ['Effort in attempting all questions'];
    }
    if (!partialReport.weaknesses || !partialReport.weaknesses.length) {
      partialReport.weaknesses = ['Areas identified for improvement'];
    }

    const finalReport: ExamReport = {
      score: scorePercentage,
      questionScores: partialReport.questionScores,
      feedback: partialReport.feedback,
      improvements: partialReport.improvements,
      keyConcepts: partialReport.keyConcepts,
      overallFeedback: partialReport.overallFeedback,
      strengths: partialReport.strengths,
      weaknesses: partialReport.weaknesses
    };

    console.log('Successfully processed grading report.');
    return finalReport;

  } catch (error: unknown) {
    console.error('Error grading exam:', error);
    // Set error state and rethrow
    onStateChange?.({ isGrading: false, error: error instanceof Error ? error.message : String(error) });
    throw new Error(`Failed to grade exam: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Reset loading state
    onStateChange?.({ isGrading: false });
  }
};
