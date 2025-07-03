import Tag from "./Tag";
import { Stack } from "@mui/material";

export default function TagGroup({
  tags,
  clickable = false,
  selectedTags = [],
  onTagClick = () => {},
}) {
  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 0.5,
        mt: 1,
      }}
    >
      {tags.map((tag) => (
        <Tag
          key={tag}
          tag={tag}
          clickable={clickable}
          selected={selectedTags.includes(tag)}
          onClick={onTagClick}
        />
      ))}
    </Stack>
  );
}
