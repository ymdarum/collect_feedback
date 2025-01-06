import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Button, 
  Snackbar, 
  Alert, 
  Grid, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem 
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import QuestionSection from './QuestionSection';
import { fetchDivisions, fetchVenues } from '../utils/api';
import { useRouter } from 'next/router';
import { useApi } from '../hooks/useApi';

function FeedbackForm() {
  const [formData, setFormData] = useState({
    tester_name: '',
    division_id: '',
    venue_id: '',
    session_datetime: new Date(),
    responses: [{ 
      question: '', 
      chatbot_answer: '', 
      accuracy_score: 3, 
      relevancy_score: 3, 
      performance_score: 3, 
      additional_comments: '' 
    }]
  });

  const [divisions, setDivisions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const router = useRouter();

  const { execute: loadDivisions, loading: loadingDivisions } = useApi(fetchDivisions);
  const { execute: loadVenues, loading: loadingVenues } = useApi(fetchVenues);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [divisionsData, venuesData] = await Promise.all([
          loadDivisions(),
          loadVenues()
        ]);
        setDivisions(divisionsData || []);
        setVenues(venuesData || []);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Error loading data. Please refresh the page.',
          severity: 'error'
        });
      }
    };

    loadData();
  }, [loadDivisions, loadVenues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      session_datetime: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push({
      pathname: '/confirmation',
      query: { formData: JSON.stringify(formData) }
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleResponseChange = (index, field, value) => {
    const newResponses = [...formData.responses];
    newResponses[index] = {
      ...newResponses[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      responses: newResponses
    }));
  };

  const addQuestion = () => {
    if (formData.responses.length < 10) {
      setFormData(prev => ({
        ...prev,
        responses: [...prev.responses, {
          question: '',
          chatbot_answer: '',
          accuracy_score: 3,
          relevancy_score: 3,
          performance_score: 3,
          additional_comments: ''
        }]
      }));
    }
  };

  const removeQuestion = (index) => {
    if (formData.responses.length > 1) {
      setFormData(prev => ({
        ...prev,
        responses: prev.responses.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tester Name"
                name="tester_name"
                value={formData.tester_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Division</InputLabel>
                <Select
                  name="division_id"
                  value={formData.division_id}
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
              <FormControl fullWidth required>
                <InputLabel>Venue</InputLabel>
                <Select
                  name="venue_id"
                  value={formData.venue_id}
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
                value={formData.session_datetime}
                onChange={handleDateChange}
                slots={{
                  textField: (params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      variant="outlined"
                    />
                  )
                }}
              />
            </Grid>
          </Grid>

          {formData.responses.map((response, index) => (
            <QuestionSection
              key={index}
              response={response}
              index={index}
              onResponseChange={handleResponseChange}
              onDelete={removeQuestion}
              isOnly={formData.responses.length === 1}
            />
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={addQuestion}
              disabled={formData.responses.length >= 10}
            >
              Add Question
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Feedback
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default FeedbackForm;