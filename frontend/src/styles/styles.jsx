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
import { MaterialDesignContent } from "notistack";

export const styleSnackbar = styled(MaterialDesignContent)(({ theme }) => ({
  "&.notistack-MuiContent-success": {
    background: `#43A047BB`,
  },
  "&.notistack-MuiContent-error": {
    background: `#D32F2FBB`,
  },
  "&.notistack-MuiContent-warning": {
    background: `#FF9800BB`,
  },
  "&.notistack-MuiContent-info": {
    background: `#2196F3BB`,
  },
  "&.notistack-MuiContent-default": {
    background: `#313131BB`,
  },
}));
