import { Moon, Sun, Menu } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar?: () => void;
  isMobile?: boolean;
}

const Header = ({ toggleSidebar, isMobile = false }: HeaderProps) => {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-10 bg-paper p-4 flex items-center justify-between border-b border-secondary">
      <div className="flex items-center">
        {isMobile && toggleSidebar && (
          <button 
            onClick={toggleSidebar} 
            className="mr-4 p-2 neu-button flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-handwriting font-bold text-leather">EduAI Companion</h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode} 
          className="neu-button p-2 flex items-center justify-center"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="neu-button w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
            aria-label="User menu"
          >
            <span className="text-sm font-medium">U</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 neu-card">
              <div className="py-1">
                <Link to="/profile" className="block px-4 py-2 hover:bg-secondary rounded-md">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-secondary rounded-md">Settings</Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-md">Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
