import React, { useState } from 'react';
import { Container, Typography, Button, Box, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/router';

const ConfirmationPage = () => {
  const router = useRouter();
  const { formData } = router.query; // Retrieve formData from query parameters

  // Parse the formData from JSON string to object
  const parsedFormData = formData ? JSON.parse(formData) : null;

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedFormData),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Error submitting feedback', 'error');
      }
    } catch (error) {
      showNotification('Error submitting feedback', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (!parsedFormData) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Confirm Your Submission
      </Typography>
      <Box>
        <Typography variant="h6">Tester Name: {parsedFormData.tester_name}</Typography>
        <Typography variant="h6">Division ID: {parsedFormData.division_id}</Typography>
        <Typography variant="h6">Venue ID: {parsedFormData.venue_id}</Typography>
        <Typography variant="h6">Session Date/Time: {parsedFormData.session_datetime}</Typography>
        <Typography variant="h6">Responses:</Typography>
        {parsedFormData.responses.map((response, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body1">Question: {response.question}</Typography>
            <Typography variant="body1">Answer: {response.chatbot_answer}</Typography>
            <Typography variant="body1">Accuracy Score: {response.accuracy_score}</Typography>
            <Typography variant="body1">Relevancy Score: {response.relevancy_score}</Typography>
            <Typography variant="body1">Performance Score: {response.performance_score}</Typography>
            <Typography variant="body1">Additional Comments: {response.additional_comments}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm Submission
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => router.back()} sx={{ ml: 2 }}>
          Edit Submission
        </Button>
      </Box>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfirmationPage; 