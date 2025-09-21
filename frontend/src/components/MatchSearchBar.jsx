import {
  Typography,
  TextField,
  Stack,
  Box,
  Button,
  Collapse,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { categories, categoryTags } from "./Tag";
import TagGroup from "./TagGroup";

export default function MatchSearchBar({
  search,
  onSearchChange,
  selectedTags,
  onTagClick,
}) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        my: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="查询比赛"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            width: { xs: "90vw", sm: "clamp(250px, 400px, 30%)" },
            background: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 3,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          variant="contained"
          size="medium"
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            height: "40px",
            whiteSpace: "nowrap",
            px: 3,
            fontWeight: 600,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "#fff",
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
            transition: "all 0.2s",
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
              transform: "scale(1.04)",
            },
          }}
        >
          {expanded ? "收起筛选" : "展开筛选"}
        </Button>
      </Stack>

      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        sx={{
          mt: 2,
          minWidth: { xs: "90vw", sm: "710px" },
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.light, 0.08),
          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
          p: 2,
        }}
      >
        <Stack
          direction="column"
          flexWrap="wrap"
          sx={{ width: "auto", m: 1.5, justifyContent: "flex-start" }}
        >
          {Object.values(categories).map((cat) => {
            if (cat == categories.UNDEF) {
              return null;
            }
            return (
              <Box
                key={cat.description}
                sx={{
                  m: "8px 0",
                  padding: "6px 0",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    minWidth: "100px",
                    ml: 2,
                    mr: 1,
                    letterSpacing: 1,
                    textAlign: "center",
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {cat.description}
                </Typography>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 2,
                    width: "4px",
                    borderRadius: 2,
                    background: `linear-gradient(180deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  }}
                />
                <Box sx={{ ml: 1, mr: 2 }}>
                  <TagGroup
                    tags={Object.values(categoryTags[cat])}
                    clickable={true}
                    selectedTags={selectedTags[cat]}
                    onTagClick={onTagClick}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
}
