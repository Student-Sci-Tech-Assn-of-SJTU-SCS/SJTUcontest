export const styleInnerScrollBar = (theme) => {
  return {
    '& .MuiInputBase-input': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
      '&::-webkit-scrollbar': {
        width: 8,
        borderRadius: 4,
        background: theme.palette.background.paper,
      },
      '&::-webkit-scrollbar-thumb': {
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        borderRadius: 4,
      },
      '&::-webkit-scrollbar-track': {
        background: theme.palette.background.paper,
        borderRadius: 4,
      },
    },
  };
};