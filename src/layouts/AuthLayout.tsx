import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquareText } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand Section */}
      <motion.div 
        className="bg-primary text-primary-foreground flex flex-col justify-center p-8 md:w-1/2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <MessageSquareText size={48} />
            <h1 className="text-4xl font-bold ml-4">AI Assistant</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">
            Your personal AI assistant, made smarter
          </h2>
          
          <p className="text-lg opacity-90 mb-8">
            Experience the power of advanced LLM technology with a beautiful, intuitive interface designed for productive conversations.
          </p>
          
          <ul className="space-y-4">
            {[
              'Access to multiple AI models',
              'Real-time streaming responses',
              'Chat history and organization',
              'Customizable UI with light/dark mode'
            ].map((feature, index) => (
              <motion.li 
                key={index}
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index + 0.5 }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  ✓
                </span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
      
      {/* Auth Form Section */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;