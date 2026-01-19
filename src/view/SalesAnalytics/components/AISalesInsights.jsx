import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const AISalesInsights = ({ 
  salesOverview, 
  productPerformance, 
  salesTrend,
  brandPerformance,
  categoryPerformance,
  timeRange 
}) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    analysis: true,
    recommendations: true
  });

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

  useEffect(() => {
    generateAIInsights();
  }, [salesOverview, productPerformance, salesTrend, timeRange]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateAIInsights = async () => {
    if (!apiKey) {
      setError('AI service not configured. Please add VITE_GROQ_API_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for AI analysis
      const analysisData = {
        overview: {
          totalRevenue: salesOverview.totalRevenue || 0,
          totalOrders: salesOverview.totalOrders || 0,
          avgOrderValue: salesOverview.avgOrderValue || 0,
          topProduct: salesOverview.topProduct?.name || 'None'
        },
        topProducts: (productPerformance || []).slice(0, 5).map(p => ({
          name: p.product_name,
          unitsSold: p.quantity_sold,
          revenue: p.total_revenue,
          trend: p.trend_percentage || 0
        })),
        salesTrend: (salesTrend || []).map(t => ({
          date: t.date,
          revenue: t.revenue,
          orders: t.orders
        })),
        brands: (brandPerformance || []).slice(0, 3).map(b => ({
          name: b.brand_name,
          revenue: b.total_revenue,
          units: b.total_units
        })),
        categories: (categoryPerformance || []).slice(0, 3).map(c => ({
          name: c.category_name,
          revenue: c.total_revenue,
          units: c.total_units
        })),
        timeRange: timeRange
      };

      const prompt = `You are an expert business analyst for a Philippine e-commerce technology store specializing in computer hardware and gaming peripherals. Analyze the following sales data and provide detailed, actionable insights in a professional yet conversational tone.

**IMPORTANT: All currency amounts are in Philippine Pesos (₱). Always use ₱ symbol and format numbers with commas (e.g., ₱1,345,160.00).**

**Sales Data for ${getTimeRangeText()}:**
${JSON.stringify(analysisData, null, 2)}

**Context:**
- This is a Philippine e-commerce business
- Products include graphics cards, processors, motherboards, gaming peripherals
- Target customers are PC builders, gamers, and tech enthusiasts
- Currency: Philippine Peso (₱)

**Your task:**
1. **Executive Summary** (2-3 sentences): Provide an overall assessment of business performance. Mention specific revenue figures in ₱, growth trends, and key drivers.

2. **Key Findings** (4-6 bullet points): 
   - Highlight revenue trends with specific ₱ amounts
   - Identify best-selling categories/brands and their contribution
   - Note any unusual patterns (high AOV, low order volume, seasonal trends)
   - Mention inventory concerns or opportunities
   - Compare performance across product categories

3. **Product Performance Analysis** (2-3 sentences): Analyze top-performing products with specific sales figures in ₱. Identify opportunities to promote complementary products or address underperforming items.

4. **Strategic Recommendations** (4-6 actionable items): Provide specific, prioritized recommendations such as:
   - Marketing strategies (promotions, bundles, seasonal campaigns)
   - Inventory optimization (restock high-demand items, phase out slow movers)
   - Customer acquisition/retention tactics
   - Pricing strategies
   - Product mix improvements
   - Cross-selling and upselling opportunities

**Format your response as JSON with this exact structure:**
{
  "executiveSummary": "string (use ₱ for all amounts)",
  "keyFindings": ["string", "string", ...] (use ₱ for all amounts),
  "productAnalysis": "string (use ₱ for all amounts)",
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "description": "string (be specific and actionable)",
      "expectedImpact": "string (quantify if possible, use ₱)"
    }
  ]
}

**Style Guidelines:**
- Use Philippine Peso (₱) for ALL monetary values
- Be specific with numbers and percentages
- Provide actionable, not generic, advice
- Consider the Philippine market context
- Focus on practical strategies that can be implemented immediately`;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert e-commerce business analyst specializing in retail technology. Provide clear, actionable insights based on sales data. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Parse AI response (handle potential markdown code blocks)
      let parsedInsights;
      try {
        // Remove markdown code blocks if present
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                         [null, aiResponse];
        const cleanJson = jsonMatch[1] || aiResponse;
        parsedInsights = JSON.parse(cleanJson.trim());
      } catch (e) {
        // Fallback if parsing fails
        parsedInsights = {
          executiveSummary: aiResponse,
          keyFindings: [],
          productAnalysis: '',
          recommendations: []
        };
      }

      setInsights({
        ...parsedInsights,
        salesData: analysisData,
        generatedAt: new Date().toLocaleString()
      });

    } catch (err) {
      console.error('Error generating AI insights:', err);
      setError(err.message || 'Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Period';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Analyzing your sales data with AI...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={generateAIInsights}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          <Typography variant="subtitle2" gutterBottom>Unable to Generate AI Insights</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!insights) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No insights available. Please check your sales data and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AIIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                AI Sales Insights
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Powered by Llama 3.3 • {getTimeRangeText()}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={generateAIInsights}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(insights.salesData.overview.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {insights.salesData.overview.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Order Value
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(insights.salesData.overview.avgOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top Product
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary" noWrap>
                {insights.salesData.overview.topProduct}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Executive Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon sx={{ color: '#667eea' }} />
              <Typography variant="h6" fontWeight="bold">
                Executive Summary
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => toggleSection('summary')}>
              {expandedSections.summary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.summary}>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
              {insights.executiveSummary}
            </Typography>
          </Collapse>
        </CardContent>
      </Card>

      {/* Key Findings */}
      {insights.keyFindings && insights.keyFindings.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#ffa726' }} />
                <Typography variant="h6" fontWeight="bold">
                  Key Findings
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => toggleSection('analysis')}>
                {expandedSections.analysis ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={expandedSections.analysis}>
              <Box sx={{ pl: 4 }}>
                {insights.keyFindings.map((finding, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#667eea', 
                      mt: 1,
                      mr: 2,
                      flexShrink: 0
                    }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {finding}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {insights.productAnalysis && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
                    {insights.productAnalysis}
                  </Typography>
                </>
              )}
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon sx={{ color: '#66bb6a' }} />
                <Typography variant="h6" fontWeight="bold">
                  Strategic Recommendations
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => toggleSection('recommendations')}>
                {expandedSections.recommendations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={expandedSections.recommendations}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {insights.recommendations.map((rec, index) => (
                  <Paper 
                    key={index} 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      borderLeft: `4px solid`,
                      borderLeftColor: getPriorityColor(rec.priority) + '.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rec.title}
                      </Typography>
                      <Chip 
                        label={rec.priority?.toUpperCase() || 'MEDIUM'} 
                        size="small" 
                        color={getPriorityColor(rec.priority)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rec.description}
                    </Typography>
                    {rec.expectedImpact && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main" fontWeight="medium">
                          Expected Impact: {rec.expectedImpact}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Box sx={{ mt: 3, p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Generated at {insights.generatedAt} • Analysis is based on available data for {getTimeRangeText()}
        </Typography>
      </Box>
    </Box>
  );
};

export default AISalesInsights;
