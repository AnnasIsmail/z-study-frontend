import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Image, FileText, Code, Sparkles } from 'lucide-react';

const features = [
  {
    title: 'Text Generation',
    description: 'Create human-like text for various purposes including content creation, emails, and more.',
    icon: <MessageSquare size={24} />,
    color: '#3b82f6'
  },
  {
    title: 'Image Generation',
    description: 'Transform text prompts into beautiful, unique images with our AI image generation.',
    icon: <Image size={24} />,
    color: '#ec4899'
  },
  {
    title: 'Document Analysis',
    description: 'Extract information, summarize, and analyze documents with advanced AI assistance.',
    icon: <FileText size={24} />,
    color: '#10b981'
  },
  {
    title: 'Code Generation',
    description: 'Generate code snippets, solve programming problems, and debug with AI assistance.',
    icon: <Code size={24} />,
    color: '#7c3aed'
  },
  {
    title: 'Fine-tuning',
    description: 'Customize AI models to your specific needs for better results and accuracy.',
    icon: <Sparkles size={24} />,
    color: '#f59e0b'
  },
  {
    title: 'Advanced Reasoning',
    description: 'Tackle complex problems requiring multi-step reasoning and analysis.',
    icon: <Brain size={24} />,
    color: '#ef4444'
  }
];

const FeatureCard = ({ title, description, icon, color, index }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6,
            },
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Paper>
      </motion.div>
    </Grid>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 2
              }}
            >
              Powerful AI Features
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                mb: 2
              }}
            >
              Explore the capabilities that our AI platform offers through a simple top-up system
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              index={index}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;