import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FaExclamationTriangle } from 'react-icons/fa';

const ActionItemsCard = () => {
  return (
    <Card sx={{ mt: 3, bgcolor: '#fef9c3', border: '1px solid #fde047' }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FaExclamationTriangle style={{ fontSize: 24, color: '#ca8a04', marginTop: 4 }} />
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Action Required
            </Typography>
            <Typography component="div" variant="body2">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Execute Data Processing Agreements with PayMongo, Groq, Resend, and OpenAI</li>
                <li>Obtain updated compliance certificates from all service providers</li>
                <li>Verify and document sub-processor lists for each service</li>
                <li>Schedule quarterly compliance reviews and audits</li>
                <li>Implement zero-retention modes for Groq and OpenAI services</li>
                <li>Document data transfer impact assessments for US-based services</li>
              </ul>
            </Typography>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActionItemsCard;
