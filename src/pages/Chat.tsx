import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, Slash, Settings, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { useChatStore } from '../stores/chatStore';

const Chat = () => {
  const { chatId } = useParams();
  const [prompt, setPrompt] = useState('');
  const [showModels, setShowModels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const { 
    currentSessionId,
    sessions,
    createNewSession,
    setCurrentSession,
    getSession,
    sendMessage,
    isStreaming,
    activeModels,
    selectedModel,
    selectModel,
    fetchModels,
    cancelStream,
  } = useChatStore();

  // Set current session based on URL param
  useEffect(() => {
    if (chatId) {
      setCurrentSession(chatId);
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSession(sessions[0].id);
    } else if (!currentSessionId) {
      createNewSession();
    }
  }, [chatId, currentSessionId, sessions, setCurrentSession, createNewSession]);

  // Fetch available models
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Focus input when component mounts
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [currentSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [getSession(currentSessionId || '')?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      await sendMessage(prompt);
      setPrompt('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentSession = getSession(currentSessionId || '');

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold truncate max-w-[200px] md:max-w-md">
            {currentSession?.title || 'New Chat'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModels(!showModels)}
              className="flex items-center space-x-1"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">{activeModels.find(m => m.id === selectedModel)?.name || 'Model'}</span>
              <MoreVertical size={16} />
            </Button>
            
            <AnimatePresence>
              {showModels && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-card border border-border z-10"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <h3 className="text-sm font-medium">Select a model</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {activeModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          selectModel(model.id);
                          setShowModels(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors
                          ${selectedModel === model.id ? 'bg-accent/50' : ''}`}
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{model.provider}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
          >
            <Settings size={20} />
          </Button>
        </div>
      </header>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {currentSession?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles size={40} className="mb-4 text-primary" />
            <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
            <p className="max-w-md">
              Ask me anything, from answering questions to generating content, 
              solving problems, and more.
            </p>
          </div>
        ) : (
          currentSession?.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-lg px-4 py-3 max-w-[85%] md:max-w-[70%] ${
                  message.role === 'user' 
                    ? 'chat-bubble-user' 
                    : 'chat-bubble-bot'
                }`}
              >
                {message.role === 'assistant' && message.isStreaming ? (
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    <div className="h-4 w-4 mt-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-current mr-1 animate-pulse"></span>
                      <span className="inline-block h-2 w-2 rounded-full bg-current mr-1 animate-pulse delay-150"></span>
                      <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse delay-300"></span>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert break-words whitespace-pre-wrap">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={promptInputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="pr-12 resize-none min-h-[60px] max-h-[200px]"
            rows={1}
            disabled={isStreaming}
          />
          
          <div className="absolute right-2 bottom-2">
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={cancelStream}
                className="text-destructive"
              >
                <Slash size={20} />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!prompt.trim()}
                className="text-primary"
              >
                <Send size={20} />
              </Button>
            )}
          </div>
        </form>
        
        <div className="text-xs text-center mt-2 text-muted-foreground">
          <span className="inline-flex items-center">
            <Sparkles size={12} className="mr-1" />
            Using {activeModels.find(m => m.id === selectedModel)?.name || 'AI assistant'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chat;