import Chip from "@mui/material/Chip";

// 标签的类别
export const categories = {
  LEVEL: Symbol("level"),
  QUAL: Symbol("quality"),
  KWORD: Symbol("keyword"),
  YEAR: Symbol("year"),
  UNDEF: Symbol("undefined"),
};

function genYearTag() {
  const currentYear = new Date().getFullYear();
  const minYear = 2021;

  const years = [];
  for (let year = minYear; year <= currentYear; year++) {
    years.push(year.toString());
  }
  return years;
}

// 类别的正式名称
export const categoryOfficialNames = {
  [categories.LEVEL]: "级别",
  [categories.QUAL]: "素拓等级",
  [categories.KWORD]: "关键词",
  [categories.YEAR]: "年份",
};

// 每个类别的标签
export const categoryTags = {
  [categories.LEVEL]: ["院级/校级", "省市级", "国家级", "国际级"],
  [categories.QUAL]: ["专项", "A类", "B类", "C类", "D类"],
  [categories.KWORD]: ["AI", "CS", "IS", "EE", "MATH", "创新", "其他"],
  [categories.YEAR]: genYearTag(),
};

// tag到category的映射
export const tagCategories = (tag) => {
  let cat = categories.UNDEF;
  // console.log(Reflect.ownKeys(categoryTags));
  for (const category of Reflect.ownKeys(categoryTags)) {
    if (categoryTags[category].includes(tag)) {
      cat = category;
      break;
    }
  }
  // console.log(`tagCategories(${tag}) returning ${cat.description}`);
  return cat;
};

const colorStyles = {
  [categories.LEVEL]: {
    backgroundColor: "#e0f7fa",
    color: "#006064",
    '&:hover': {
      backgroundColor: '#b2ebf2',
      boxShadow: '0 0 0 1px #006064 inset'
    },
    '&.Mui-selected': {
      backgroundColor: '#4dd0e1',
      fontWeight: 'bold',
      border: '1px solid #006064'
    }
  },
  [categories.QUAL]: {
    backgroundColor: "#fff3e0",
    color: "#bf360c",
    '&:hover': {
      backgroundColor: '#ffe0b2',
      boxShadow: '0 0 0 1px #bf360c inset'
    },
    '&.Mui-selected': {
      backgroundColor: '#ffb74d',
      fontWeight: 'bold',
      border: '1px solid #bf360c'
    }
  },
  [categories.KWORD]: {
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    '&:hover': {
      backgroundColor: '#c8e6c9',
      boxShadow: '0 0 0 1px #1b5e20 inset'
    },
    '&.Mui-selected': {
      backgroundColor: '#81c784',
      fontWeight: 'bold',
      border: '1px solid #1b5e20'
    }
  },
  [categories.YEAR]: {
    backgroundColor: "#fce4ec",
    color: "#880e4f",
    '&:hover': {
      backgroundColor: '#f8bbd0',
      boxShadow: '0 0 0 1px #880e4f inset'
    },
    '&.Mui-selected': {
      backgroundColor: '#f06292',
      fontWeight: 'bold',
      border: '1px solid #880e4f'
    }
  },
  [categories.UNDEF]: {
    backgroundColor: "#f5f5f5",
    color: "#616161",
    '&:hover': {
      backgroundColor: '#e0e0e0',
      boxShadow: '0 0 0 1px #616161 inset'
    },
    '&.Mui-selected': {
      backgroundColor: '#bdbdbd',
      fontWeight: 700,
      border: '1px solid #616161'
    }
  },
};

export default function Tag({ tag, clickable = false, selected = false, onClick = () => {} }) {
  const category = tagCategories(tag);
  const colorStyle = colorStyles[category];
  const isSelected = clickable && selected;

  return (
    <Chip
      label={tag}
      clickable={clickable}
      onClick={clickable ? () => onClick(tag) : undefined}
      className={isSelected ? 'Mui-selected' : ''}
      variant={isSelected ? 'filled' : 'outlined'}
      sx={{
        margin: "2px",
        fontSize: "0.85rem",
        fontWeight: 400,
        borderRadius: 2,
        boxShadow: "none",
        transition: "all 0.5s ease",
        cursor: clickable ? "pointer" : "default",
        ...colorStyle,
      }}
    />
  );
}
