import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {

    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 280,
          transition: "width 0.2s ease-in-out",
          background: "#000",
          color: "#fff",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000",
          color: "#000",
          "& .MuiIconButton-root": {
            color: "#fff",
            padding: "8px",
            "&:hover": {
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "24px",
            },
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#fff",
          "&.MuiAppBar-root .MuiIconButton-root": {
            color: "#fff",
            padding: "8px",
            "&:hover": {
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "24px",
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#fff",

          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e",
          },
          "&.Mui-selected": {
            backgroundColor: "#22c55e !important",
            color: "#fff !important",
            "&:hover": {
              backgroundColor: "#16a34a !important",
              color: "#fff !important",
            },
            "& .MuiListItemIcon-root": {
              color: "#fff !important",
            },
            "& .MuiListItemText-primary": {
              color: "#fff !important",
              fontWeight: "bold",
            },
          },
          "& .MuiListItemIcon-root": {
            color: "inherit",
            minWidth: "50px",
          },
          "& .MuiListItemText-primary": {
            color: "inherit",
            fontWeight: 500,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#fff",
          minWidth: "50px",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "inherit",
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          color: "#000",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#000",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
  },
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
}); 