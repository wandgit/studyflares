import { Moon, Sun, Menu, User } from 'lucide-react';
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
    <header className="sticky top-0 z-10 bg-paper dark:bg-paper-dark p-4 flex items-center border-b border-secondary dark:border-secondary-dark">
      <div className="w-1/4 flex items-center">
        {isMobile && toggleSidebar && (
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark rounded-lg"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
      <div className="w-1/2 flex justify-center">
        <Link to="/">
          <h1 className="text-2xl font-heading text-accent">StudyFlares</h1>
        </Link>
      </div>
      <div className="w-1/4 flex justify-end gap-4">
        <button 
          onClick={toggleDarkMode} 
          className="p-2 hover:bg-secondary rounded-lg"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark rounded-lg"
          >
            <User size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-paper dark:bg-paper-dark rounded-lg shadow-lg border border-secondary dark:border-secondary-dark">
              <div className="py-1">
                <Link to="/profile" className="block px-4 py-2 hover:bg-secondary dark:hover:bg-secondary-dark rounded-md">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-secondary dark:hover:bg-secondary-dark rounded-md">Settings</Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-secondary dark:hover:bg-secondary-dark rounded-md">Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
