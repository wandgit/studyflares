import { useState, useEffect, ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  console.log('MainLayout rendering');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize to toggle between mobile and desktop layouts
  useEffect(() => {
    console.log('MainLayout useEffect running');
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close sidebar by default on mobile, open by default on desktop
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-paper dark:bg-paper-dark text-text dark:text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isMobile={isMobile} />

      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-20 md:ml-20' : 'ml-0')
        }`}
      >
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-paper dark:bg-paper-dark pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
