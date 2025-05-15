import { Home, Upload, BookOpen, User, Library, GraduationCap, BarChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthTrigger } from '../auth/AuthTrigger';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar = ({ isOpen, onClose, isMobile = false }: SidebarProps) => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart, requiresAuth: true },
    { path: '/upload', label: 'Upload', icon: Upload, requiresAuth: true },
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
          className="fixed inset-0 bg-text dark:bg-text-dark bg-opacity-30 backdrop-blur-sm z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        className={`fixed top-0 left-0 h-full z-30 ${
          isMobile ? 'w-64' : 'w-20 hover:w-64'
        } bg-paper dark:bg-paper-dark border-r border-secondary dark:border-secondary-dark transition-all duration-300 flex flex-col`}
        initial={isMobile ? 'closed' : 'open'}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 py-8 flex items-center justify-center border-b border-secondary dark:border-secondary-dark">
          <h2 className={`font-sans font-bold text-2xl text-accent ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
            <div className="w-8 h-8 bg-leather rounded-lg flex items-center justify-center text-paper font-heading">
              SF
            </div>
          </h2>
          {!isMobile && !isOpen && (
            <div className="w-8 h-8 bg-leather rounded-lg flex items-center justify-center text-paper font-heading">
              S
            </div>
          )}
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                {item.requiresAuth ? (
                  <AuthTrigger returnUrl={item.path}>
                    <div
                      className={`
                        flex items-center py-3 px-4 rounded-xl transition-all duration-300
                        hover:bg-secondary dark:hover:bg-secondary-dark
                        ${!isMobile && !isOpen ? 'justify-center' : 'justify-start'}
                        cursor-pointer
                      `}
                    >
                      <item.icon size={20} className="min-w-[20px]" />
                      <span className={`ml-4 truncate ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
                        {item.label}
                      </span>
                    </div>
                  </AuthTrigger>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center py-3 px-4 rounded-xl transition-all duration-300
                      ${isActive ? 'neu-button' : 'hover:bg-secondary dark:hover:bg-secondary-dark'}
                      ${!isMobile && !isOpen ? 'justify-center' : 'justify-start'}
                    `}
                  >
                    <item.icon size={20} className="min-w-[20px]" />
                    <span className={`ml-4 truncate ${!isMobile && !isOpen ? 'hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>


      </motion.aside>
    </>
  );
};

export default Sidebar;
