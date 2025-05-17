import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  Divider, 
  Alert,
  CircularProgress
} from '@mui/material';
import { User, Edit, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/auth';

const ProfileInfo: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name || '');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    // Validate passwords match if changing password
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData: { name?: string; password?: string } = {};
      
      if (name !== user?.name) {
        updateData.name = name;
      }
      
      if (password) {
        updateData.password = password;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserProfile(updateData);
        await updateUserData();
        setSuccess('Profile updated successfully');
      }
      
      setEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        borderRadius: 2,
        maxWidth: 600,
        mx: 'auto'
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'primary.main',
            fontSize: '2rem',
            mr: 3
          }}
        >
          {user.name?.charAt(0).toUpperCase() || <User size={40} />}
        </Avatar>
        
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            {user.email}
          </Typography>
          <Typography sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>
            Balance: {user.balance?.toLocaleString() || 0} IDR
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Account Information
        </Typography>
        
        {editing ? (
          <Box component="form">
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Change Password (leave blank to keep current)
            </Typography>
            
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                startIcon={<Check size={18} />}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                startIcon={<X size={18} />}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Full Name
              </Typography>
              <Typography variant="body1">
                {user.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Email
              </Typography>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Role
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Member Since
              </Typography>
              <Typography variant="body1">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleEdit}
              startIcon={<Edit size={18} />}
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileInfo;