import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu as MenuIcon, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: mode === 'light' ? 'white' : 'background.paper',
        color: mode === 'light' ? 'text.primary' : 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box 
            component="span" 
            sx={{ 
              color: 'primary.main', 
              mr: 1,
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            AI
          </Box>
          Studio
        </Typography>

        {/* Desktop navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button 
                component={RouterLink} 
                to="/dashboard" 
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Dashboard
              </Button>
              <Box>
                <IconButton 
                  onClick={handleMenuOpen}
                  sx={{ padding: 0.5 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: 'primary.main',
                      fontSize: '1rem',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 180, borderRadius: 2 }
                  }}
                >
                  <Box sx={{ py: 1, px: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || ''}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>
                      Balance: {user?.balance?.toLocaleString() || 0} IDR
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleProfile} sx={{ gap: 1.5 }}>
                    <UserIcon size={18} />
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
                    <LogOut size={18} />
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <>
              <Button 
                component={RouterLink} 
                to="/login" 
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchorEl}
            open={Boolean(mobileMenuAnchorEl)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200, borderRadius: 2 }
            }}
          >
            {isAuthenticated ? (
              <>
                <Box sx={{ py: 1, px: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || ''}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 500 }}>
                    Balance: {user?.balance?.toLocaleString() || 0} IDR
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  component={RouterLink} 
                  to="/dashboard"
                  onClick={handleMobileMenuClose}
                >
                  Dashboard
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/profile"
                  onClick={handleMobileMenuClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={toggleTheme}>
                  {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem 
                  component={RouterLink} 
                  to="/login"
                  onClick={handleMobileMenuClose}
                >
                  Login
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/register"
                  onClick={handleMobileMenuClose}
                >
                  Register
                </MenuItem>
                <MenuItem onClick={toggleTheme}>
                  {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;