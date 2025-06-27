import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">Platform</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon={isDark ? Sun : Moon}
              onClick={toggleTheme}
              className="p-2"
            />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Rp {user?.balance.toLocaleString('id-ID')}
                </span>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" icon={User} />
                </Link>
                <Button variant="ghost" size="sm" icon={LogOut} onClick={logout} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;