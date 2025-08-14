import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Pagination,
  Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { teamAPI } from "../../services/TeamServices";
import TeamCard from "../../components/TeamCard";

const Teams = () => {
  const params = useParams();
  const [teams, setTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      const controller = new AbortController();
      setLoading(true);
      setError("");

      try {
        const res = params.match_id
          ? await teamAPI.getRecruitingTeamsOfContest(
              params.match_id,
              pageIndex,
              pageSize,
            )
          : await teamAPI.getRecruitingTeams(pageIndex, pageSize);

        if (res.success) {
          setTeams(res.data.teams || []);
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

    fetchTeams();
  }, [params]);

  // 模拟数据
  // const teams = [
  //   {
  //     id: "123e4567-e89b-12d3-a456-426614174000",
  //     name: "示例团队 1",
  //     members: 3,
  //     description: "寻找算法大师",
  //   },
  //   {
  //     id: "456e7890-e12c-34d5-b678-987654321000",
  //     name: "示例团队 2",
  //     members: 2,
  //     description: "欢迎加入我们的队伍",
  //   },
  // ];

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
        队伍列表
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

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
            {teams.length === 0 ? (
              <Grid
                key={"no_teams"}
                size={12}
                sx={{
                  height: "150px",
                  justifyItems: "center",
                  alignContent: "center",
                  borderRadius: 5,
                  bgcolor: "#eee",
                }}
              >
                <Typography
                  key={"no_teams"}
                  color="text.secondary"
                  align="center"
                >
                  没有正在招募的队伍
                </Typography>
              </Grid>
            ) : (
              teams.map((team) => (
                <Grid
                  key={match.id}
                  // size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
                  size={{ sm: 12, md: 6 }}
                  display="flex"
                  justifyContent="center"
                >
                  <TeamCard team={team} />
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

  // return (
  //   <Box sx={{ py: 4 }}>
  //     <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
  //       <Typography variant="h4">团队列表</Typography>
  //       <Button variant="contained" color="primary">
  //         创建新团队
  //       </Button>
  //     </Box>
  //     <Grid container spacing={3}>
  //       {teams.map((team) => (
  //         <Grid size={{ xs: 12, md: 6 }} key={team.id}>
  //           <Card
  //             onClick={() => navigate(`/teams/${team.id}`)} // ✅ 跳转新路径
  //             style={{ cursor: "pointer" }}
  //           >
  //             <CardContent>
  //               <Typography variant="h6">{team.name}</Typography>
  //               <Typography color="text.secondary" gutterBottom>
  //                 当前成员数: {team.members}
  //               </Typography>
  //               <Typography variant="body2">{team.description}</Typography>
  //               <Button
  //                 variant="outlined"
  //                 color="primary"
  //                 sx={{ mt: 2 }}
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   alert("模拟申请加入");
  //                 }}
  //               >
  //                 申请加入
  //               </Button>
  //             </CardContent>
  //           </Card>
  //         </Grid>
  //       ))}
  //     </Grid>
  //   </Box>
  // );
};

export default Teams;
