import React, { useRef, useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, IconButton, Tooltip, useTheme, Grid, Paper, Chip } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Code, Brain, Check, FileText, UserCheck, FileSearch, Languages, ChevronRight, ChevronLeft, Bot, ExternalLink, Sparkles, Zap, Star, ArrowRight, Menu, X } from 'lucide-react';
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
    description: 'Write, debug, and optimize code with AI assistance across multiple programming languages',
    icon: <Code size={24} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  {
    id: 'brainmapping',
    title: 'Brain Mapping',
    description: 'Visualize and organize your thoughts with AI-powered mind mapping tools',
    icon: <Brain size={24} />,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)'
  },
  {
    id: 'grammar',
    title: 'Grammar Checker',
    description: 'Perfect your writing with advanced grammar checks and style suggestions',
    icon: <Check size={24} />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #047857)'
  },
  {
    id: 'paraphrase',
    title: 'Paraphraser',
    description: 'Rewrite content while maintaining meaning and improving clarity',
    icon: <FileText size={24} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)'
  },
  {
    id: 'humanizer',
    title: 'Humanizer',
    description: 'Make AI-generated content sound more natural and human-like',
    icon: <UserCheck size={24} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)'
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism Checker',
    description: 'Ensure content originality and authenticity with advanced detection',
    icon: <FileSearch size={24} />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)'
  },
  {
    id: 'translator',
    title: 'Translator',
    description: 'Translate content across 100+ languages with context awareness',
    icon: <Languages size={24} />,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)'
  },
  {
    id: 'ai-checker',
    title: 'AI Detector',
    description: 'Detect AI-generated content with industry-leading accuracy',
    icon: <Bot size={24} />,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4338ca)'
  }
];

const stats = [
  { label: 'Active Users', value: '50K+', icon: <Bot size={20} /> },
  { label: 'AI Models', value: '25+', icon: <Brain size={20} /> },
  { label: 'Languages', value: '100+', icon: <Languages size={20} /> },
  { label: 'Uptime', value: '99.9%', icon: <Zap size={20} /> }
];

const MarketingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [models, setModels] = useState<LLMModelMarketing[]>(fallbackModels);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getModels();
        if (response?.data?.models && response.data.models.length > 0) {
          setModels(response.data.models);
        }
      } catch (error: any) {
        console.error('Failed to fetch models:', error);
        console.info('Using fallback models due to API error');
      }
    };
    
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}20, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}15, transparent 70%)`,
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      {/* Navigation Bar */}
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(13, 17, 38, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            py: 2,
          }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Bot size={24} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.5rem' }}>
                AI Studio
              </Typography>
            </Box>
            
            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center',
              gap: 4 
            }}>
              <Button 
                color="inherit" 
                sx={{ fontWeight: 500 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Features
              </Button>
              <Button 
                color="inherit" 
                sx={{ fontWeight: 500 }}
                onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}
              >
                AI Models
              </Button>
              <Button 
                color="inherit" 
                sx={{ fontWeight: 500 }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Pricing
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 3,
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.main',
                      color: 'white'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/register')}
                  sx={{ 
                    borderRadius: '25px',
                    px: 3,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    '&:hover': { 
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                    }
                  }}
                  startIcon={<Sparkles size={18} />}
                >
                  Get Started
                </Button>
              </Box>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              sx={{
                display: { xs: 'block', md: 'none' },
                py: 3,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  color="inherit" 
                  fullWidth
                  sx={{ justifyContent: 'flex-start', fontWeight: 500 }}
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  Features
                </Button>
                <Button 
                  color="inherit" 
                  fullWidth
                  sx={{ justifyContent: 'flex-start', fontWeight: 500 }}
                  onClick={() => {
                    document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  AI Models
                </Button>
                <Button 
                  color="inherit" 
                  fullWidth
                  sx={{ justifyContent: 'flex-start', fontWeight: 500 }}
                  onClick={() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  Pricing
                </Button>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: '25px', fontWeight: 600 }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/register')}
                    sx={{ 
                      borderRadius: '25px',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }}
                    startIcon={<Sparkles size={18} />}
                  >
                    Get Started
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Hero Section */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box
          component={motion.div}
          style={{ opacity: heroOpacity, y: heroY }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              label="🚀 New: Advanced AI Models Available"
              sx={{
                mb: 4,
                px: 2,
                py: 1,
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
            
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                lineHeight: 1.1,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Unlock the Power of
              <br />
              <Box component="span" sx={{ position: 'relative' }}>
                AI Innovation
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                mb: 6,
                maxWidth: '800px',
                mx: 'auto',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Experience cutting-edge AI technology with our comprehensive suite of tools. 
              From code generation to content creation, unlock your potential with flexible pay-as-you-go pricing.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 8
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '30px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
                startIcon={<Zap size={20} />}
                endIcon={<ArrowRight size={20} />}
              >
                Start Free Trial
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '30px',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </Button>
            </Box>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 1,
                      color: 'primary.main'
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      </Container>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
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
                color="text.secondary"
                sx={{ 
                  maxWidth: '600px',
                  mx: 'auto',
                  mb: 2,
                  fontWeight: 400
                }}
              >
                Explore our comprehensive suite of AI-powered tools designed to boost your productivity
              </Typography>
            </motion.div>
          </Box>

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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    flex: '0 0 calc(25% - 24px)',
                    p: 4,
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: feature.color,
                      color: feature.color,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: feature.color,
                        background: feature.color,
                        color: 'white'
                      },
                    }}
                    endIcon={<ArrowRight size={16} />}
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
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.paper', transform: 'translateY(-50%) scale(1.1)' },
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
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.paper', transform: 'translateY(-50%) scale(1.1)' },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* AI Models Section */}
      <Box id="models" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                }}
              >
                Powered by {models.length}+ AI Models
              </Typography>

              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mb: 6, fontWeight: 400 }}
              >
                Access state-of-the-art language models through our unified platform
              </Typography>
            </motion.div>
          </Box>

          {[0, 1, 2].map((row) => (
            <Box
              key={row}
              component={motion.div}
              animate={{
                x: row % 2 === 0 ? [0, -100] : [-100, 0],
              }}
              transition={{
                duration: 30,
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
              {[...models, ...models].map((model, index) => (
                <Tooltip key={`${model.id}-${index}`} title={model.description}>
                  <Chip
                    label={model.name}
                    variant="outlined"
                    sx={{
                      borderRadius: '20px',
                      px: 2,
                      py: 1,
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          ))}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 2,
                borderRadius: '25px',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
              endIcon={<ArrowRight />}
            >
              Explore All Models
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box id="pricing" sx={{ py: { xs: 8, md: 12 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="md">
          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: 4,
              textAlign: 'center',
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`
                : `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ready to Get Started?
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mb: 4, fontWeight: 400 }}
              >
                Join thousands of users who are already leveraging AI to boost their productivity. 
                Start with our flexible pay-as-you-go pricing.
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '30px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  startIcon={<Star size={20} />}
                >
                  Start Free Trial
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.main',
                      color: 'white',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </motion.div>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        py: 6, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        position: 'relative',
        zIndex: 1
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bot size={24} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                AI Studio
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              © 2024 AI Studio. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MarketingPage;