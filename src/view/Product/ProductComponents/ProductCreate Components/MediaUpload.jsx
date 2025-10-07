import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MediaUpload = ({ images, onImageUpload, onRemoveImage, fileInputRef }) => {
  return (
    <Box
      sx={{
        width: "300px",
        position: "sticky",
        top: "20px",
        p: 2,
        border: "2px solid #2196f3",
        borderRadius: 2,
        bgcolor: "#fafbfc",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} mb={2} color="#000">
        Media
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          width: "100%",
        }}
      >
        {images.map((img, idx) => (
          <Box key={idx} position="relative">
            <Avatar
              src={img.url}
              variant="square"
              sx={{
                width: "100%",
                height: 80,
                borderRadius: 1,
                aspectRatio: "1",
              }}
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "#fff",
                boxShadow: 1,
                p: 0.5,
                "&:hover": {
                  bgcolor: "#fff",
                },
              }}
              onClick={() => onRemoveImage(idx)}
            >
              <CloseIcon fontSize="small" color="error" />
            </IconButton>
          </Box>
        ))}
        <Box
          sx={{
            width: "100%",
            height: 80,
            border: "2px dashed #bdbdbd",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            bgcolor: "#ededed",
            position: "relative",
            aspectRatio: "1",
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            ref={fileInputRef}
            onChange={onImageUpload}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ color: "#000", textAlign: "center", px: 1 }}
          >
            Upload Image
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MediaUpload;