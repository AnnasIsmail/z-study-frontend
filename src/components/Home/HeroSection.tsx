import React from 'react';
import { Box, Typography, Button, Container, useMediaQuery } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Bot } from 'lucide-react';

const HeroSection: React.FC = () => {
  const theme = useMuiTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundImage: isDark
          ? 'linear-gradient(to bottom right, rgba(13, 17, 38, 0.95), rgba(22, 28, 47, 0.95))'
          : 'linear-gradient(to bottom right, rgba(249, 250, 251, 0.95), rgba(235, 245, 255, 0.95))',
        overflow: 'hidden',
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 16 },
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '20%', md: '10%' },
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}20, transparent 70%)`,
          filter: 'blur(15px)',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}25, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 4, md: 6 },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Unlock the Power of AI with Flexible Top-ups
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                component="p"
                color="text.secondary"
                sx={{ mb: 4, fontSize: '1.125rem', maxWidth: '550px', mx: { xs: 'auto', md: 0 } }}
              >
                Access cutting-edge language models with our pay-as-you-go system. 
                Add credit when you need it, use it when you want. No subscriptions, 
                no commitments.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                  startIcon={<Zap size={20} />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Log In
                </Button>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 4, 
                  mt: 5, 
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sparkles size={20} color={theme.palette.primary.main} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Pay-as-you-go
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bot size={20} color={theme.palette.primary.main} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Multiple AI Models
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                sx={{
                  width: { xs: '300px', sm: '400px', md: '500px' },
                  height: { xs: '300px', sm: '400px', md: '460px' },
                  backgroundImage: `url(https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(123, 58, 237, 0.2), rgba(59, 130, 246, 0.2))'
                      : 'linear-gradient(135deg, rgba(123, 58, 237, 0.1), rgba(59, 130, 246, 0.1))',
                    zIndex: 1,
                  },
                }}
              />
            </motion.div>

            {/* Floating elements */}
            <Box
              component={motion.div}
              initial={{ y: 0 }}
              animate={{ y: -15 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: 'reverse', 
                duration: 2,
                ease: 'easeInOut'
              }}
              sx={{
                position: 'absolute',
                top: '10%',
                right: isMobile ? '5%' : '10%',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                width: { xs: '120px', md: '160px' },
                zIndex: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Text Generation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3₹ per 1K tokens
              </Typography>
            </Box>

            <Box
              component={motion.div}
              initial={{ y: 0 }}
              animate={{ y: 15 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: 'reverse', 
                duration: 2.5,
                ease: 'easeInOut'
              }}
              sx={{
                position: 'absolute',
                bottom: '15%',
                left: isMobile ? '5%' : '10%',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                width: { xs: '130px', md: '170px' },
                zIndex: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Image Generation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                15₹ per image
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;