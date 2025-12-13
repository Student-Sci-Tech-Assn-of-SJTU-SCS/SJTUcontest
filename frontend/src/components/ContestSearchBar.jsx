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
import SearchIcon from "@mui/icons-material/Search";

import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { categories, categoryTags } from "./Tag";
import TagGroup from "./TagGroup";
import { createFadeInAnim, createFadeOutAnim } from "../styles/animations";

export default function ContestSearchBar({
  search,
  onSearchChange,
  selectedTags,
  onTagClick = () => {},
  onClearAll = () => {},
}) {
  const [searchInput, setSearchInput] = useState(search);
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("contests_searchBarExpanded") === "true") {
      setExpanded(true);
    }
  }, []);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useHotkeys(
    "/",
    (e) => {
      console.log(`‘/’ triggered. expanded=${expanded}`);
      e.preventDefault();
      setExpanded(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    { useKey: true },
    [],
  );

  useHotkeys(
    "esc",
    (e) => {
      console.log(`‘Esc’ triggered. expanded=${expanded}`);
      e.preventDefault();
      setExpanded(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    },
    { useKey: true, enableOnFormTags: ["INPUT", "TEXTAREA"] },
    [],
  );

  const handleSearch = () => {
    onSearchChange(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          animationDelay: "0.5s",
          animation: "fadeInDown 0.8s ease-out",
          ...createFadeInAnim({
            name: "fadeInDown",
            direction: "down",
            distance: 30,
          }),
        }}
      >
        <TextField
          label="查询比赛"
          variant="outlined"
          size="small"
          value={searchInput}
          inputRef={inputRef}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
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
          onClick={handleSearch}
          variant="outlined"
          size="medium"
          sx={{
            height: "40px",
            minWidth: "40px",
            p: 1,
            borderRadius: 3,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <SearchIcon />
        </Button>
        <Button
          onClick={() =>
            setExpanded((prev) => {
              sessionStorage.setItem("contests_searchBarExpanded", !prev);
              return !prev;
            })
          }
          variant="contained"
          size="medium"
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          // startIcon={<SearchIcon/>}
          sx={{
            height: "40px",
            whiteSpace: "nowrap",
            px: 3,
            fontWeight: 600,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "#fff",
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
            transition: "all ease-in-out 0.2s",
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
              transform: "scale(1.04)",
            },
            "::after": {
              content: expanded ? '"Esc"' : '"/"',
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              height: "20px",
              px: "8px",
              ml: "10px",
              backgroundColor: alpha("#fff", 0.5),
              borderRadius: "4px",
            },
          }}
        >
          {expanded ? "收起筛选" : "展开筛选"}
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={onClearAll}
          sx={{
            height: "40px",
            whiteSpace: "nowrap",
            px: "16px",
            borderRadius: 3,
            transition: "all 0.2s",
            "&:hover": {
              border: "1px solid #c62828",
              transform: "scale(1.04)",
            },
            // "::after": {
            //   content: '"Del"',
            //   display: "inline-flex",
            //   alignItems: "center",
            //   justifyContent: "center",
            //   width: "fit-content",
            //   height: "20px",
            //   px: "8px",
            //   ml: "10px",
            //   backgroundColor: alpha("#c62828", 0.4),
            //   borderRadius: "4px",
            // },
          }}
        >
          清除筛选
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
          animation: expanded
            ? "fadeInUp 0.5s ease-out"
            : "fadeOutDown 0.5s ease-out",
          ...createFadeInAnim({
            name: "fadeInUp",
            direction: "up",
            distance: 30,
          }),
          ...createFadeOutAnim({
            name: "fadeOutDown",
            direction: "down",
            distance: 30,
          }),
        }}
      >
        <Stack
          direction="column"
          flexWrap="wrap"
          sx={{
            width: "auto",
            m: 1.5,
            justifyContent: "flex-start",
          }}
        >
          {Object.values(categories).map((cat) => {
            if (cat == categories.UNDEF) {
              return null;
            }
            return (
              <Box
                key={cat.description}
                sx={{
                  // m: "8px 0",
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
                <Box sx={{ ml: 1, mr: 2, width: "fit-content" }}>
                  <TagGroup
                    tags={Object.values(categoryTags[cat])}
                    clickable={true}
                    selectedTags={selectedTags[cat]}
                    onTagClick={onTagClick}
                    animate={expanded ? "fadeInScale" : ""}
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
