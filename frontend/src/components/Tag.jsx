import Chip from '@mui/material/Chip';

// 标签的类别
const categories = {
  level: Symbol('level'),
  quality: Symbol('quality'),
  keyword: Symbol('keyword'),
  year: Symbol('year'),
  undefined: Symbol('undefined')
}

// 每个类别的标签
const categoryTags = {
  level: ['院级/校级', '省市级', '国家级', '国际级'],
  quality: ['专项', 'A类', 'B类', 'C类', 'D类'],
  keyword: ['AI', 'CS', 'IS', 'EE', 'MATH', '创新', '其他']
}

// 判断年份标签是否合法
function isValidYear(str) {
  const currentYear = new Date().getFullYear();
  const minYear = 2023;
  const maxYear = currentYear + 5;

  if (!/^\d{4}$/.test(str)) {
    return false;
  }

  const year = Number(str);
  return year >= minYear && year <= maxYear;
}

// tag到category的映射
const tagCategories = (tag) => {
  if (tag in categoryTags.level) {
    return categories.level;
  }
  if (tag in categoryTags.quality) {
    return categories.quality;
  }
  if (tag in categoryTags.keyword) {
    return categories.keyword;
  }
  if (isValidYear(tag)) {
    return categories.year;
  }
  return categories.undefined;
};

const styles = {
  level: {
    backgroundColor: '#e0f7fa',
    color: '#006064',
  },
  quality: {
    backgroundColor: '#fff3e0',
    color: '#bf360c',
  },
  keyword: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
  },
  year: {
    backgroundColor: '#fce4ec',
    color: '#880e4f',
  },
  undefined: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  }
}

const categoryStyles = (category) => {
  switch (category) {
    case categories.level:
      return styles.level;
    case categories.quality:
      return styles.quality;
    case categories.keyword:
      return styles.keyword;
    case categories.year:
      return styles.year;
    default:
      return styles.undefined;
  }
};

export default function Tag({ tag }) {
  const category = tagCategories(tag);
  const style = categoryStyles(category);

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
          backgroundColor: style.backgroundColor,
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          opacity: 0.9,
        },
      }}
      variant="outlined"
    />
  );
}