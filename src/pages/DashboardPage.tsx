import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import FeatureCard from '../components/Dashboard/FeatureCard';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Image, FileText, Code, Sparkles, Brain, Wallet, History } from 'lucide-react';
import { FeatureCard as FeatureCardType } from '../types';
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const features: FeatureCardType[] = [
    {
      id: "text-generation",
      title: "Text Generation",
      description: "Generate human-like text for various purposes",
      icon: <MessageSquare size={24} />,
      color: "#3b82f6",
      path: "/chat",
    },
    {
      id: "image-generation",
      title: "Image Generation",
      description: "Create unique images from text descriptions",
      icon: <Image size={24} />,
      color: "#ec4899",
      path: "/image-generator",
    },
    {
      id: "document-analysis",
      title: "Document Analysis",
      description: "Extract insights from documents",
      icon: <FileText size={24} />,
      color: "#10b981",
      path: "/document-analysis",
    },
    {
      id: "code-generation",
      title: "Code Assistant",
      description: "Generate code and solve programming problems",
      icon: <Code size={24} />,
      color: "#7c3aed",
      path: "/code-assistant",
    },
    {
      id: "fine-tuning",
      title: "Fine-tuning",
      description: "Customize AI models to your specific needs",
      icon: <Sparkles size={24} />,
      color: "#f59e0b",
      path: "/fine-tuning",
    },
    {
      id: "advanced-reasoning",
      title: "Advanced Reasoning",
      description: "Solve complex problems with multi-step reasoning",
      icon: <Brain size={24} />,
      color: "#ef4444",
      path: "/advanced-reasoning",
    },
    {
      id: "topup",
      title: "Add Credits",
      description: "Purchase more credits to use our services",
      icon: <Wallet size={24} />,
      color: "#14b8a6",
      path: "/topup",
    },
    {
      id: "history",
      title: "Usage History",
      description: "View your past activities and usage stats",
      icon: <History size={24} />,
      color: "#8b5cf6",
      path: "/history",
    },
  ];
  

  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Container>
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Welcome, {user?.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Your current balance:{" "}
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  {user?.balance?.toLocaleString() || 0} IDR
                </Box>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Wallet size={18} />}
                onClick={() => navigate("/topup")}
              >
                Top Up Balance
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={feature.id}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  path={feature.path}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;