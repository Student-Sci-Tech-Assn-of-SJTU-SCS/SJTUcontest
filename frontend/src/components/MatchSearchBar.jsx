import { Typography, TextField, Stack, Box } from "@mui/material";
import { categories, categoryOfficialNames, categoryTags } from "./Tag";
import TagGroup from "./TagGroup";

export default function MatchSearchBar({
  search,
  onSearchChange,
  selectedTags,
  onTagClick,
}) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextField
        label="查询比赛"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: "clamp(250px, 400px, 30%)", background: "#fff" }}
      />
      <Stack
        direction="row"
        flexWrap="wrap"
        sx={{ width: "100%", justifyContent: "center" }}
      >
        {Object.values(categories).map((cat) => {
          if (cat == categories.UNDEF) {
            return null;
          }
          return (
            <Box
              key={cat.description}
              sx={{
                m: "10px !important",
                // width: "fit-content",
                width: "220px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                bgcolor: "#f0f0f0",
              }}
            >
              {/* {console.log('Rendering:', cat.description, categoryTags[cat])} */}
              <Typography
                variant="h6"
                fontWeight={500}
                sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
              >
                {categoryOfficialNames[cat]}
              </Typography>
              <TagGroup
                tags={categoryTags[cat]}
                clickable={true}
                selectedTags={selectedTags[cat]}
                onTagClick={onTagClick}
              />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
