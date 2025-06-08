import React, { useRef, useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, IconButton, Tooltip, useTheme } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Code, Brain, Check, FileText, UserCheck, FileSearch, Languages, ChevronRight, ChevronLeft, Bot, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getModels } from '../services/llm';
import { LLMModelMarketing } from '../types';

// Fallback models data in case API fails
const fallbackModels: LLMModelMarketing[] = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable GPT model' },
  { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Fast and efficient language model' },
  { id: 'claude-2', name: 'Claude 2', description: 'Advanced reasoning capabilities' },
  { id: 'palm-2', name: 'PaLM 2', description: 'Google\'s latest language model' },
  { id: 'llama-2', name: 'LLaMA 2', description: 'Open source language model' },
  { id: 'falcon', name: 'Falcon', description: 'Powerful open source model' }
];

const features = [
  {
    id: 'coding',
    title: 'Code Assistant',
    description: 'Write, debug, and optimize code with AI assistance',
    icon: <Code size={24} />,
    color: '#3b82f6',
    demoUrl: 'https://example.com/demo/coding'
  },
  {
    id: 'brainmapping',
    title: 'Brain Mapping',
    description: 'Visualize and organize your thoughts with AI',
    icon: <Brain size={24} />,
    color: '#ec4899',
    demoUrl: 'https://example.com/demo/brainmapping'
  },
  {
    id: 'grammar',
    title: 'Grammar Checker',
    description: 'Perfect your writing with advanced grammar checks',
    icon: <Check size={24} />,
    color: '#10b981',
    demoUrl: 'https://example.com/demo/grammar'
  },
  {
    id: 'paraphrase',
    title: 'Paraphraser',
    description: 'Rewrite content while maintaining meaning',
    icon: <FileText size={24} />,
    color: '#f59e0b',
    demoUrl: 'https://example.com/demo/paraphrase'
  },
  {
    id: 'humanizer',
    title: 'Humanizer',
    description: 'Make AI-generated content sound more natural',
    icon: <UserCheck size={24} />,
    color: '#8b5cf6',
    demoUrl: 'https://example.com/demo/humanizer'
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism Checker',
    description: 'Ensure content originality and authenticity',
    icon: <FileSearch size={24} />,
    color: '#ef4444',
    demoUrl: 'https://example.com/demo/plagiarism'
  },
  {
    id: 'translator',
    title: 'Translator',
    description: 'Translate content across multiple languages',
    icon: <Languages size={24} />,
    color: '#14b8a6',
    demoUrl: 'https://example.com/demo/translator'
  },
  {
    id: 'ai-checker',
    title: 'AI Checker',
    description: 'Detect AI-generated content with high accuracy',
    icon: <Bot size={24} />,
    color: '#6366f1',
    demoUrl: 'https://example.com/demo/ai-checker'
  }
];

const MarketingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModelMarketing[]>(fallbackModels);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getModels();
        if (response?.data?.models && response.data.models.length > 0) {
          setModels(response.data.models);
        }
      } catch (error: any) {
        // Enhanced error logging
        console.error('Failed to fetch models:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          apiUrl: import.meta.env.VITE_API_URL // Log API URL for debugging
        });
        
        // Keep using fallback models if fetch fails
        console.info('Using fallback models due to API error');
      }
    };
    
    // Only attempt to fetch if API URL is configured
    if (import.meta.env.VITE_API_URL) {
      fetchModels();
    } else {
      console.warn('API URL not configured, using fallback models');
    }
  }, []);

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => 
      prev === features.length - 4 ? 0 : prev + 1
    );
  };

  const prevFeature = () => {
    setCurrentFeatureIndex((prev) => 
      prev === 0 ? features.length - 4 : prev - 1
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(13, 17, 38, 0.95), rgba(22, 28, 47, 0.95))'
        : 'linear-gradient(135deg, rgba(249, 250, 251, 0.95), rgba(243, 244, 246, 0.95))',
    }}>
      {/* Navigation Bar */}
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '1200px',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '40px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          p: 1,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 3,
          py: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bot size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AI Studio
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button color="inherit">Features</Button>
            <Button color="inherit">Pricing</Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: '20px',
                px: 3,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: 15,
          pb: 10,
          position: 'relative',
        }}
      >
        <Box ref={featuresRef}>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center"
            sx={{ 
              fontWeight: 800,
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful AI Features
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Explore our comprehensive suite of AI-powered tools
          </Typography>

          <Box sx={{ position: 'relative', mb: 8 }}>
            <Box sx={{ 
              display: 'flex',
              gap: 3,
              overflowX: 'hidden',
              px: 2,
            }}>
              {features.slice(currentFeatureIndex, currentFeatureIndex + 4).map((feature, index) => (
                <Card
                  key={feature.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    flex: '0 0 calc(25% - 24px)',
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${feature.color}15`,
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>

                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    pt: '56.25%', // 16:9 aspect ratio
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.default'
                  }}>
                    <Box
                      component="iframe"
                      src={feature.demoUrl}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: feature.color,
                      '&:hover': { bgcolor: feature.color },
                      borderRadius: 2,
                    }}
                    endIcon={<ExternalLink size={16} />}
                  >
                    Try Now
                  </Button>
                </Card>
              ))}
            </Box>

            <IconButton
              onClick={prevFeature}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={nextFeature}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* AI Models Section */}
          <Box sx={{ mt: 10 }}>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
              }}
            >
              Powered by {models.length}+ AI Models
            </Typography>

            <Typography 
              variant="body1" 
              align="center" 
              color="text.secondary"
              sx={{ mb: 6 }}
            >
              Access state-of-the-art language models through our platform
            </Typography>

            {[0, 1, 2].map((row) => (
              <Box
                key={row}
                component={motion.div}
                animate={{
                  x: row % 2 === 0 ? [0, -100] : [-100, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                  flexWrap: 'nowrap',
                  whiteSpace: 'nowrap',
                }}
              >
                {models.map((model) => (
                  <Tooltip key={model.id} title={model.description}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {model.name}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            ))}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                endIcon={<ChevronRight />}
                onClick={() => navigate('/models')}
              >
                View All {models.length} AI Models
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MarketingPage;