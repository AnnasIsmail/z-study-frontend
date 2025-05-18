import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, Ban as Bank, Coins } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { createTopup } from '../services/topup';

const TOPUP_AMOUNTS = [
  { value: 100000, label: '100,000', credits: '100,000' },
  { value: 250000, label: '250,000', credits: '250,000' },
  { value: 500000, label: '500,000', credits: '500,000 + 25,000 bonus' },
  { value: 1000000, label: '1,000,000', credits: '1,000,000 + 100,000 bonus' }
];

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard size={20} /> },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <Bank size={20} /> }
];

const TopupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(TOPUP_AMOUNTS[0].value);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTopup = async () => {
    setError('');
    setLoading(true);

    try {
      const finalAmount = customAmount ? parseInt(customAmount) : amount;
      
      if (finalAmount < 10000) {
        throw new Error('Minimum topup amount is 10,000 IDR');
      }

      const response = await createTopup(finalAmount);
      
      if (response.success) {
        // Redirect to payment URL
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.message || 'Failed to process topup');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process topup');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setAmount(0); // Reset predefined amount selection
  };

  const handlePredefinedAmountChange = (value: number) => {
    setAmount(value);
    setCustomAmount(''); // Reset custom amount
  };

  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Top Up Balance
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Coins size={20} />
            <Typography variant="h6" color="text.secondary">
              Current Balance: <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>{user?.balance?.toLocaleString()} IDR</Box>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Topup successful! Your balance will be updated shortly.
            </Alert>
          )}

          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Select Amount
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
              {TOPUP_AMOUNTS.map((option) => (
                <Button
                  key={option.value}
                  variant={amount === option.value ? "contained" : "outlined"}
                  onClick={() => handlePredefinedAmountChange(option.value)}
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  <Typography variant="h6" component="span" sx={{ mb: 1 }}>
                    {option.label} IDR
                  </Typography>
                  <Typography variant="body2" color={amount === option.value ? 'inherit' : 'text.secondary'}>
                    Get {option.credits} credits
                  </Typography>
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Or enter custom amount:
            </Typography>

            <TextField
              fullWidth
              label="Custom Amount (IDR)"
              value={customAmount}
              onChange={handleCustomAmountChange}
              type="text"
              placeholder="Minimum 10,000 IDR"
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>IDR</Typography>,
              }}
            />

            <Divider sx={{ my: 4 }} />

            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                Payment Method
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <FormControlLabel
                    key={method.value}
                    value={method.value}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {method.icon}
                        {method.label}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleTopup}
              disabled={loading || (!amount && !customAmount)}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Wallet />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default TopupPage;