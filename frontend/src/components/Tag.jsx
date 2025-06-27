import Chip from '@mui/material/Chip';

// 标签的类别
export const categories = {
  LEVEL: Symbol('level'),
  QUAL: Symbol('quality'),
  KWORD: Symbol('keyword'),
  YEAR: Symbol('year'),
  UNDEF: Symbol('undefined')
}

function genYearTag() {
  const currentYear = new Date().getFullYear();
  const minYear = 2021;

  const years = [];
  for (let year = minYear; year <= currentYear; year++) {
    years.push(year.toString());
  }
  return years;
}

// 每个类别的标签
export const categoryTags = {
  [categories.LEVEL]: ['院级/校级', '省市级', '国家级', '国际级'],
  [categories.QUAL]: ['专项', 'A类', 'B类', 'C类', 'D类'],
  [categories.KWORD]: ['AI', 'CS', 'IS', 'EE', 'MATH', '创新', '其他'],
  [categories.YEAR]: genYearTag(),
}

// tag到category的映射
export const tagCategories = (tag) => {
  for (const [category, tags] of Object.entries(categoryTags)) {
    if (tags.includes(tag)) {
      return category;
    }
  }
  return categories.UNDEF;
};

const styles = {
  [categories.LEVEL]: {
    backgroundColor: '#e0f7fa',
    color: '#006064',
  },
  [categories.QUAL]: {
    backgroundColor: '#fff3e0',
    color: '#bf360c',
  },
  [categories.KWORD]: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
  },
  [categories.YEAR]: {
    backgroundColor: '#fce4ec',
    color: '#880e4f',
  },
  [categories.UNDEF]: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  }
}

export default function Tag({ tag }) {
  const category = tagCategories(tag);
  const style = styles[category];

  return (
    <Chip
      label={tag}
      sx={{
        ...style,
        margin: '2px',
        fontSize: '0.85rem',
        fontWeight: 500,
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#e0e0e0',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          opacity: 0.9,
        },
      }}
      variant="outlined"
    />
  );
}