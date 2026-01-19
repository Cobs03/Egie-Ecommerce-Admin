import React from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
import { Info } from '@mui/icons-material';

/**
 * FinancialNotes Component
 * Displays important notes and disclaimers about financial calculations
 */
const FinancialNotes = () => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Info color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Financial Notes & Methodology
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
          Revenue Calculations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Gross Revenue:</strong> Total from all completed and delivered orders
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Net Revenue:</strong> Gross Revenue - Refunds - Discounts
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Discounts:</strong> Estimated at 5% of gross revenue (include coupon codes, promotions)
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom mt={2}>
          Cost Structure (Estimated)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>COGS:</strong> 40% of revenue (product costs, manufacturing, inventory)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Shipping Costs:</strong> 8% of revenue
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Payment Fees:</strong> 3.5% of revenue (PayMongo, credit card processing)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Marketing:</strong> 10% of revenue (ads, promotions, SEO)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Operations:</strong> 12% of revenue (staff, utilities, rent, software)
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom mt={2}>
          Profit Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Gross Profit:</strong> Net Revenue - COGS
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Net Profit (EBIT):</strong> Gross Profit - Operating Expenses
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>Profit Margin:</strong> (Net Profit / Net Revenue) × 100
        </Typography>

        <Box mt={3} p={2} bgcolor="#fff3e0" borderRadius={1}>
          <Typography variant="body2" fontWeight={600} color="warning.main" gutterBottom>
            ⚠️ Important Disclaimer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            These financial reports use estimated percentages for cost calculations. For accurate financial reporting and tax filing, please integrate with your actual accounting system (e.g., QuickBooks, Xero) or consult with a certified accountant.
          </Typography>
        </Box>

        <Box mt={2} p={2} bgcolor="#e3f2fd" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>💡 Tip:</strong> Regularly review and adjust cost percentages based on your actual expenses for more accurate profit tracking.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialNotes;
