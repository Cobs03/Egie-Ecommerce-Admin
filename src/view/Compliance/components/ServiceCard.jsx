import React from 'react';
import { Card, CardContent, Typography, Grid, Chip, Button, Box } from '@mui/material';

const ServiceCard = ({ 
  service, 
  getStatusIcon, 
  getRiskColor, 
  getStatusColor 
}) => {
  return (
    <Card sx={{ width: '100%', border: '1px solid #e0e0e0' }}>
      <CardContent>
        {/* Header: Name/Icon and Status Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: 28 }}>
              {getStatusIcon(service.status)}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {service.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {service.category}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {service.required && (
              <Chip label="Required" size="small" color="primary" />
            )}
            <Chip 
              label={`${service.riskLevel.toUpperCase()} RISK`} 
              size="small" 
              color={getRiskColor(service.riskLevel)}
            />
            <Chip 
              label={service.status.replace('_', ' ').toUpperCase()} 
              size="small" 
              color={getStatusColor(service.status)}
            />
          </Box>
        </Box>

        {/* Data Processed */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Data Processed:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {service.dataProcessed.map((data, idx) => (
              <Chip key={idx} label={data} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        {/* Info Grid */}
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Data Location
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {service.location}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              DPA Status
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {service.dpaStatus}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Data Retention
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {service.dataRetention}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Last Audit
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {service.lastAudit}
            </Typography>
          </Grid>
        </Grid>

        {/* Certifications */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Certifications:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {service.certifications.map((cert, idx) => (
              <Chip 
                key={idx} 
                label={`✓ ${cert}`} 
                size="small" 
                color="success"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Sub-Processors */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Sub-Processors:
          </Typography>
          <Typography variant="body2">
            {service.subProcessors.join(', ')}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            href={service.privacyPolicy}
            target="_blank"
            rel="noopener noreferrer"
          >
            VIEW PRIVACY POLICY →
          </Button>
          <Button
            size="small"
            variant="outlined"
            href={`/legal/dpa-templates/DPA-${service.id.toUpperCase()}.md`}
          >
            VIEW DPA TEMPLATE →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
