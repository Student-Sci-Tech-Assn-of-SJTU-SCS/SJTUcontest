import { TextField, Stack, Chip, Box } from "@mui/material";
import { categoryTags } from "./Tag";

const ALL_TAGS = [
  ...categoryTags.level,
  ...categoryTags.quality,
  ...categoryTags.keyword,
  ...categoryTags.year,
];

export default function MatchSearchBar({ value, onValueChange, selectedTags, onTagsChange }) {
  // value: 搜索框内容
  // selectedTags: 选中的tag数组
  // onValueChange: (val)=>void
  // onTagsChange: (tags)=>void

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <TextField
        label="查找比赛名称"
        variant="outlined"
        size="small"
        value={value}
        onChange={e => onValueChange(e.target.value)}
        sx={{ minWidth: 220, background: '#fff' }}
      />
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ maxWidth: 700 }}>
        {ALL_TAGS.map(tag => {
          const selected = selectedTags.includes(tag);
          return (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              onClick={() => handleTagClick(tag)}
              sx={{
                mb: 1,
                fontWeight: selected ? 700 : 400,
                letterSpacing: 0.5,
                borderRadius: 2,
                boxShadow: selected ? '0 2px 8px rgba(25, 118, 210, 0.15)' : 'none',
                backgroundColor: selected ? 'primary.main' : 'background.paper',
                color: selected ? '#fff' : 'text.primary',
                borderColor: selected ? 'primary.main' : 'grey.300',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: selected ? 'primary.dark' : 'grey.100',
                  color: selected ? '#fff' : 'primary.main',
                  borderColor: 'primary.main',
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}