import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { ChevronDown, Info, ImageIcon, Check } from "lucide-react";
import { LLMModel } from "../../types";
import ModelSelectorPopup from "./ModelSelectorPopup";

interface ModelSelectorProps {
  models: LLMModel[];
  selectedModel: string;
  onChange: (modelId: string) => void;
  loading: boolean;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onChange,
  loading,
  disabled = false,
}) => {
  const theme = useTheme();
  const [popupOpen, setPopupOpen] = useState(false);

  // Find selected model details
  const selectedModelDetails = models.find(
    (model) => model.id === selectedModel
  );

  // Check if model supports images
  const supportsImages = (model: LLMModel) => {
    return model.architecture?.input_modalities?.includes("image") || false;
  };

  // Handle opening the popup
  const handleOpenPopup = () => {
    if (!disabled) {
      setPopupOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenPopup}
        disabled={disabled}
        fullWidth
        variant="outlined"
        color="primary"
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          py: 1,
          px: 2,
          borderRadius: 2,
          transition: "all 0.2s",
          border: '2px solid',
          borderColor: 'primary.main',
          bgcolor: selectedModelDetails ? 'primary.main' : 'transparent',
          color: selectedModelDetails ? 'white' : 'primary.main',
          "&:hover": {
            backgroundColor: selectedModelDetails ? 'primary.dark' : theme.palette.action.hover,
            borderColor: 'primary.main',
          },
        }}
        endIcon={
          loading ? <CircularProgress size={16} color="inherit" /> : <ChevronDown size={16} />
        }
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          {selectedModelDetails ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedModelDetails.name}
                </Typography>
                {supportsImages(selectedModelDetails) && (
                  <Chip
                    label="Image"
                    size="small"
                    sx={{ 
                      ml: 1, 
                      height: 20, 
                      fontSize: "0.6rem",
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'inherit',
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ mr: 1, opacity: 0.8 }}
                >
                  {((selectedModelDetails.context_length || 0) / 1000).toFixed(
                    0
                  )}
                  k
                </Typography>
                <Tooltip title="View model details">
                  <Info size={14} style={{ opacity: 0.8 }} />
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {loading ? "Loading models..." : "Select a model"}
            </Typography>
          )}
        </Box>
      </Button>

      <ModelSelectorPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={onChange}
      />
    </>
  );
};

export default ModelSelector;