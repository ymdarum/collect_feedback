import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const AdminPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" href="/admin/feedback-sessions">View Feedback Sessions</Button>
        <Button variant="contained" href="/admin/configure-divisions">Configure Divisions</Button>
        <Button variant="contained" href="/admin/manage-venues">Manage Venues</Button>
      </Box>
    </Container>
  );
};

export default AdminPage; 