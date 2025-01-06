import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, List, ListItem, ListItemText, Button, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/router';

const FeedbackSessionsPage = () => {
  const [feedbackSessions, setFeedbackSessions] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const router = useRouter();

  useEffect(() => {
    loadFeedbackSessions();
  }, []);

  const loadFeedbackSessions = async () => {
    try {
      const response = await fetch('/api/admin/feedback-sessions');
      const data = await response.json();
      setFeedbackSessions(data);
    } catch (error) {
      showNotification('Error loading feedback sessions', 'error');
    }
  };

  const handleEdit = (sessionId) => {
    router.push(`/admin/edit-feedback-session/${sessionId}`);
  };

  const handleDeleteFeedbackSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/admin/feedback-session/${sessionId}`, { method: 'DELETE' });
      if (response.ok) {
        loadFeedbackSessions(); // Refresh the list of feedback sessions
        showNotification('Feedback session deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Error deleting feedback session', 'error');
      }
    } catch (error) {
      showNotification('Error deleting feedback session', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Feedback Sessions
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          {feedbackSessions.map((session) => (
            <ListItem key={session.id}>
              <ListItemText
                primary={`Tester: ${session.tester_name}`}
                secondary={`Division: ${session.division_name}, Venue: ${session.venue_name}, Date: ${new Date(session.session_datetime).toLocaleString()}`}
              />
              <Button variant="outlined" color="primary" onClick={() => handleEdit(session.id)}>
                Edit
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteFeedbackSession(session.id)}>
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackSessionsPage; 