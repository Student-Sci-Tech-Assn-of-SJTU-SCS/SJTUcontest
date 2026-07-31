import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import showMessage from "../../utils/message";

const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".md",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
  ".rar",
  ".7z",
]);

const formatAttachmentSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtension = (filename) => {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
};

const ContestAttachmentManager = ({
  existingAttachments = [],
  pendingFiles,
  onPendingFilesChange,
  onDeleteExisting,
  deletingAttachmentId = null,
  disabled = false,
}) => {
  const theme = useTheme();

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = [];

    selectedFiles.forEach((file) => {
      if (!ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
        showMessage(`不支持文件“${file.name}”的类型`, "warning");
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        showMessage(`文件“${file.name}”超过 15 MB`, "warning");
        return;
      }
      const duplicated = [...pendingFiles, ...validFiles].some(
        (item) =>
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified,
      );
      if (!duplicated) validFiles.push(file);
    });

    if (validFiles.length > 0) {
      onPendingFilesChange([...pendingFiles, ...validFiles]);
    }
    event.target.value = "";
  };

  const removePendingFile = (index) => {
    onPendingFilesChange(
      pendingFiles.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const attachmentRowSx = {
    px: 1.5,
    py: 1,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  };

  return (
    <Box>
      <Button
        type="button"
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        disabled={disabled}
      >
        选择附件
        <input
          hidden
          multiple
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.png,.jpg,.jpeg,.zip,.rar,.7z"
          onChange={handleFilesSelected}
        />
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mt: 1 }}
      >
        支持文档、图片和压缩包，单个文件最大 15 MB。
      </Typography>

      {existingAttachments.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            已上传附件
          </Typography>
          <Box sx={{ display: "grid", gap: 1 }}>
            {existingAttachments.map((attachment) => (
              <Paper
                key={attachment.id}
                variant="outlined"
                sx={attachmentRowSx}
              >
                <AttachFileIcon color="primary" fontSize="small" />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    noWrap
                    title={attachment.original_filename}
                  >
                    {attachment.original_filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatAttachmentSize(attachment.file_size)}
                  </Typography>
                </Box>
                {onDeleteExisting && (
                  <IconButton
                    type="button"
                    size="small"
                    color="error"
                    disabled={
                      disabled || deletingAttachmentId === attachment.id
                    }
                    onClick={() => onDeleteExisting(attachment)}
                    aria-label={`删除附件 ${attachment.original_filename}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {pendingFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            待上传附件
          </Typography>
          <Box sx={{ display: "grid", gap: 1 }}>
            {pendingFiles.map((file, index) => (
              <Paper
                key={`${file.name}-${file.size}-${file.lastModified}`}
                variant="outlined"
                sx={attachmentRowSx}
              >
                <AttachFileIcon color="action" fontSize="small" />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" noWrap title={file.name}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatAttachmentSize(file.size)}
                  </Typography>
                </Box>
                <IconButton
                  type="button"
                  size="small"
                  color="error"
                  disabled={disabled}
                  onClick={() => removePendingFile(index)}
                  aria-label={`移除待上传附件 ${file.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ContestAttachmentManager;
