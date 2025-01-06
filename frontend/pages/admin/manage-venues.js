import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Snackbar, Alert } from '@mui/material';

const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState('');
  const [editingVenue, setEditingVenue] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    const response = await fetch('/api/admin/venues');
    const data = await response.json();
    setVenues(data);
  };

  const handleAddOrUpdateVenue = async (e) => {
    e.preventDefault();
    if (!newVenue.trim()) return;

    try {
      if (editingVenue) {
        // Update existing venue
        await fetch(`/api/admin/venue/${editingVenue.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newVenue }),
        });
        setEditingVenue(null);
      } else {
        // Add new venue
        await fetch('/api/admin/venue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newVenue }),
        });
      }
      setNewVenue('');
      loadVenues();
      showNotification(editingVenue ? 'Venue updated successfully' : 'Venue added successfully');
    } catch (error) {
      showNotification('Error saving venue', 'error');
    }
  };

  const handleDeleteVenue = async (id) => {
    try {
        const response = await fetch(`/api/admin/venue/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadVenues(); // Refresh the list of venues
            showNotification('Venue deleted successfully');
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Error deleting venue', 'error');
        }
    } catch (error) {
        showNotification('Error deleting venue', 'error');
    }
  };

  const handleEditVenue = (venue) => {
    setNewVenue(venue.name);
    setEditingVenue(venue);
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
        Manage Venues
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleAddOrUpdateVenue}>
          <TextField
            fullWidth
            label="Venue Name"
            value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {editingVenue ? 'Update Venue' : 'Add Venue'}
          </Button>
        </form>
        <List>
          {venues.map((venue) => (
            <ListItem key={venue.id}>
              <ListItemText primary={venue.name} />
              <Button variant="outlined" color="secondary" onClick={() => handleEditVenue(venue)}>Edit</Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteVenue(venue.id)}>Delete</Button>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageVenues; 