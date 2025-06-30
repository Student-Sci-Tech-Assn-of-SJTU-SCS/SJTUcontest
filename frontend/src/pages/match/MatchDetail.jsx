import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

const MatchDetail = () => {
  const { match_uuid } = useParams();

  return (
    <div>
      <Typography variant="h4">比赛详情</Typography>
      <Typography>UUID: {match_uuid}</Typography>
    </div>
  );
};

export default MatchDetail;
