import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Home, User, BookOpen, LogOut } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/study', label: 'Study', icon: <Book size={20} /> },
    { path: '/library', label: 'Library', icon: <BookOpen size={20} /> },
    // Community feature temporarily disabled
    // { path: '/community', label: 'Community', icon: <Users size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Desktop navigation - only logo and logout */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-paper shadow-md z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="font-handwriting text-2xl text-leather">Study Flares</span>
              </Link>
            </div>
            
            {/* Removed navigation links for desktop view */}
            
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center">
                  <span className="mr-3 text-sm">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary"
                    title="Logout"
                  >
                    <LogOut size={20} />
                    <span className="ml-2">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-paper shadow-lg border-t border-secondary z-50">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center ${location.pathname === item.path ? 'text-leather' : 'text-text hover:text-leather'}`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
