import React from 'react';
import { Container } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <Container maxWidth="sm">
      <RegisterForm />
    </Container>
  );
};

export default Register;
