export const createFadeInAnim = ({
  name = "fadeIn",
  direction = "", // 可选：down, up, left, right，默认为空
  distance = 20,
  fromOpacity = 0,
  toOpacity = 1,
} = {}) => {
  let transformFrom = "";
  switch (direction) {
    case "down":
      transformFrom = `translateY(-${distance}px)`;
      break;
    case "up":
      transformFrom = `translateY(${distance}px)`;
      break;
    case "left":
      transformFrom = `translateX(-${distance}px)`;
      break;
    case "right":
      transformFrom = `translateX(${distance}px)`;
      break;
    default:
      transformFrom = "none";
  }
  return {
    [`@keyframes ${name}`]: {
      "0%": {
        opacity: fromOpacity,
        transform: transformFrom,
      },
      "100%": {
        opacity: toOpacity,
        transform: "none",
      },
    },
  };
};

export const createFadeOutAnim = ({
  name = "fadeOut",
  direction = "", // 可选：down, up, left, right，默认为空
  distance = 20,
  fromOpacity = 1,
  toOpacity = 0,
} = {}) => {
  let transformFrom = "";
  switch (direction) {
    case "down":
      transformFrom = `translateY(${distance}px)`;
      break;
    case "up":
      transformFrom = `translateY(-${distance}px)`;
      break;
    case "left":
      transformFrom = `translateX(${distance}px)`;
      break;
    case "right":
      transformFrom = `translateX(-${distance}px)`;
      break;
    default:
      transformFrom = "none";
  }
  return {
    [`@keyframes ${name}`]: {
      "0%": {
        opacity: fromOpacity,
        transform: "none",
      },
      "100%": {
        opacity: toOpacity,
        transform: transformFrom,
      },
    },
  };
};
