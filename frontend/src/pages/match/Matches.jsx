import { Typography, Box, Grid, Divider, Pagination } from "@mui/material";
import MatchSearchBar from "../../components/MatchSearchBar";
import MatchCard from "../../components/MatchCard";
import { useState, useEffect } from "react";
import { categories } from "../../components/Tag";
import { useMediaQuery } from "@mui/material";

// theme需要重写，这里先用mui默认的
import { createTheme } from "@mui/material/styles";

import axios from "axios";
import api from "../../utils/api";

// const randomUUID = () =>
//   "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
//     const r = (Math.random() * 16) | 0;
//     const v = c === "x" ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });

// const getRandomLogo = (name) => {
//   return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&color=ffffff&bold=true`;
// };

// const getRandomTags = (arr, n = 1) => {
//   const shuffled = arr.slice().sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, n).map(tag => tag.description);
// };

// const ALL_MATCHES = Array.from([
//   {
//     name: "2026年SJTU野外生存挑战赛",
//     logo: getRandomLogo("Survival Challenge"),
//     keywords: ["AI", "其他"],
//   },
//   {
//     name: "2026年SJTU编程马拉松",
//     logo: getRandomLogo("Programming Marathon"),
//     keywords: ["CS", "math"],
//   },
//   {
//     name: "2026年SJTU机器人竞赛",
//     logo: getRandomLogo("Robotics Competition"),
//     keywords: ["EE"],
//   },
//   {
//     name: "2026年SJTU电子竞技大赛",
//     logo: getRandomLogo("E-sports Competition"),
//     keywords: ["其他"],
//   },
//   {
//     name: "2026年SJTU人工智能挑战赛",
//     logo: getRandomLogo("AI Challenge"),
//     keywords: ["AI", "CS"],
//   },
//   {
//     name: "2026年SJTU数学建模竞赛",
//     logo: getRandomLogo("Math Modeling Competition"),
//     keywords: ["math"],
//   },
//   {
//     name: "2026年SJTU物理实验竞赛",
//     logo: getRandomLogo("Physics Experiment Competition"),
//     keywords: ["其他"],
//   },
//   {
//     name: "2026年SJTU化学实验竞赛",
//     logo: getRandomLogo("Chemistry Experiment Competition"),
//     keywords: ["其他"],
//   },
//   {
//     name: "2026年SJTU生物实验竞赛",
//     logo: getRandomLogo("Biology Experiment Competition"),
//     keywords: ["其他"],
//   },
//   {
//     name: "第十八届全国大学生信息安全竞赛—作品赛",
//     logo: getRandomLogo("18th National College InfoSec Competition - Project"),
//     keywords: ["IS", "CS"],
//   },
//   {
//     name: "第十八届全国大学生信息安全竞赛（创新实践能力赛）暨第二届“长城杯”铁人三项赛（防护赛）初赛",
//     logo: getRandomLogo(
//       "18th National College InfoSec Competition - Innovation & 2nd Great Wall Cup",
//     ),
//     keywords: ["IS", "CS"],
//   },
//   {
//     name: "2026年SJTU操作系统原理知识竞赛",
//     logo: getRandomLogo("OS Principles Competition"),
//     keywords: ["CS"],
//   },
//   {
//     name: "2026年SJTU计算机网络知识竞赛",
//     logo: getRandomLogo("Computer Networks Competition"),
//     keywords: ["CS"],
//   },
//   {
//     name: "2026年SJTU数据库系统知识竞赛",
//     logo: getRandomLogo("Database Systems Competition"),
//     keywords: ["CS"],
//   },
//   {
//     name: "2026年SJTU软件工程知识竞赛",
//     logo: getRandomLogo("Software Engineering Competition"),
//     keywords: ["CS"],
//   },
// ]).map((match) => {
//   // 随机为每个比赛添加LEVEL/QUAL/YEAR标签
//   const levelTags = getRandomTags(Object.values(categoryTags[categories.LEVEL]) || [], 1);
//   const qualTags = getRandomTags(Object.values(categoryTags[categories.QUAL]) || [], 1);
//   const yearTags = getRandomTags(Object.values(categoryTags[categories.YEAR]) || [], 1);
//   return {
//     ...match,
//     uuid: randomUUID(),
//     keywords: [...levelTags, ...qualTags, ...match.keywords, ...yearTags],
//   };
// });

const Matches = () => {
  // 搜索和筛选状态
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

  const pageSize = sm ? 3 : md ? 6 : lg ? 9 : 12;
  // const pageSize = 1; // 调试用

  const [matches, setMatches] = useState([]);

  // 后端请求
  useEffect(() => {
    const fetchMatches = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const res = await api.post("/matches/", {
            page_index: pageIndex,
            page_size: pageSize,
            options: {
              query: search.trim(),
              level: selectedTags[categories.LEVEL].map(tag => tag.name),
              quality: selectedTags[categories.QUAL].map(tag => tag.name),
              keywords: selectedTags[categories.KWORD].map(tag => tag.name),
              years: selectedTags[categories.YEAR].map(tag => tag.name),
              months: selectedTags[categories.MONTH].map(tag => tag.name),
            },
          },
          { signal: controller.signal }
        );

        if (res.data.success) {
          setMatches(res.data.data.matches || []);
          setPageCount(res.data.data.total_pages);
        } else {
          setError(res.data.message || "未知错误");
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("网络错误");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    };

    fetchMatches();
  }, [pageIndex, pageSize, search, selectedTags]);

  // 模拟后端请求
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     let filtered = ALL_MATCHES.filter((match) => {
  //       const nameMatch = match.name.includes(search);

  //       const tagMatch = Reflect.ownKeys(selectedTags).every((category) => {
  //         const selected = selectedTags[category];
  //         if (selected.length === 0) return true;
  //         return match.keywords.some((tag) => selected.includes(tag));
  //       });

  //       return nameMatch && tagMatch;
  //     });
  //     setMatches(filtered);
  //   }, 200);
  //   return () => clearTimeout(timer);
  // }, [search, selectedTags]);

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPageIndex(1);
  };

  const handleTagClick = (tag) => {
    // console.log(`Calling handleTagClick(${tag}) ...`);
    const category = tag.category;
    setSelectedTags((prev) => {
      const cur = prev[category];
      const upd = cur.includes(tag)
        ? cur.filter((t) => t !== tag)
        : [...cur, tag];
      console.log(`Before: ${cur.map(tag => tag.description)}; After: ${upd.map(tag => tag.description)}`);
      return { ...prev, [category]: upd };
    });
    // console.log(`selectedTags=${selectedTags[category] && []}`);
    setPageIndex(1);
  };

  useEffect(() => {
    setPageIndex(1);
  }, [pageSize]);

  return (
    <Box
      sx={{
        py: 5,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        比赛列表
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      <MatchSearchBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedTags={selectedTags}
        onTagClick={handleTagClick}
      />

      <Grid container spacing={1} justifyContent="center" alignItems="stretch">
        {matches.length === 0 ? (
          <Grid key={"no_match"} size={12}>
            <Typography key={"no_match"} color="text.secondary" align="center" sx={{ mt: 8 }}>
              暂无符合条件的比赛
            </Typography>
          </Grid>
        ) : (
          matches.map((match) => (
            <Grid
              key={match.id}
              size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
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
    </Box>
  );
};

export default Matches;
