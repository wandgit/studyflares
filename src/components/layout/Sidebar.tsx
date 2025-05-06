import { Home, Upload, BookOpen, User, Library, GraduationCap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar = ({ isOpen, onClose, isMobile = false }: SidebarProps) => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/study', label: 'Study', icon: BookOpen },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/exam', label: 'Exam', icon: GraduationCap },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-text bg-opacity-30 backdrop-blur-sm z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        className={`fixed top-0 left-0 h-full z-30 ${
          isMobile ? 'w-64' : 'w-20 hover:w-64'
        } bg-paper border-r border-secondary transition-all duration-300 flex flex-col`}
        initial={isMobile ? 'closed' : 'open'}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 py-8 flex items-center justify-center border-b border-secondary">
          <h2 className={`font-handwriting font-bold text-2xl text-leather ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
            EduAI
          </h2>
          {!isMobile && !isOpen && (
            <span className="font-handwriting font-bold text-2xl text-leather">E</span>
          )}
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center py-3 px-4 rounded-xl transition-all duration-300
                    ${isActive ? 'neu-button' : 'hover:bg-secondary'}
                    ${!isMobile && !isOpen ? 'justify-center' : 'justify-start'}
                  `}
                >
                  <item.icon size={20} className="min-w-[20px]" />
                  <span className={`ml-4 truncate ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-secondary">
          <div className={`neu-card p-4 ${!isMobile && !isOpen ? 'items-center justify-center' : ''}`}>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-leather flex items-center justify-center text-paper font-medium">
                U
              </div>
              <div className={`ml-3 ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-text opacity-60">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
