// components/chat/ModelSelector.tsx - Updated to work with new popup
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
          py: 0.75,
          borderRadius: 1.5,
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        endIcon={
          loading ? <CircularProgress size={16} /> : <ChevronDown size={16} />
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedModelDetails.name}
                </Typography>
                {supportsImages(selectedModelDetails) && (
                  <Chip
                    label="Image"
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20, fontSize: "0.6rem" }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  {((selectedModelDetails.context_length || 0) / 1000).toFixed(
                    0
                  )}
                  k
                </Typography>
                <Tooltip title="View model details">
                  <Info size={14} color="#666" />
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
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
