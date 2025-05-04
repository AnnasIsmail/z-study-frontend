import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  History as HistoryIcon, 
  Settings, 
  User, 
  LogOut, 
  Plus, 
  ChevronLeft, 
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useThemeStore } from '../../stores/themeStore';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isMobile, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { createNewSession } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleNewChat = () => {
    const newSessionId = createNewSession();
    navigate(`/chat/${newSessionId}`);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <MessageSquare size={20} />, label: 'Chat', path: '/chat' },
    { icon: <HistoryIcon size={20} />, label: 'History', path: '/history' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div
      initial={isMobile ? { x: '-100%' } : false}
      animate={{ x: 0 }}
      exit={isMobile ? { x: '-100%' } : false}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">AI Assistant</h1>
        )}
        
        <div className="flex items-center">
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft 
                size={20} 
                className={cn(
                  "transition-transform",
                  collapsed && "rotate-180"
                )} 
              />
            </Button>
          )}
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu size={20} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <Button
          onClick={handleNewChat}
          className={cn(
            "mb-4 transition-all",
            collapsed ? "mx-2 w-10 p-0" : "mx-4"
          )}
        >
          <Plus size={20} />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => cn(
                "flex items-center px-2 py-2 rounded-md font-medium text-sm",
                "transition-colors duration-200",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                collapsed && "justify-center"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "md"}
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center"
          )}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={20} />
              {!collapsed && <span className="ml-2">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={20} />
              {!collapsed && <span className="ml-2">Dark Mode</span>}
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "md"}
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-2">Log Out</span>}
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

// Import cn locally to avoid circular dependency
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}