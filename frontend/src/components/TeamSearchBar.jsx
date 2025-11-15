import {
  Typography,
  TextField,
  Stack,
  Box,
  Button,
  Collapse,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";

// 状态标签定义
const statusTags = [
  {
    id: "full",
    name: "full",
    description: "已满员",
  },
  {
    id: "available",
    name: "available",
    description: "未满员",
  },
];

export default function TeamSearchBar({
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
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
          label="查询队伍"
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
          p: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          队伍状态:
        </Typography>
        <Stack direction="row" spacing={1}>
          {statusTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.description}
              variant={selectedStatus.includes(tag.id) ? "filled" : "outlined"}
              color="primary"
              onClick={() => onStatusChange(tag.id)}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}
