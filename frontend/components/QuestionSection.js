import React from 'react';
import { Paper, Grid, Typography, TextField, Slider, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function QuestionSection({ 
  response, 
  index, 
  onResponseChange, 
  onDelete, 
  isOnly 
}) {
  const handleChange = (field, value) => {
    onResponseChange(index, field, value);
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={11}>
          <Typography variant="h6">Question {index + 1}</Typography>
        </Grid>
        <Grid item xs={1}>
          <IconButton
            onClick={() => onDelete(index)}
            disabled={isOnly}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Question"
            value={response.question}
            onChange={(e) => handleChange('question', e.target.value)}
            required
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Chatbot Answer"
            value={response.chatbot_answer}
            onChange={(e) => handleChange('chatbot_answer', e.target.value)}
            required
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Accuracy Score 
            <Tooltip title="Rate the accuracy of the answer (1-5)">
              <HelpOutlineIcon sx={{ ml: 1, fontSize: 20 }} />
            </Tooltip>
          </Typography>
          <Slider
            value={response.accuracy_score}
            onChange={(_, value) => handleChange('accuracy_score', value)}
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Relevancy Score
            <Tooltip title="Rate how relevant the answer is to the question (1-5)">
              <HelpOutlineIcon sx={{ ml: 1, fontSize: 20 }} />
            </Tooltip>
          </Typography>
          <Slider
            value={response.relevancy_score}
            onChange={(_, value) => handleChange('relevancy_score', value)}
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography gutterBottom>
            Performance Score
            <Tooltip title="Rate the overall performance of the chatbot (1-5)">
              <HelpOutlineIcon sx={{ ml: 1, fontSize: 20 }} />
            </Tooltip>
          </Typography>
          <Slider
            value={response.performance_score}
            onChange={(_, value) => handleChange('performance_score', value)}
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Comments"
            value={response.additional_comments}
            onChange={(e) => handleChange('additional_comments', e.target.value)}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default QuestionSection;