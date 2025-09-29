import { enqueueSnackbar } from "notistack";

/**
 * 可全局调用的消息临时弹窗
 * message: 消息的内容
 * variant: 消息的类型，可选值 "error" | "success" | "warning" | "info" | "default"
 * log: 是否在控制台打印该消息，默认为 true
 * options: 其他 notistack 支持的选项
 */
export default function showMessage({ message, variant, log = true, options = {} } = {}) {
  enqueueSnackbar(message, {
    variant: variant,
    ...options,
  });
  if (log) {
    switch (variant) {
      case "success":
        console.log(message); break;
      case "warning":
        console.warn(message); break;
      case "error":
        console.error(message); break;
      case "info":
        console.info(message); break;
      default:
        console.log(message);
    }
  }
}