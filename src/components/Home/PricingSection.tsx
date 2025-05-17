import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pricingPlans = [
  {
    title: 'Starter',
    price: '₹1,000',
    description: 'Perfect for beginners exploring AI capabilities',
    features: [
      '1,000 credits (approx. 300K tokens)',
      'Text generation',
      'Basic chat capabilities',
      'Standard response time',
      '30-day validity'
    ],
    recommended: false,
    color: '#3b82f6'
  },
  {
    title: 'Pro',
    price: '₹3,000',
    description: 'For professionals with moderate AI usage',
    features: [
      '3,300 credits (10% bonus, approx. 1M tokens)',
      'All Starter features',
      'Image generation',
      'Faster response time',
      '60-day validity'
    ],
    recommended: true,
    color: '#7c3aed'
  },
  {
    title: 'Business',
    price: '₹10,000',
    description: 'For businesses with intensive AI needs',
    features: [
      '12,000 credits (20% bonus, approx. 3.5M tokens)',
      'All Pro features',
      'Document analysis',
      'Code generation',
      'Priority response time',
      '90-day validity'
    ],
    recommended: false,
    color: '#10b981'
  }
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
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
              Flexible Pricing
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
              Choose the top-up package that works for you. No subscriptions, pay only for what you need.
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={plan.recommended ? 6 : 3}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: plan.recommended ? `2px solid ${plan.color}` : 'none',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {plan.recommended && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: -35,
                        transform: 'rotate(45deg)',
                        backgroundColor: plan.color,
                        color: 'white',
                        py: 0.5,
                        px: 4,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        width: '140px',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}
                  
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      color: plan.color
                    }}
                  >
                    {plan.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>
                  
                  <Typography 
                    variant="h4" 
                    component="p" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    {plan.price}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    One-time payment
                  </Typography>
                  
                  <List sx={{ mb: 3, flexGrow: 1 }}>
                    {plan.features.map((feature, i) => (
                      <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle size={18} color={plan.color} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontSize: '0.9rem' 
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button
                    variant={plan.recommended ? "contained" : "outlined"}
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/register')}
                    startIcon={plan.recommended ? <Zap size={18} /> : null}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                      backgroundColor: plan.recommended ? plan.color : 'transparent',
                      borderColor: plan.color,
                      color: plan.recommended ? 'white' : plan.color,
                      '&:hover': {
                        backgroundColor: plan.recommended ? `${plan.color}DD` : `${plan.color}15`,
                        borderColor: plan.color,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            All prices are in Indian Rupees (₹). Credits expire after the validity period.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Need a custom plan for your enterprise? <Button variant="text" size="small">Contact us</Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;