import React, { useState, useEffect } from "react";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaFileContract, 
  FaShieldAlt,
  FaDownload,
  FaSync
} from "react-icons/fa";
import { Typography, Grid, Button, Box } from "@mui/material";
import SummaryCard from "./components/SummaryCard";
import ServiceCard from "./components/ServiceCard";
import ActionItemsCard from "./components/ActionItemsCard";

const Compliance = () => {
  const [services, setServices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadServiceStatus();
  }, []);

  const loadServiceStatus = () => {
    // Third-party services compliance status
    const servicesData = [
      {
        id: 'paymongo',
        name: 'PayMongo',
        category: 'Payment Processing',
        status: 'pending_dpa',
        certifications: ['PCI DSS Level 1', 'ISO 27001'],
        dataProcessed: ['Payment details', 'Billing information', 'Transaction data'],
        location: 'Philippines / Singapore',
        dpaStatus: 'Not Executed',
        privacyPolicy: 'https://www.paymongo.com/privacy',
        riskLevel: 'medium',
        required: true,
        subProcessors: ['Stripe', 'PayPal'],
        dataRetention: '7 years (PCI requirement)',
        lastAudit: 'December 2025'
      },
      {
        id: 'groq',
        name: 'Groq AI',
        category: 'AI Services',
        status: 'pending_dpa',
        certifications: ['SOC 2 Type II'],
        dataProcessed: ['Chat messages', 'Product preferences', 'Session data'],
        location: 'United States',
        dpaStatus: 'Not Executed',
        privacyPolicy: 'https://groq.com/privacy-policy/',
        riskLevel: 'medium',
        required: false,
        subProcessors: ['AWS'],
        dataRetention: 'Zero retention available',
        lastAudit: 'November 2025'
      },
      {
        id: 'resend',
        name: 'Resend',
        category: 'Email Service',
        status: 'pending_dpa',
        certifications: ['SOC 2 (via AWS)', 'ISO 27001 (via AWS)'],
        dataProcessed: ['Email addresses', 'Names', 'Email content'],
        location: 'United States (AWS)',
        dpaStatus: 'Not Executed',
        privacyPolicy: 'https://resend.com/legal/privacy-policy',
        riskLevel: 'low',
        required: true,
        subProcessors: ['AWS SES'],
        dataRetention: '90 days',
        lastAudit: 'January 2026'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        category: 'Backend Infrastructure',
        status: 'compliant',
        certifications: ['SOC 2 Type II', 'ISO 27001', 'HIPAA (optional)'],
        dataProcessed: ['All user data', 'Authentication', 'Database records'],
        location: 'Singapore / US (configurable)',
        dpaStatus: 'Available in Enterprise Plan',
        privacyPolicy: 'https://supabase.com/privacy',
        riskLevel: 'low',
        required: true,
        subProcessors: ['AWS', 'Fly.io'],
        dataRetention: 'User-defined',
        lastAudit: 'December 2025'
      },
      {
        id: 'openai',
        name: 'OpenAI',
        category: 'AI Vision Services',
        status: 'pending_dpa',
        certifications: ['SOC 2 Type II'],
        dataProcessed: ['Product images', 'Vision queries'],
        location: 'United States',
        dpaStatus: 'Not Executed',
        privacyPolicy: 'https://openai.com/privacy',
        riskLevel: 'low',
        required: false,
        subProcessors: ['Azure', 'Microsoft'],
        dataRetention: '30 days (opt-out available)',
        lastAudit: 'December 2025'
      }
    ];

    setServices(servicesData);
    setLastUpdated(new Date());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'pending_dpa':
        return 'warning';
      case 'non_compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <FaCheckCircle className="text-green-600" />;
      case 'pending_dpa':
        return <FaExclamationTriangle className="text-yellow-600" />;
      case 'non_compliant':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const exportComplianceReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      services: services.map(s => ({
        name: s.name,
        category: s.category,
        status: s.status,
        dpaStatus: s.dpaStatus,
        certifications: s.certifications,
        riskLevel: s.riskLevel,
        lastAudit: s.lastAudit
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh", width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontFamily: "'Bruno Ace SC', sans-serif" }}
        >
          COMPLIANCE
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FaSync />}
            onClick={loadServiceStatus}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FaDownload />}
            onClick={exportComplianceReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitor and manage compliance status for all third-party integrations
      </Typography>

      {/* Last Updated */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Last updated: {lastUpdated.toLocaleString()}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'space-around' }}>
        <Grid item xs={12} sm={6} md={2.8} sx={{ display: 'flex' }}>
          <SummaryCard
            title="Compliant"
            value={services.filter(s => s.status === 'compliant').length}
            icon={FaCheckCircle}
            bgColor="#f0fdf4"
            borderColor="#86efac"
            textColor="#16a34a"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.8} sx={{ display: 'flex' }}>
          <SummaryCard
            title="Pending DPA"
            value={services.filter(s => s.status === 'pending_dpa').length}
            icon={FaFileContract}
            bgColor="#fef9c3"
            borderColor="#fde047"
            textColor="#ca8a04"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.8} sx={{ display: 'flex' }}>
          <SummaryCard
            title="Non-Compliant"
            value={services.filter(s => s.status === 'non_compliant').length}
            icon={FaTimesCircle}
            bgColor="#fef2f2"
            borderColor="#fca5a5"
            textColor="#dc2626"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.8} sx={{ display: 'flex' }}>
          <SummaryCard
            title="Total Services"
            value={services.length}
            icon={FaShieldAlt}
            bgColor="#eff6ff"
            borderColor="#93c5fd"
            textColor="#2563eb"
          />
        </Grid>
      </Grid>

      {/* Services List */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Service Details
      </Typography>
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {services.map((service) => (
          <Grid item xs={12} key={service.id} sx={{ width: '100%' }}>
            <ServiceCard
              service={service}
              getStatusIcon={getStatusIcon}
              getRiskColor={getRiskColor}
              getStatusColor={getStatusColor}
            />
          </Grid>
        ))}
      </Grid>

      {/* Action Items */}
      <ActionItemsCard />
    </div>
  );
};

export default Compliance;
