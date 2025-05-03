import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Alert
} from '@mui/material';

const NewChatForm = () => {
  const { models, loading, error, sendMessage } = useChat();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    message: '',
    model: '',
    temperature: 0.7,
    max_tokens: 1000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSliderChange = (name) => (e, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { message, model, temperature, max_tokens } = formData;
    
    const options = {
      temperature,
      max_tokens
    };
    
    const response = await sendMessage(message, null, model, options);
    
    if (response && response.conversation) {
      navigate(`/chat/${response.conversation._id}`);
    }
  };

  const handleCancel = () => {
    navigate('/chat');
  };

  if (loading && models.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Start a New Conversation
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Select Model</InputLabel>
          <Select
            name="model"
            value={formData.model}
            onChange={handleChange}
            label="Select Model"
            required
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          label="Your Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />
        
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography gutterBottom>Temperature: {formData.temperature}</Typography>
          <Slider
            value={formData.temperature}
            onChange={handleSliderChange('temperature')}
            step={0.1}
            marks
            min={0}
            max={1}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography gutterBottom>Max Tokens: {formData.max_tokens}</Typography>
          <Slider
            value={formData.max_tokens}
            onChange={handleSliderChange('max_tokens')}
            step={100}
            marks
            min={100}
            max={4000}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Start Conversation'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default NewChatForm;
