import {
  Typography,
  Box,
  Grid,
  Divider,
  Pagination,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import MatchSearchBar from "../../components/MatchSearchBar";
import MatchCard from "../../components/MatchCard";
import { useState, useEffect } from "react";
import { categories } from "../../components/Tag";
import { useMediaQuery } from "@mui/material";
import { createFadeInAnim } from "../../styles/animations";

import axios from "axios";
import { contestAPI } from "../../services/MatchServices";

const Matches = () => {
  const theme = useTheme();
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

  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const md = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const lg = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const xl = useMediaQuery(theme.breakpoints.up("xl"));

  const pageColumns = sm ? 1 : 2;
  const pageRows = 5;
  const pageSize = pageColumns * pageRows;
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
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, sm: 5 },
        // background: `linear-gradient(180deg,
        //   ${theme.palette.background.paper} 0%,
        //   ${alpha(theme.palette.primary.main, 0.03)} 50%,
        //   ${theme.palette.background.paper} 100%)`,
        transition: "width 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{
          letterSpacing: 2,
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1,
          textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.12)}`,
          animation: "fadeInDown 1s ease-out",
          ...createFadeInAnim({
            name: "fadeInDown",
            direction: "down",
          }),
        }}
      >
        比赛
      </Typography>
      <Divider
        sx={{
          mb: 4,
          mx: "auto",
          width: 120,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
          animation: "fadeInDown 1s ease-out",
          ...createFadeInAnim({
            name: "fadeInLeft",
            direction: "left",
          }),
        }}
      />

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
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
          >
            {matches.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    mt: 2,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.primary.light, 0.08),
                    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{
                      fontSize: "1.1rem",
                      animation: "fadeIn 0.8s ease-out",
                      ...createFadeInAnim({ name: "fadeIn" }),
                    }}
                  >
                    暂无符合条件的比赛
                  </Typography>
                </Box>
              </Grid>
            ) : (
              matches.map((match, idx) => (
                <Grid
                  key={match.id}
                  size={{ sm: 12, md: 6 }}
                  display="flex"
                  justifyContent="center"
                  sx={{
                    animation: `${
                      idx % pageColumns === 0
                        ? "cardFadeInLeft"
                        : idx % pageColumns === pageColumns - 1
                          ? "cardFadeInRight"
                          : "cardFadeInUp"
                    } 0.7s ease-out forwards`,
                    animationDelay: `${idx * 0.08 + 0.2}s`,
                    opacity: 0,
                    ...createFadeInAnim({
                      name: "cardFadeInLeft",
                      direction: "left",
                      distance: 60,
                    }),
                    ...createFadeInAnim({
                      name: "cardFadeInRight",
                      direction: "right",
                      distance: 60,
                    }),
                    ...createFadeInAnim({
                      name: "cardFadeInUp",
                      direction: "up",
                      distance: 30,
                    }),
                  }}
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
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Matches;
