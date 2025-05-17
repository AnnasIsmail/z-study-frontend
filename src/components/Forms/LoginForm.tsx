import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('Test@test.com');
  const [password, setPassword] = useState('Abeasd1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        maxWidth: { xs: '100%', sm: '450px' },
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: { xs: 0, sm: 3 }
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Log in to your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Mail size={18} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock size={18} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 1, mb: 3, textAlign: 'right' }}>
        <Typography 
          component={RouterLink} 
          to="/forgot-password"
          variant="body2" 
          color="primary"
          sx={{ textDecoration: 'none' }}
        >
          Forgot password?
        </Typography>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        sx={{ 
          mt: 1, 
          mb: 3,
          py: 1.5,
          fontWeight: 600,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
            transform: 'translateX(-100%)',
            animation: loading ? 'shimmer 1.5s infinite' : 'none',
          },
          '@keyframes shimmer': {
            '100%': {
              transform: 'translateX(100%)',
            },
          },
        }}
      >
        {loading ? 'Logging in...' : 'Log in'}
      </Button>

      <Typography variant="body2" align="center">
        Don't have an account?{' '}
        <Typography
          component={RouterLink}
          to="/register"
          variant="body2"
          color="primary"
          sx={{ fontWeight: 600, textDecoration: 'none' }}
        >
          Register now
        </Typography>
      </Typography>
    </Box>
  );
};

export default LoginForm;