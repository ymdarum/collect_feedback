import { Container, Typography, Box, Button } from '@mui/material';
import FeedbackForm from '../components/FeedbackForm';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chatbot Feedback Form
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          href="/admin"
        >
          Admin Dashboard
        </Button>
      </Box>
      <FeedbackForm />
    </Container>
  );
}