import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Snackbar, Alert } from '@mui/material';

const ConfigureDivisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [newDivision, setNewDivision] = useState('');
  const [editingDivision, setEditingDivision] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    const response = await fetch('/api/admin/divisions');
    const data = await response.json();
    setDivisions(data);
  };

  const handleAddOrUpdateDivision = async (e) => {
    e.preventDefault();
    if (!newDivision.trim()) return;

    try {
      if (editingDivision) {
        // Update existing division
        await fetch(`/api/admin/division/${editingDivision.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newDivision }),
        });
        setEditingDivision(null);
      } else {
        // Add new division
        await fetch('/api/admin/division', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newDivision }),
        });
      }
      setNewDivision('');
      loadDivisions();
      showNotification(editingDivision ? 'Division updated successfully' : 'Division added successfully');
    } catch (error) {
      showNotification('Error saving division', 'error');
    }
  };

  const handleDeleteDivision = async (id) => {
    try {
      const response = await fetch(`/api/admin/division/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadDivisions();
        showNotification('Division deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Error deleting division', 'error');
      }
    } catch (error) {
      showNotification('Error deleting division', 'error');
    }
  };

  const handleEditDivision = (division) => {
    setNewDivision(division.name);
    setEditingDivision(division);
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
        Configure Divisions
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleAddOrUpdateDivision}>
          <TextField
            fullWidth
            label="New Division"
            value={newDivision}
            onChange={(e) => setNewDivision(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {editingDivision ? 'Update Division' : 'Add Division'}
          </Button>
        </form>
        <List>
          {divisions.map((division) => (
            <ListItem key={division.id}>
              <ListItemText primary={division.name} />
              <Button variant="outlined" color="secondary" onClick={() => handleEditDivision(division)}>Edit</Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteDivision(division.id)}>Delete</Button>
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

export default ConfigureDivisions; 