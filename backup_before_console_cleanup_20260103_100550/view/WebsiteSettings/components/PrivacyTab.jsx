import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CardActions,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const PrivacyTab = ({ privacyItems, onAdd, onEdit, onDelete }) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Privacy Policy</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onAdd('privacy')}
        >
          Add Privacy Policy
        </Button>
      </Box>

      <Grid container spacing={3}>
        {privacyItems.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Privacy Items Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Item" to create your first privacy policy item
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          privacyItems.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(item, 'privacy')}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(item, 'privacy')}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default PrivacyTab;
