import {
  Typography,
  TextField,
  Stack,
  Box,
  Button,
  Collapse,
} from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import LabelIcon from '@mui/icons-material/Label';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="查询比赛"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: "clamp(250px, 400px, 30%)", background: "#fff" }}
        />
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          variant="outlined"
          size="small"
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ width: "110px", height: "40px" }}
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
          minWidth: "710px",
          borderRadius: 2,
          bgcolor: "#f0f0f0",
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
                  m: "6px",
                  // width: "180px",
                  // width: "100%",
                  padding: "4px",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={500}
                  sx={{
                    minWidth: "100px",
                    ml: 2,
                    mr: 1,
                    letterSpacing: 1,
                    color: "#222",
                    textAlign: "center",
                  }}
                >
                  {cat.description}
                </Typography>
                <Box sx={{ ml: 1, mr: 2 }}>
                  <TagGroup
                    tags={Object.values(categoryTags[cat])}
                    // truncate={true}
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
