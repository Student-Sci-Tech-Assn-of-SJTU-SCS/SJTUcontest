import {
  Typography,
  Box,
  Grid,
  Divider,
  Pagination,
  CircularProgress,
} from "@mui/material";
import MatchSearchBar from "../../components/MatchSearchBar";
import MatchCard from "../../components/MatchCard";
import { useState, useEffect } from "react";
import { categories } from "../../components/Tag";
import { useMediaQuery } from "@mui/material";

// theme需要重写，这里先用mui默认的
import { createTheme } from "@mui/material/styles";

import axios from "axios";
// import api from "../../utils/api";
import { contestAPI } from "../../services/MatchServices";

const Matches = () => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState({
    [categories.LEVEL]: [],
    [categories.QUAL]: [],
    [categories.KWORD]: [],
    [categories.YEAR]: [],
    [categories.MONTH]: [],
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const theme = createTheme();
  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const md = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const lg = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const xl = useMediaQuery(theme.breakpoints.up("xl"));

  const pageSize = sm ? 5 : 10;
  // const pageSize = sm ? 3 : md ? 6 : lg ? 9 : 12;
  // const pageSize = 1; // 调试用

  const [matches, setMatches] = useState([]);

  // 后端请求
  useEffect(() => {
    const fetchMatches = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const res = await contestAPI.getContests(pageIndex, pageSize, {
          query: search.trim(),
          level: selectedTags[categories.LEVEL].map((tag) => tag.name),
          quality: selectedTags[categories.QUAL].map((tag) => tag.name),
          keywords: selectedTags[categories.KWORD].map((tag) => tag.name),
          years: selectedTags[categories.YEAR].map((tag) => tag.name),
          months: selectedTags[categories.MONTH].map((tag) => tag.name),
        });

        if (res.success) {
          setMatches(res.data.matches || []);
          setPageCount(res.data.total_pages);
        } else {
          setError(res.message || "Unknown error.");
          console.log(error);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Network error.");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchMatches();
  }, [pageIndex, pageSize, search, selectedTags]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPageIndex(1);
  };

  const handleTagClick = (tag) => {
    const category = tag.category;
    setSelectedTags((prev) => {
      const cur = prev[category];
      const upd = cur.includes(tag)
        ? cur.filter((t) => t !== tag)
        : [...cur, tag];
      console.log(
        `Before: ${cur.map((tag) => tag.description)}; After: ${upd.map((tag) => tag.description)}`,
      );
      return { ...prev, [category]: upd };
    });
    setPageIndex(1);
  };

  useEffect(() => {
    setPageIndex(1);
  }, [pageSize]);

  return (
    <Box
      sx={{
        px: 5,
        py: 5,
        transition: "width 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        比赛
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      <MatchSearchBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedTags={selectedTags}
        onTagClick={handleTagClick}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={1}
            justifyContent="center"
            alignItems="stretch"
          >
            {matches.length === 0 ? (
              <Grid
                key={"no_matches"}
                size={12}
                sx={{
                  mt: 2,
                  height: "150px",
                  justifyItems: "center",
                  alignContent: "center",
                  borderRadius: 5,
                  bgcolor: "#eee",
                }}
              >
                <Typography
                  key={"no_matches"}
                  color="text.secondary"
                  align="center"
                >
                  暂无符合条件的比赛
                </Typography>
              </Grid>
            ) : (
              matches.map((match) => (
                <Grid
                  key={match.id}
                  // size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
                  size={{ sm: 12, md: 6 }}
                  display="flex"
                  justifyContent="center"
                >
                  <MatchCard match={match} />
                </Grid>
              ))
            )}
          </Grid>

          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount}
                page={pageIndex}
                onChange={(_, value) => setPageIndex(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Matches;
