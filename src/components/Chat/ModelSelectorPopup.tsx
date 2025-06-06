import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  X,
  Search,
  ChevronDown,
  Check,
  Info,
  ImageIcon,
  TextIcon,
  DollarSign,
} from "lucide-react";
import { LLMModel } from "../../types";
import { getModels, ModelsResponse } from "../../services/llm";
import { debounce } from "lodash";

interface ModelSelectorPopupProps {
  open: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

// Define input modality types
const INPUT_MODALITIES = [
  { value: "text", label: "Text", icon: <TextIcon size={14} /> },
  { value: "image", label: "Image", icon: <ImageIcon size={14} /> },
];

const ModelSelectorPopup: React.FC<ModelSelectorPopupProps> = ({
  open,
  onClose,
  selectedModel,
  onSelectModel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial load
  const [modelsData, setModelsData] = useState<ModelsResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("price-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1); // Reset to first page when searching
      fetchModels({
        search: query,
        modalities: selectedModalities,
        sort: sortOption,
        page: 1,
      });
    }, 300),
    [selectedModalities, sortOption]
  );

  // Fetch models function
  const fetchModels = async (params: {
    search?: string;
    modalities?: string[];
    sort?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getModels({
        search: params.search || "",
        modalities: params.modalities || [],
        sort: params.sort || "price-asc",
        page: params.page || 1,
        limit: 24, // Show 24 models per page
        group: true,
      });
      setModelsData(response.data);
    } catch (err) {
      setError("Failed to fetch models");
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false); // Set initial loading to false after first load
    }
  };

  // Initial data load when dialog opens
  useEffect(() => {
    if (open && !modelsData) {
      setInitialLoading(true);
      fetchModels({
        search: "",
        modalities: [],
        sort: "price-asc",
        page: 1,
      });
    }
  }, [open]);

  // Handle search input changes
  useEffect(() => {
    if (open && modelsData) {
      // Only trigger search after initial load
      debouncedSearch(searchQuery);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Handle filter/sort changes
  useEffect(() => {
    if (open && modelsData) {
      // Only trigger after initial load
      setCurrentPage(1);
      fetchModels({
        search: searchQuery,
        modalities: selectedModalities,
        sort: sortOption,
        page: 1,
      });
    }
  }, [selectedModalities, sortOption]);

  // Handle page changes
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    fetchModels({
      search: searchQuery,
      modalities: selectedModalities,
      sort: sortOption,
      page,
    });

    // Scroll to top of dialog content when changing pages
    const dialogContent = document.querySelector(
      '[role="dialog"] .MuiDialogContent-root'
    );
    if (dialogContent) {
      dialogContent.scrollTop = 0;
    }
  };

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
    setSelectedModalities((prev) =>
      prev.includes(modality)
        ? prev.filter((m) => m !== modality)
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
    setSearchQuery("");
    setSelectedModalities([]);
    setSortOption("price-asc");
    setCurrentPage(1);
  };

  // Reset state when dialog closes
  const handleClose = () => {
    // Reset all states when closing
    setModelsData(null);
    setInitialLoading(true);
    setLoading(false);
    setError(null);
    setSearchQuery("");
    setSelectedModalities([]);
    setSortOption("price-asc");
    setCurrentPage(1);
    onClose();
  };

  // Render model cards
  const renderModelCards = (models: LLMModel[]) => (
    <Grid container spacing={2}>
      {models.map((model) => (
        <Grid item xs={12} sm={6} md={4} key={model.id}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              border:
                model.id === selectedModel
                  ? `2px solid ${theme.palette.primary.main}`
                  : "2px solid transparent",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-2px)",
              },
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => handleSelectModel(model.id)}
            elevation={1}
          >
            <CardContent
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  noWrap
                  title={model.name}
                  sx={{ maxWidth: "70%", fontWeight: 600 }}
                >
                  {model.name}
                </Typography>
                {model.id === selectedModel && (
                  <Chip
                    label={<Check size={14} />}
                    size="small"
                    color="primary"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      "& .MuiChip-label": { p: 0 },
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 1.5,
                  flexGrow: 1,
                }}
              >
                {model.description || "No description available"}
              </Typography>
              <Box sx={{ mt: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Context: {((model.context_length || 0) / 1000).toFixed(0)}k
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title="Price per token">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mr: 0.5,
                        }}
                      >
                        <DollarSign size={12} color="#666" />
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {formatPrice(model.pricing?.prompt || "0")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {model.architecture?.input_modalities?.map((modality) => (
                    <Chip
                      key={`input-${modality}`}
                      label={modality}
                      size="small"
                      sx={{ height: 20, fontSize: "0.6rem", borderRadius: 1 }}
                      color={modality === "image" ? "secondary" : "primary"}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">Select AI Model</Typography>
        <IconButton onClick={handleClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Search and Sort Controls - Disabled during initial loading */}
      <Box
        sx={{
          px: 3,
          pb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          opacity: initialLoading ? 0.5 : 1,
          pointerEvents: initialLoading ? "none" : "auto",
        }}
      >
        <TextField
          placeholder="Search models..."
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={initialLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOption}
            onChange={handleSortChange}
            label="Sort By"
            IconComponent={ChevronDown}
            disabled={initialLoading}
          >
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
            <MenuItem value="context-desc">Context Length</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Modality Filters - Disabled during initial loading */}
      <Box
        sx={{
          px: 3,
          pb: 2,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
          opacity: initialLoading ? 0.5 : 1,
          pointerEvents: initialLoading ? "none" : "auto",
        }}
      >
        <Typography variant="body2" sx={{ mr: 1 }}>
          Input Type:
        </Typography>
        {INPUT_MODALITIES.map((modality) => (
          <Chip
            key={modality.value}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {modality.icon}
                <Typography variant="caption">{modality.label}</Typography>
              </Box>
            }
            onClick={() => handleModalityChange(modality.value)}
            disabled={initialLoading}
            color={
              selectedModalities.includes(modality.value)
                ? "primary"
                : "default"
            }
            sx={{
              borderRadius: 1.5,
              "&:hover": { opacity: 0.9 },
            }}
          />
        ))}
        {(searchQuery ||
          selectedModalities.length > 0 ||
          sortOption !== "price-asc") && (
          <Button
            size="small"
            onClick={resetFilters}
            disabled={initialLoading}
            sx={{ ml: "auto", fontSize: "0.75rem" }}
          >
            Reset Filters
          </Button>
        )}
      </Box>

      <Divider />

      <DialogContent sx={{ p: 2, minHeight: 400 }}>
        {initialLoading || (loading && !modelsData) ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              {initialLoading ? "Loading models..." : "Updating results..."}
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
              gap: 2,
            }}
          >
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Button
              onClick={() =>
                fetchModels({
                  search: searchQuery,
                  modalities: selectedModalities,
                  sort: sortOption,
                  page: currentPage,
                })
              }
              variant="contained"
              size="small"
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Loading overlay for subsequent requests */}
            {loading && modelsData && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography variant="caption" color="text.secondary">
                    Updating...
                  </Typography>
                </Box>
              </Box>
            )}

            {!modelsData ||
            (typeof modelsData.models === "object" &&
              Object.keys(modelsData.models).length === 0) ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <Typography>No models match your filters</Typography>
              </Box>
            ) : (
              <>
                {/* Results Info */}
                {modelsData && (
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing{" "}
                      {Array.isArray(modelsData.models)
                        ? modelsData.models.length
                        : Object.values(modelsData.models).flat().length}{" "}
                      of {modelsData.pagination.total} models
                    </Typography>
                  </Box>
                )}

                {/* Models Display */}
                {modelsData &&
                typeof modelsData.models === "object" &&
                !Array.isArray(modelsData.models)
                  ? // Grouped display
                    Object.entries(modelsData.models).map(
                      ([modality, modalityModels]) => (
                        <Box key={modality} sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1.5, fontWeight: 600, px: 1 }}
                          >
                            {modality}
                          </Typography>
                          {renderModelCards(modalityModels)}
                        </Box>
                      )
                    )
                  : // Flat display
                    modelsData &&
                    Array.isArray(modelsData.models) &&
                    renderModelCards(modelsData.models)}

                {/* Pagination */}
                {modelsData && modelsData.pagination.totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                  >
                    <Pagination
                      count={modelsData.pagination.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                      disabled={loading}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectorPopup;