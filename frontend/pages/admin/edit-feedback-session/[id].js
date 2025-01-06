import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EditFeedbackSession = () => {
  const router = useRouter();
  const { id } = router.query;
  const [sessionData, setSessionData] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSessionData();
      loadDivisionsAndVenues();
    }
  }, [id]);

  const loadSessionData = async () => {
    if (typeof window !== 'undefined') {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/feedback-session/${id}`);
        const data = await response.json();
        setSessionData(data);
      } catch (error) {
        showNotification('Error loading session data', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadDivisionsAndVenues = async () => {
    try {
      const [divisionsRes, venuesRes] = await Promise.all([
        fetch('/api/admin/divisions'),
        fetch('/api/admin/venues')
      ]);
      const [divisionsData, venuesData] = await Promise.all([
        divisionsRes.json(),
        venuesRes.json()
      ]);
      setDivisions(divisionsData);
      setVenues(venuesData);
    } catch (error) {
      showNotification('Error loading divisions and venues', 'error');
    }
  };

  const handleUpdate = async () => {
    console.log('Updating session with data:', sessionData);
    try {
      const response = await fetch(`/api/admin/feedback-session/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        showNotification('Session updated successfully');
        router.push('/admin/feedback-sessions');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Error updating session', 'error');
      }
    } catch (error) {
      showNotification('Error updating session', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResponseChange = (index, field, value) => {
    const newResponses = [...sessionData.responses];
    newResponses[index] = {
      ...newResponses[index],
      [field]: value
    };
    setSessionData(prev => ({
      ...prev,
      responses: newResponses
    }));
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (!sessionData) return <div>No data found</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Feedback Session
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tester Name"
                name="tester_name"
                value={sessionData.tester_name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Division</InputLabel>
                <Select
                  name="division_id"
                  value={sessionData.division_id}
                  onChange={handleInputChange}
                  label="Division"
                >
                  {divisions.map(div => (
                    <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select
                  name="venue_id"
                  value={sessionData.venue_id}
                  onChange={handleInputChange}
                  label="Venue"
                >
                  {venues.map(venue => (
                    <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Session Date/Time"
                value={new Date(sessionData.session_datetime)}
                onChange={(newValue) => handleInputChange({
                  target: { name: 'session_datetime', value: newValue }
                })}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Responses</Typography>
          {sessionData.responses.map((response, index) => (
            <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question"
                    value={response.question}
                    onChange={(e) => handleResponseChange(index, 'question', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Chatbot Answer"
                    value={response.chatbot_answer}
                    onChange={(e) => handleResponseChange(index, 'chatbot_answer', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Accuracy Score"
                    value={response.accuracy_score}
                    onChange={(e) => handleResponseChange(index, 'accuracy_score', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1, max: 5 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Relevancy Score"
                    value={response.relevancy_score}
                    onChange={(e) => handleResponseChange(index, 'relevancy_score', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1, max: 5 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Performance Score"
                    value={response.performance_score}
                    onChange={(e) => handleResponseChange(index, 'performance_score', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1, max: 5 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Comments"
                    value={response.additional_comments}
                    onChange={(e) => handleResponseChange(index, 'additional_comments', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Update Session
            </Button>
          </Box>
        </Paper>
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default EditFeedbackSession; 