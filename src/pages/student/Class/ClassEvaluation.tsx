import React, { useState } from 'react';
import { Box, Typography, Button, FormControl, FormControlLabel, Radio, RadioGroup, Paper, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';

interface EvaluationQuestion {
  id: number;
  question: string;
}

const evaluationQuestions: EvaluationQuestion[] = [
  {
    id: 1,
    question: "How would you rate the lecturer's teaching effectiveness?"
  },
  {
    id: 2,
    question: "How well does the lecturer explain complex concepts?"
  },
  {
    id: 3,
    question: "How would you rate the lecturer's responsiveness to student questions?"
  },
  {
    id: 4,
    question: "How well does the lecturer organize and structure the course material?"
  },
  {
    id: 5,
    question: "How would you rate the overall quality of this course?"
  }
];

const ClassEvaluation: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [isActive, setIsActive] = useState(true); // Set to true for testing
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the answers to your backend
    setSubmitted(true);
  };

  const isFormValid = () => {
    return evaluationQuestions.every(q => answers[q.id]);
  };

  if (!isActive) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Evaluation period is currently inactive. Please check back later.
        </Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Submitted
        </Typography>
        <Typography variant="h5">
          Thank you for your response!
        </Typography>
      </Box>
    );
  }

  if (!showForm) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Evaluation page is active
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
        >
          Start Evaluation
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Course Evaluation
        </Typography>
        <form onSubmit={handleSubmit}>
          {evaluationQuestions.map((question) => (
            <FormControl key={question.id} component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {question.question}
              </Typography>
              <RadioGroup
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                <FormControlLabel
                  value="very_satisfied"
                  control={<Radio />}
                  label="Very Satisfied"
                />
                <FormControlLabel
                  value="satisfied"
                  control={<Radio />}
                  label="Satisfied"
                />
                <FormControlLabel
                  value="neutral"
                  control={<Radio />}
                  label="Neutral"
                />
                <FormControlLabel
                  value="unsatisfied"
                  control={<Radio />}
                  label="Unsatisfied"
                />
                <FormControlLabel
                  value="very_unsatisfied"
                  control={<Radio />}
                  label="Very Unsatisfied"
                />
              </RadioGroup>
            </FormControl>
          ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
            sx={{ mt: 2 }}
          >
            Submit Evaluation
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ClassEvaluation; 