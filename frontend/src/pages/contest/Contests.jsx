import {
  Typography,
  Box,
  Grid,
  Divider,
  Pagination,
  CircularProgress,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContestSearchBar from "../../components/ContestSearchBar";
import ContestCard from "../../components/ContestCard";
import { useState, useEffect } from "react";
import { categories, nameToTag } from "../../components/Tag";
import { useMediaQuery } from "@mui/material";
import { createFadeInAnim } from "../../styles/animations";
import axios from "axios";
import { contestAPI } from "../../services/ContestServices";
import showMessage from "../../utils/message";

function saveSelectedTagsToSession(selectedTags) {
  const plainObject = {};
  for (const [cat, symkey] of Object.entries(categories)) {
    if (symkey === categories.UNDEF) continue;
    plainObject[cat] = selectedTags[symkey].map((tag) => tag.name);
  }
  sessionStorage.setItem("contests_selectedTags", JSON.stringify(plainObject));
}

function loadSelectedTagsFromSession() {
  const json = sessionStorage.getItem("contests_selectedTags");
  if (!json) return null;

  const plain = JSON.parse(json);
  const restored = {};
  for (const strKey in plain) {
    const symKey = categories[strKey];
    if (symKey) restored[symKey] = plain[strKey].map((name) => nameToTag(name));
  }
  return restored;
}

const Contests = () => {
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
  const [initReady, setInitReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const md = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const lg = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const xl = useMediaQuery(theme.breakpoints.up("xl"));

  const pageColumns = sm ? 1 : 2;
  const pageRows = 5;
  const pageSize = pageColumns * pageRows;

  const [contests, setContests] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("contests_search")) {
      setSearch(sessionStorage.getItem("contests_search"));
    }
    if (sessionStorage.getItem("contests_selectedTags")) {
      setSelectedTags(loadSelectedTagsFromSession());
    }
    if (sessionStorage.getItem("contests_pageColumns")) {
      const cols = parseInt(sessionStorage.getItem("contests_pageColumns"), 10);
      if (pageColumns === cols) {
        if (sessionStorage.getItem("contests_pageIndex")) {
          setPageIndex(parseInt(sessionStorage.getItem("contests_pageIndex"), 10));
        }
      }
    }
    setInitReady(true);
  }, []);

  useEffect(() => {
    const fetchContests = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await contestAPI.getContests(
          pageIndex,
          pageSize,
          {
            query: search.trim(),
            level: selectedTags[categories.LEVEL].map((tag) => tag.name),
            quality: selectedTags[categories.QUAL].map((tag) => tag.name),
            keywords: selectedTags[categories.KWORD].map((tag) => tag.name),
            years: selectedTags[categories.YEAR].map((tag) => tag.name),
            months: selectedTags[categories.MONTH].map((tag) => tag.name),
          },
          { signal: controller.signal },
        );

        if (res.success) {
          setContests(res.data.matches || []);
          setPageCount(res.data.total_pages);
        } else {
          showMessage(`获取比赛列表失败`, "error");
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`获取比赛列表失败：网络错误`, "error");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    if (!initReady) return;
    fetchContests();
  }, [initReady, pageIndex, pageSize, search, selectedTags]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPageIndex(1);
    sessionStorage.setItem("contests_search", newSearch);
    sessionStorage.setItem("contests_pageColumns", pageColumns);
    sessionStorage.setItem("contests_pageIndex", 1);
  };

  const handleTagClick = (tag) => {
    const category = tag.category;
    setSelectedTags((prev) => {
      const cur = prev[category];
      const upd = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
      return { ...prev, [category]: upd };
    });
    setPageIndex(1);
    saveSelectedTagsToSession({
      ...selectedTags,
      [category]: selectedTags[category].includes(tag)
        ? selectedTags[category].filter((t) => t !== tag)
        : [...selectedTags[category], tag],
    });
    sessionStorage.setItem("contests_pageColumns", pageColumns);
    sessionStorage.setItem("contests_pageIndex", 1);
  };

  const handleClearAll = () => {
    setSearch("");
    setSelectedTags({
      [categories.LEVEL]: [],
      [categories.QUAL]: [],
      [categories.KWORD]: [],
      [categories.YEAR]: [],
      [categories.MONTH]: [],
    });
    setPageIndex(1);
    sessionStorage.removeItem("contests_search");
    sessionStorage.removeItem("contests_selectedTags");
    sessionStorage.setItem("contests_pageColumns", pageColumns);
    sessionStorage.setItem("contests_pageIndex", 1);
  };

  useEffect(() => {
    setPageIndex(1);
    sessionStorage.setItem("contests_pageColumns", pageColumns);
    sessionStorage.setItem("contests_pageIndex", 1);
  }, [pageSize]);

  useEffect(() => {
    console.log(`Contests count=${contests.length}`);
  }, [contests]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, sm: 5 },
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
          ...createFadeInAnim({ name: "fadeInDown", direction: "down" }),
        }}
      >
        赛事列表
      </Typography>
      <Divider
        sx={{
          mb: 4,
          mx: "auto",
          width: 120,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
          animation: "fadeInLeft 1s ease-out",
          ...createFadeInAnim({ name: "fadeInLeft", direction: "left", distance: 60 }),
        }}
      />

      <ContestSearchBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedTags={selectedTags}
        onTagClick={handleTagClick}
        onClearAll={handleClearAll}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={20} value={25} />
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={3}
            justifyContent="space-between"
            alignItems="stretch"
            sx={{ transition: "all ease-in-out 0.5s" }}
          >
            {contests.length === 0 ? (
              <Grid item xs={12}>
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
                    sx={{ fontSize: "1.1rem", animation: "fadeIn 0.8s ease-out", ...createFadeInAnim({ name: "fadeIn" }) }}
                  >
                    暂无符合条件的比赛
                  </Typography>
                </Box>
              </Grid>
            ) : (
              contests.map((contest, idx) => (
                <Grid
                  key={contest.id}
                  item
                  xs={12}
                  md={6}
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
                    ...createFadeInAnim({ name: "cardFadeInLeft", direction: "left", distance: 60 }),
                    ...createFadeInAnim({ name: "cardFadeInRight", direction: "right", distance: 60 }),
                    ...createFadeInAnim({ name: "cardFadeInUp", direction: "up", distance: 30 }),
                  }}
                >
                  <ContestCard contest={contest} />
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
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 3 } }}
              />
            </Box>
          )}

          <Box display="flex" justifyContent="center" mt={6} mb={2}>
            <Button
              variant="outlined"
              onClick={() => window.open('https://ssc.sjtu.edu.cn/dashboard/9030a6d6', '_blank')}
              sx={{
                borderRadius: 3,
                px: 2,
                py: 0.7,
                fontWeight: 500,
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.primary.main}`,
                background: 'none',
                transition: 'all 0.2s',
                fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
                fontSize: '0.98rem',
                minWidth: 0,
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.dark,
                  transform: 'scale(1.04)'
                },
                gap: 0.5,
              }}
              startIcon={
                <AddIcon
                  sx={{
                    fontSize: 28,
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}`,
                    borderRadius: '50%',
                    p: 0.4,
                    boxShadow: 'none',
                  }}
                />
              }
            >
              没有找到想要的比赛？点此补充！
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Contests;
