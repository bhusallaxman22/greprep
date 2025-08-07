import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  PersonAdd,
  Login as LoginIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AuthScreen = () => {
  const { signUp, signIn, signInAsGuest, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0 = login, 1 = signup
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
    setResetMode(false);
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!resetMode && !formData.password) {
      setError('Password is required');
      return false;
    }

    if (!resetMode && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (activeTab === 1 && !resetMode) { // Signup validation
      if (!formData.displayName) {
        setError('Display name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (resetMode) {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox.');
        setResetMode(false);
      } else if (activeTab === 0) {
        // Login
        await signIn(formData.email, formData.password);
      } else {
        // Signup
        await signUp(formData.email, formData.password, formData.displayName);
        setSuccess('Account created successfully! You are now logged in.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInAsGuest();
    } catch (err) {
      console.error('Guest login error:', err);
      setError('Failed to sign in as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            GRE/GMAT Test Prep
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {resetMode ? 'Reset your password' : 'Sign in to track your progress and improve your scores'}
          </Typography>
        </Box>

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

        {!resetMode && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered 
            sx={{ mb: 3 }}
          >
            <Tab icon={<LoginIcon />} label="Sign In" />
            <Tab icon={<PersonAdd />} label="Sign Up" />
          </Tabs>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
          />

          {/* Display Name Field (Signup only) */}
          {activeTab === 1 && !resetMode && (
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              margin="normal"
              required
            />
          )}

          {/* Password Field */}
          {!resetMode && (
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              autoComplete={activeTab === 0 ? 'current-password' : 'new-password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Confirm Password Field (Signup only) */}
          {activeTab === 1 && !resetMode && (
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : 
                     resetMode ? <LoginIcon /> :
                     activeTab === 0 ? <LoginIcon /> : <PersonAdd />}
          >
            {loading ? 'Please wait...' :
             resetMode ? 'Send Reset Email' :
             activeTab === 0 ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Additional Options */}
          {!resetMode && (
            <>
              {/* Forgot Password */}
              {activeTab === 0 && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setResetMode(true)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Forgot your password?
                  </Link>
                </Box>
              )}

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              {/* Guest Login */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestLogin}
                disabled={loading}
                startIcon={<AccountCircle />}
                sx={{ py: 1.5 }}
              >
                Continue as Guest
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Guest mode allows you to try the app without creating an account.
                Your progress will not be saved.
              </Typography>
            </>
          )}

          {/* Back from Reset Mode */}
          {resetMode && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setResetMode(false)}
                sx={{ textDecoration: 'none' }}
              >
                Back to Sign In
              </Link>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthScreen;
