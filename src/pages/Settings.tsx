import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, Key, AlertCircle, Check, Moon, Sun, Monitor } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useThemeStore } from '../stores/themeStore';
import axios from 'axios';
import { API_URL } from '../config';

interface APISettingsFormData {
  apiKey: string;
}

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<APISettingsFormData>();
  
  const onSubmitAPIKey = async (data: APISettingsFormData) => {
    try {
      setApiError(null);
      setApiSuccess(null);
      
      const response = await axios.post(`${API_URL}/api/config/openrouter`, {
        api_key: data.apiKey
      });
      
      if (response.data.success) {
        setApiSuccess('API key set successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setApiSuccess(null), 3000);
      }
    } catch (err: any) {
      setApiError(err.response?.data?.error?.message || 'Failed to set API key. Please try again.');
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience and configure API settings
        </p>
      </header>
      
      <div className="space-y-8">
        {/* Appearance Settings */}
        <motion.section 
          className="bg-card rounded-lg p-6 shadow-sm border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Choose your preferred theme
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex items-center"
                onClick={() => setTheme('light')}
              >
                <Sun size={18} className="mr-2" />
                Light
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex items-center"
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} className="mr-2" />
                Dark
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  setTheme(prefersDark ? 'dark' : 'light');
                }}
              >
                <Monitor size={18} className="mr-2" />
                System
              </Button>
            </div>
          </div>
        </motion.section>
        
        {/* API Settings */}
        <motion.section 
          className="bg-card rounded-lg p-6 shadow-sm border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4">API Settings</h2>
          
          {apiError && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}
          
          {apiSuccess && (
            <div className="mb-6 p-3 bg-success/10 text-success rounded-md flex items-start">
              <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{apiSuccess}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmitAPIKey)} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                OpenRouter API Key
              </label>
              <Input
                id="apiKey"
                icon={<Key size={18} />}
                type="password"
                placeholder="sk-or-..."
                {...register('apiKey', { 
                  required: 'API key is required',
                  pattern: {
                    value: /^sk-or-/,
                    message: 'Must be a valid OpenRouter API key starting with sk-or-'
                  }
                })}
                aria-invalid={errors.apiKey ? 'true' : 'false'}
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-destructive">{errors.apiKey.message}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Your OpenRouter API key is used to access AI models. 
                Get a key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a>
              </p>
            </div>
            
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save API Key
            </Button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default Settings;