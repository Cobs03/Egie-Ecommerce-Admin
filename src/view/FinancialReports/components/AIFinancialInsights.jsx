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
  Collapse,
  Button
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const AIFinancialInsights = ({ 
  financialData,
  revenueData,
  profitData,
  cashFlowData,
  productData,
  metricsData,
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
  }, [financialData, revenueData, profitData, timeRange]);

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
      const analysisData = {
        overview: {
          grossRevenue: revenueData.grossRevenue || 0,
          netRevenue: revenueData.netRevenue || 0,
          refunds: revenueData.refunds || 0,
          discounts: revenueData.discounts || 0,
          avgOrderValue: revenueData.avgOrderValue || 0,
          totalOrders: revenueData.totalOrders || 0
        },
        profitability: {
          grossProfit: profitData.grossProfit || 0,
          netProfit: profitData.netProfit || 0,
          cogs: profitData.cogs || 0,
          grossMargin: profitData.netRevenue > 0 ? ((profitData.grossProfit / profitData.netRevenue) * 100).toFixed(1) : 0,
          netMargin: profitData.netRevenue > 0 ? ((profitData.netProfit / profitData.netRevenue) * 100).toFixed(1) : 0,
          operatingExpenses: profitData.totalOperatingExpenses || 0
        },
        cashFlow: {
          inflow: cashFlowData.inflow || 0,
          outflow: cashFlowData.outflow || 0,
          netCashFlow: cashFlowData.netCashFlow || 0,
          outstandingAmount: cashFlowData.totalOutstandingAmount || 0,
          dso: cashFlowData.dso || 0
        },
        performance: {
          growthRate: metricsData.growthRate || 0,
          cac: metricsData.cac || 0,
          roas: metricsData.roas || 0,
          previousRevenue: metricsData.previous?.revenue || 0,
          currentRevenue: metricsData.current?.revenue || 0
        },
        topProducts: (productData.topProducts || []).slice(0, 5).map(p => ({
          name: p.name,
          revenue: p.revenue,
          profit: p.profit,
          margin: p.margin
        })),
        timeRange: timeRange
      };

      const prompt = `You are an expert financial analyst and CFO advisor for a Philippine e-commerce technology business. Analyze the following financial data and provide strategic, actionable insights.

**IMPORTANT: All currency amounts are in Philippine Pesos (₱). Always use ₱ symbol and format numbers with commas.**

**Financial Data for ${getTimeRangeText()}:**
${JSON.stringify(analysisData, null, 2)}

**Context:**
- Philippine e-commerce business (Computer hardware, gaming peripherals)
- Currency: Philippine Peso (₱)
- Target: Tech enthusiasts, gamers, PC builders
- Market: Highly competitive with thin margins

**Your task:**
1. **Financial Health Summary** (2-3 sentences): Assess overall financial health. Mention specific figures for revenue, profit margins, and cash position. Identify if the business is profitable and sustainable.

2. **Critical Financial Findings** (4-6 bullet points):
   - Revenue quality (gross vs net, refund rate, discount impact)
   - Profitability metrics (gross margin, net margin, COGS efficiency)
   - Cash flow health (positive/negative, liquidity concerns)
   - Cost structure efficiency (COGS, operating expenses as % of revenue)
   - Growth momentum (period-over-period comparison)
   - Customer acquisition efficiency (CAC vs AOV)

3. **Profitability Analysis** (2-3 sentences): Deep dive into profit margins. Are they healthy for the industry? Which costs are consuming profits? Product profitability insights.

4. **Cash Flow Analysis** (2-3 sentences): Evaluate cash position. Any liquidity concerns? Outstanding receivables impact? Working capital health?

5. **Strategic Financial Recommendations** (5-7 actionable items):
   - Cost reduction opportunities (negotiate supplier terms, reduce COGS)
   - Margin improvement strategies (pricing optimization, reduce discounts)
   - Cash flow optimization (faster collections, inventory management)
   - Profitability enhancement (focus on high-margin products)
   - Financial risk mitigation
   - Investment priorities
   - Operational efficiency improvements

**Format your response as JSON with this exact structure:**
{
  "executiveSummary": "string (use ₱ for all amounts)",
  "keyFindings": ["string", "string", ...] (use ₱ for all amounts),
  "profitabilityAnalysis": "string (use ₱ for all amounts)",
  "cashFlowAnalysis": "string (use ₱ for all amounts)",
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "description": "string (specific and actionable)",
      "expectedImpact": "string (quantify in ₱ or %)",
      "category": "cost|revenue|cashflow|efficiency"
    }
  ]
}

**Style Guidelines:**
- Use Philippine Peso (₱) for ALL monetary values
- Focus on financial metrics and business sustainability
- Provide CFO-level strategic advice
- Be direct about financial weaknesses and opportunities
- Quantify impact whenever possible
- Consider Philippine market conditions (inflation, competition)`;

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
              content: 'You are an expert CFO and financial analyst specializing in e-commerce business financial analysis. Provide clear, strategic financial insights. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      let parsedInsights;
      try {
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                         [null, aiResponse];
        const cleanJson = jsonMatch[1] || aiResponse;
        parsedInsights = JSON.parse(cleanJson.trim());
      } catch (e) {
        parsedInsights = {
          executiveSummary: aiResponse,
          keyFindings: [],
          profitabilityAnalysis: '',
          cashFlowAnalysis: '',
          recommendations: []
        };
      }

      setInsights({
        ...parsedInsights,
        financialData: analysisData,
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

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cost': return <TrendingDownIcon fontSize="small" />;
      case 'revenue': return <TrendingUpIcon fontSize="small" />;
      case 'cashflow': return <MoneyIcon fontSize="small" />;
      case 'efficiency': return <AssessmentIcon fontSize="small" />;
      default: return <LightbulbIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Analyzing your financial data with AI...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a moment
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={generateAIInsights}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            No insights available. Click refresh to generate AI analysis.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AIIcon sx={{ fontSize: 40, color: 'white' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="white">
                  AI Financial Insights
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Powered by Advanced AI Analysis • {insights.generatedAt}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={generateAIInsights} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              📊 Financial Health Summary
            </Typography>
            <IconButton size="small" onClick={() => toggleSection('summary')}>
              {expandedSections.summary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.summary}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {insights.executiveSummary}
              </Typography>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              🔍 Critical Financial Findings
            </Typography>
            <IconButton size="small" onClick={() => toggleSection('analysis')}>
              {expandedSections.analysis ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.analysis}>
            <Grid container spacing={2}>
              {insights.keyFindings?.map((finding, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
                    <Typography variant="body2">
                      {finding}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Profitability & Cash Flow Analysis */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                💰 Profitability Analysis
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', mb: 2 }}>
                <Typography variant="body2">
                  {insights.profitabilityAnalysis}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                💵 Cash Flow Analysis
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="body2">
                  {insights.cashFlowAnalysis}
                </Typography>
              </Paper>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              💡 Strategic Recommendations
            </Typography>
            <IconButton size="small" onClick={() => toggleSection('recommendations')}>
              {expandedSections.recommendations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.recommendations}>
            <Grid container spacing={2}>
              {insights.recommendations?.map((rec, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2.5, 
                      borderLeft: `4px solid`,
                      borderLeftColor: `${getPriorityColor(rec.priority)}.main`,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s'
                      }
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: `${getPriorityColor(rec.priority)}.light`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getCategoryIcon(rec.category)}
                      </Box>
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {rec.title}
                          </Typography>
                          <Chip 
                            label={rec.priority?.toUpperCase()} 
                            size="small" 
                            color={getPriorityColor(rec.priority)}
                          />
                          {rec.category && (
                            <Chip 
                              label={rec.category.toUpperCase()} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {rec.description}
                        </Typography>
                        {rec.expectedImpact && (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <TrendingUpIcon fontSize="small" color="success" />
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              Expected Impact: {rec.expectedImpact}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> These AI-generated insights are based on your current financial data. 
          Always consult with a certified accountant or financial advisor for critical business decisions.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AIFinancialInsights;
