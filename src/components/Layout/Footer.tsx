import React from 'react';
import { Box, Typography, Container, Link, Grid, Divider } from '@mui/material';
import { Twitter, Facebook, Instagram, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? 'rgba(245, 247, 250, 1)'
          : 'rgba(10, 25, 41, 0.2)',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>
                AI
              </Box>
              Studio
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Experience the power of state-of-the-art language models with our flexible top-up system.
              Generate content, get answers, and unlock creative potential.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Link href="#" color="inherit">
                <Twitter size={20} />
              </Link>
              <Link href="#" color="inherit">
                <Facebook size={20} />
              </Link>
              <Link href="#" color="inherit">
                <Instagram size={20} />
              </Link>
              <Link href="#" color="inherit">
                <Linkedin size={20} />
              </Link>
              <Link href="#" color="inherit">
                <Github size={20} />
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Company
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Careers
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Blog
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Press
            </Link>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Product
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Features
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Pricing
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              API
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Integrations
            </Link>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resources
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Documentation
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Tutorials
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Support
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              FAQ
            </Link>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Legal
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Security
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Cookies
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} AI Studio. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;