import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        Create your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Registration successful! Redirecting to login...
        </Alert>
      )}

      <TextField
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <User size={18} />
            </InputAdornment>
          ),
        }}
      />

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
        helperText="Min 8 characters with uppercase, lowercase, number & special character"
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

      <TextField
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        required
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock size={18} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading || success}
        sx={{ 
          mt: 3, 
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
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Typography
          component={RouterLink}
          to="/login"
          variant="body2"
          color="primary"
          sx={{ fontWeight: 600, textDecoration: 'none' }}
        >
          Log in
        </Typography>
      </Typography>
    </Box>
  );
};

export default RegisterForm;