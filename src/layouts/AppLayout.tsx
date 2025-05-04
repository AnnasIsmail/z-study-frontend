import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import Sidebar from '../components/Layout/Sidebar';
import Button from '../components/ui/Button';

const AppLayout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="fixed inset-y-0 left-0 w-full max-w-xs">
              <Sidebar isMobile onClose={() => setShowMobileSidebar(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary">AI Assistant</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;