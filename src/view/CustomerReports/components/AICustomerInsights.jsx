import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const AICustomerInsights = ({ 
  customerMetrics,
  rfmData,
  retentionData,
  demographicsData,
  journeyData,
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
  }, [customerMetrics, rfmData, retentionData, timeRange]);

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
        customerBase: {
          totalCustomers: customerMetrics.totalCustomers || 0,
          activeCustomers: customerMetrics.activeCustomers || 0,
          newCustomers: customerMetrics.newCustomers || 0,
          returningCustomers: customerMetrics.returningCustomers || 0
        },
        rfm: {
          avgRecency: rfmData.avgRecency || 0,
          avgFrequency: rfmData.avgFrequency || 0,
          avgMonetary: rfmData.avgMonetary || 0,
          topSegment: rfmData.segments?.[0]?.name || 'Unknown'
        },
        retention: {
          retentionRate: retentionData.retentionRate || 0,
          churnRate: retentionData.churnRate || 0,
          atRiskCount: retentionData.atRiskCount || 0,
          avgLifespan: retentionData.avgLifespan || 0
        },
        demographics: {
          topLocation: demographicsData.topLocation || 'Unknown',
          topCategory: demographicsData.topCategory || 'Unknown',
          topPaymentMethod: demographicsData.topPaymentMethod || 'Unknown'
        },
        journey: {
          avgTimeToFirstPurchase: journeyData.avgTimeToFirstPurchase || 0,
          avgTimeBetweenOrders: journeyData.avgTimeBetweenOrders || 0,
          cartAbandonmentRate: journeyData.cartAbandonmentRate || 0
        },
        timeRange: timeRange
      };

      const prompt = `You are an expert Customer Success and CRM strategist for a Philippine e-commerce technology business. Analyze the following customer data and provide strategic, actionable insights.

**IMPORTANT: All currency amounts are in Philippine Pesos (₱). Always use ₱ symbol and format numbers with commas.**

**Customer Data for ${getTimeRangeText()}:**
${JSON.stringify(analysisData, null, 2)}

**Context:**
- Philippine e-commerce business (Computer hardware, gaming peripherals)
- Target: Tech enthusiasts, gamers, PC builders
- Market: Competitive with focus on customer loyalty

**Your task:**
1. **Customer Health Summary** (2-3 sentences): Assess overall customer base health. Mention specific metrics for retention, churn, and engagement levels.

2. **Critical Customer Insights** (5-7 bullet points):
   - Customer acquisition effectiveness (new vs returning ratio)
   - Retention and churn analysis (health check)
   - RFM segment distribution (are customers engaged?)
   - Purchase frequency patterns
   - At-risk customer concerns
   - Customer lifetime potential
   - Loyalty program effectiveness

3. **Behavioral Analysis** (2-3 sentences): Analyze customer purchase behavior, journey patterns, and engagement levels. Identify opportunities to improve conversion.

4. **Churn Risk Analysis** (2-3 sentences): Evaluate churn risk, identify warning signs, and assess at-risk customers who need immediate attention.

5. **Strategic Customer Recommendations** (6-8 actionable items):
   - Retention strategies (reduce churn, increase repeat purchases)
   - Engagement campaigns (re-activate dormant customers)
   - Loyalty program enhancements
   - Personalization opportunities
   - Cart abandonment recovery
   - Customer lifetime value optimization
   - Segment-specific marketing
   - Referral and advocacy programs

**Format your response as JSON with this exact structure:**
{
  "executiveSummary": "string (use ₱ for amounts if mentioned)",
  "keyFindings": ["string", "string", ...],
  "behavioralAnalysis": "string",
  "churnRiskAnalysis": "string",
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "description": "string (specific and actionable)",
      "expectedImpact": "string (quantify in customers, %, or ₱)",
      "category": "retention|acquisition|engagement|loyalty"
    }
  ]
}

**Style Guidelines:**
- Be specific with numbers and percentages
- Focus on actionable customer strategies
- Consider Philippine market context (relationship-driven culture)
- Provide practical tactics that can be implemented quickly
- Emphasize retention over acquisition (cheaper to keep than acquire)`;

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
              content: 'You are an expert Customer Success strategist and CRM analyst. Provide clear, actionable customer insights. Always respond with valid JSON only.'
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
          behavioralAnalysis: '',
          churnRiskAnalysis: '',
          recommendations: []
        };
      }

      setInsights({
        ...parsedInsights,
        customerData: analysisData,
        generatedAt: new Date().toLocaleString()
      });

    } catch (err) {
      console.error('Error generating AI insights:', err);
      setError(err.message || 'Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
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
      case 'retention': return <TrendingUpIcon fontSize="small" />;
      case 'acquisition': return <PeopleIcon fontSize="small" />;
      case 'engagement': return <LightbulbIcon fontSize="small" />;
      case 'loyalty': return <AIIcon fontSize="small" />;
      default: return <LightbulbIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Analyzing customer data with AI...
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
                  AI Customer Intelligence
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
              👥 Customer Health Summary
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
              🔍 Critical Customer Insights
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

            {/* Behavioral & Churn Analysis */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                🎯 Behavioral Analysis
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', mb: 2 }}>
                <Typography variant="body2">
                  {insights.behavioralAnalysis}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                ⚠️ Churn Risk Analysis
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee' }}>
                <Typography variant="body2">
                  {insights.churnRiskAnalysis}
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
              💡 Strategic Customer Recommendations
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
          <strong>Note:</strong> These AI-generated insights are based on your current customer data patterns. 
          Always validate findings with actual customer feedback and market conditions.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AICustomerInsights;
