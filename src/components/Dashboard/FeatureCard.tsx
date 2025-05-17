import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color, path }) => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={() => navigate(path)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          transition: 'all 0.3s ease',
          border: isDark ? `1px solid rgba(255,255,255,0.1)` : 'none',
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 8px 16px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: isDark
              ? '0 8px 25px rgba(0,0,0,0.3)'
              : '0 12px 28px rgba(0,0,0,0.1)',
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: `linear-gradient(45deg, transparent 50%, ${color}20 50%)`,
            opacity: 0.8,
          }}
        />
        <CardContent sx={{ p: 3, height: '100%', zIndex: 1 }}>
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
          <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;