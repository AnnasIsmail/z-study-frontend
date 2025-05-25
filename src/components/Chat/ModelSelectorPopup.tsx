import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Button,
  SelectChangeEvent,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { X, Search, ChevronDown, Check, Info, ImageIcon, TextIcon, MessageSquare, DollarSign } from 'lucide-react';
import { LLMModel } from '../../types';

interface ModelSelectorPopupProps {
  open: boolean;
  onClose: () => void;
  models: LLMModel[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  loading: boolean;
}

// Define input modality types
const INPUT_MODALITIES = [
  { value: 'text', label: 'Text', icon: <TextIcon size={14} /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
];

const ModelSelectorPopup: React.FC<ModelSelectorPopupProps> = ({
  open,
  onClose,
  models,
  selectedModel,
  onSelectModel,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('price-asc');

  // Calculate model price (using prompt price as the main indicator)
  const getModelPrice = (model: LLMModel): number => {
    return parseFloat(model.pricing?.prompt || '0');
  };

  // Filter and sort models
  const filteredModels = useMemo(() => {
    if (!models.length) return [];

    // Apply search filter
    let filtered = models;
    if (searchQuery) {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply modality filter
    if (selectedModalities.length > 0) {
      filtered = filtered.filter(model => {
        const modelModalities = model.architecture?.input_modalities || [];
        return selectedModalities.some(modality => modelModalities.includes(modality));
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return getModelPrice(a) - getModelPrice(b);
        case 'price-desc':
          return getModelPrice(b) - getModelPrice(a);
        case 'context-desc':
          return (b.context_length || 0) - (a.context_length || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [models, searchQuery, selectedModalities, sortOption]);

  // Group models by modality
  const groupedModels = useMemo(() => {
    return filteredModels.reduce<Record<string, LLMModel[]>>((acc, model) => {
      const modality = model.architecture?.modality || 'Unknown';
      if (!acc[modality]) {
        acc[modality] = [];
      }
      acc[modality].push(model);
      return acc;
    }, {});
  }, [filteredModels]);

  // Format price for display
  const formatPrice = (price: string): string => {
    const value = parseFloat(price);
    if (value < 0.0001) {
      return `$${(value * 1000000).toFixed(2)}µ`;
    }
    return `$${value.toFixed(6)}`;
  };

  // Handle modality filter changes
  const handleModalityChange = (modality: string) => {
    setSelectedModalities(prev => 
      prev.includes(modality)
        ? prev.filter(m => m !== modality)
        : [...prev, modality]
    );
  };

  // Handle sorting change
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  // Handle model selection
  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId);
    onClose();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedModalities([]);
    setSortOption('price-asc');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">Select AI Model</Typography>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 3, pb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        {/* Search */}
        <TextField
          placeholder="Search models..."
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOption}
            onChange={handleSortChange}
            label="Sort By"
            IconComponent={ChevronDown}
          >
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
            <MenuItem value="context-desc">Context Length</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Modality filters */}
      <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Input Type:
        </Typography>
        {INPUT_MODALITIES.map((modality) => (
          <Chip
            key={modality.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {modality.icon}
                <Typography variant="caption">{modality.label}</Typography>
              </Box>
            }
            onClick={() => handleModalityChange(modality.value)}
            color={selectedModalities.includes(modality.value) ? "primary" : "default"}
            sx={{ 
              borderRadius: 1.5,
              '&:hover': { opacity: 0.9 }
            }}
          />
        ))}
        
        {(searchQuery || selectedModalities.length > 0 || sortOption !== 'price-asc') && (
          <Button 
            size="small" 
            onClick={resetFilters}
            sx={{ ml: 'auto', fontSize: '0.75rem' }}
          >
            Reset Filters
          </Button>
        )}
      </Box>
      
      <Divider />
      
      <DialogContent sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading models...</Typography>
          </Box>
        ) : (
          <>
            {Object.keys(groupedModels).length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>No models match your filters</Typography>
              </Box>
            ) : (
              <>
                {Object.entries(groupedModels).map(([modality, modalityModels]) => (
                  <Box key={modality} sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 1.5, 
                        fontWeight: 600,
                        px: 1
                      }}
                    >
                      {modality}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {modalityModels.map((model) => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: model.id === selectedModel 
                                ? `2px solid ${theme.palette.primary.main}` 
                                : '2px solid transparent',
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                              },
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            onClick={() => handleSelectModel(model.id)}
                            elevation={1}
                          >
                            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  noWrap 
                                  title={model.name}
                                  sx={{ maxWidth: '70%', fontWeight: 600 }}
                                >
                                  {model.name}
                                </Typography>
                                {model.id === selectedModel && (
                                  <Chip
                                    label={<Check size={14} />}
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20, minWidth: 20, '& .MuiChip-label': { p: 0 } }}
                                  />
                                )}
                              </Box>
                              
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 1.5,
                                  flexGrow: 1
                                }}
                              >
                                {model.description || 'No description available'}
                              </Typography>
                              
                              <Box sx={{ mt: 'auto' }}>
                                {/* Model details */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Context: {(model.context_length / 1000).toFixed(0)}k
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Price per token">
                                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                                        <DollarSign size={12} color="#666" />
                                      </Box>
                                    </Tooltip>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatPrice(model.pricing?.prompt || '0')}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* Input/Output Modality Tags */}
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {model.architecture?.input_modalities?.map((modality) => (
                                    <Chip
                                      key={`input-${modality}`}
                                      label={modality}
                                      size="small"
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.6rem',
                                        borderRadius: 1
                                      }}
                                      color={modality === 'image' ? 'secondary' : 'primary'}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectorPopup;