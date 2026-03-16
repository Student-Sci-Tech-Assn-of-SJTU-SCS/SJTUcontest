import Chip from "@mui/material/Chip";
import TagClass from "../models/tag";

// 标签的类别
export const categories = {
  LEVEL: Symbol("级别"),
  QUAL: Symbol("素拓等级"),
  KWORD: Symbol("关键词"),
  YEAR: Symbol("年份"),
  MONTH: Symbol("月份"),
  UNDEF: Symbol("未定义"),
};

const levelTags = {
    LOCAL: new TagClass("local", "校院级", categories.LEVEL),
    REGIONAL: new TagClass("regional", "省市级", categories.LEVEL),
    NATIONAL: new TagClass("national", "国家级", categories.LEVEL),
    INTERNATIONAL: new TagClass("international", "国际级", categories.LEVEL),
    OTHERS: new TagClass("others", "其他", categories.UNDEF),
  },
  qualityTags = {
    TOP: new TagClass("top", "专项赛事", categories.QUAL),
    A_LEVEL: new TagClass("A_level", "A类赛事", categories.QUAL),
    B_LEVEL: new TagClass("B_level", "B类赛事", categories.QUAL),
    C_LEVEL: new TagClass("C_level", "C类赛事", categories.QUAL),
    D_LEVEL: new TagClass("D_level", "D类赛事", categories.QUAL),
    OTHERS: new TagClass("others", "其他", categories.UNDEF),
  },
  keywordTags = {
    CS: new TagClass("CS", "计算机科学", categories.KWORD),
    MATH: new TagClass("math", "数学", categories.KWORD),
    AI: new TagClass("AI", "人工智能", categories.KWORD),
    IS: new TagClass("IS", "信息安全", categories.KWORD),
    EE: new TagClass("EE", "电气工程", categories.KWORD),
    INNOVATION: new TagClass("innovation", "创新创业", categories.KWORD),
    OTHERS: new TagClass("others", "其他", categories.UNDEF),
  },
  yearTags = genYearTags(),
  monthTags = genMonthTags();

const allTags = {
  ...levelTags,
  ...qualityTags,
  ...keywordTags,
  ...yearTags,
  ...monthTags,
};

function genYearTags() {
  const currentYear = new Date().getFullYear();
  const minYear = 2021;

  const yearTags = {};
  for (let year = minYear; year <= currentYear; year++) {
    yearTags[year] = new TagClass(year, String(year), categories.YEAR);
  }
  return yearTags;
}

function genMonthTags() {
  const monthTags = {};
  for (let month = 1; month <= 12; month++) {
    monthTags[month] = new TagClass(month, String(month), categories.MONTH);
  }
  return monthTags;
}

// 每个类别的标签
export const categoryTags = {
  [categories.LEVEL]: levelTags,
  [categories.QUAL]: qualityTags,
  [categories.KWORD]: keywordTags,
  [categories.YEAR]: yearTags,
  [categories.MONTH]: monthTags,
};

export function nameToTag(str) {
  for (const cat of Reflect.ownKeys(categoryTags)) {
    for (const tag of Object.values(categoryTags[cat])) {
      if (str === tag.name) {
        return tag;
      }
    }
  }
  return new TagClass(str, str, categories.UNDEF);
}

const colorStyles = {
  [categories.LEVEL]: {
    backgroundColor: "#e0f7fa",
    color: "#006064",
    "&:hover": {
      backgroundColor: "#b2ebf2",
      boxShadow: "0 0 0 1px #006064 inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#4dd0e1",
      fontWeight: "bold",
      border: "1px solid #006064",
    },
  },
  [categories.QUAL]: {
    backgroundColor: "#fff3e0",
    color: "#bf360c",
    "&:hover": {
      backgroundColor: "#ffe0b2",
      boxShadow: "0 0 0 1px #bf360c inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#ffb74d",
      fontWeight: "bold",
      border: "1px solid #bf360c",
    },
  },
  [categories.KWORD]: {
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    "&:hover": {
      backgroundColor: "#c8e6c9",
      boxShadow: "0 0 0 1px #1b5e20 inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#81c784",
      fontWeight: "bold",
      border: "1px solid #1b5e20",
    },
  },
  [categories.YEAR]: {
    backgroundColor: "#fce4ec",
    color: "#880e4f",
    "&:hover": {
      backgroundColor: "#f8bbd0",
      boxShadow: "0 0 0 1px #880e4f inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#f06292",
      fontWeight: "bold",
      border: "1px solid #880e4f",
    },
  },
  [categories.MONTH]: {
    backgroundColor: "#e8eaf6",
    color: "#283593",
    "&:hover": {
      backgroundColor: "#c5cae9",
      boxShadow: "0 0 0 1px #283593 inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#7986cb",
      fontWeight: "bold",
      border: "1px solid #283593",
    },
  },
  [categories.UNDEF]: {
    backgroundColor: "#f5f5f5",
    color: "#616161",
    "&:hover": {
      backgroundColor: "#e0e0e0",
      boxShadow: "0 0 0 1px #616161 inset",
    },
    "&.Mui-selected": {
      backgroundColor: "#bdbdbd",
      fontWeight: 700,
      border: "1px solid #616161",
    },
  },
};

export default function Tag({
  tag,
  clickable = false,
  selected = false,
  onClick = () => {},
}) {
  const colorStyle = colorStyles[tag.category];
  const isSelected = clickable && selected;

  return (
    <Chip
      label={tag.description}
      clickable={clickable}
      onClick={clickable ? () => onClick(tag) : undefined}
      className={isSelected ? "Mui-selected" : ""}
      variant={isSelected ? "filled" : "outlined"}
      sx={{
        fontSize: "0.75rem",
        fontWeight: 400,
        borderRadius: 2,
        boxShadow: "none",
        transition: "all 0.3s ease",
        cursor: clickable ? "pointer" : "default",
        ...colorStyle,
      }}
    />
  );
}
