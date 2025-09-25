export const styleInnerScrollBar = (theme) => {
  return {
    "& .MuiInputBase-input": {
      scrollbarWidth: "thin",
      scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
      "&::-webkit-scrollbar": {
        width: 8,
        borderRadius: 4,
        background: theme.palette.background.paper,
      },
      "&::-webkit-scrollbar-thumb": {
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        borderRadius: 4,
      },
      "&::-webkit-scrollbar-track": {
        background: theme.palette.background.paper,
        borderRadius: 4,
      },
    },
  };
};

import { styled } from "@mui/material/styles";
import { MaterialDesignContent } from 'notistack'

export const styleSnackbar = styled(MaterialDesignContent)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "1.05rem",
  letterSpacing: 1,
  boxShadow: `0 4px 24px ${theme.palette.primary.main}22`,
  borderRadius: 8,
  padding: "8px 24px",
  color: "#fff",
  "&.notistack-MuiContent-success": {
    background: `linear-gradient(135deg, #81C784 0%, #C8E6C9 100%)`,
    color: "#fff",
  },
  "&.notistack-MuiContent-error": {
    background: `linear-gradient(135deg, #E57373 0%, #FFCDD2 100%)`,
    color: "#fff",
  },
  "&.notistack-MuiContent-warning": {
    background: `linear-gradient(135deg, #FFD54F 0%, #FFF9C4 100%)`,
    color: "#3E2723",
  },
  "&.notistack-MuiContent-info": {
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
    color: "#fff",
  },
  "&.notistack-MuiContent-default": {
    background: `linear-gradient(135deg, #F5F5F5 0%, #ECECEC 100%)`,
    color: theme.palette.text.primary,
  },
}));

