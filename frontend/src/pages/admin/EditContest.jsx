import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { contestAPI } from "../../services/ContestServices";
import showMessage from "../../utils/message";

// 枚举选项（和 CreateContest 一样）
const CONTEST_LEVELS = [
  { value: "local", label: "校院级" },
  { value: "regional", label: "省市级" },
  { value: "national", label: "国家级" },
  { value: "international", label: "世界级" },
];

const CONTEST_QUALITIES = [
  { value: "top", label: "专项赛事" },
  { value: "A_level", label: "A类项目" },
  { value: "B_level", label: "B类项目" },
  { value: "C_level", label: "C类项目" },
  { value: "D_level", label: "D类项目" },
];

const CONTEST_KEYWORDS = [
  { value: "AI", label: "人工智能" },
  { value: "CS", label: "计算机科学" },
  { value: "IS", label: "信息安全" },
  { value: "EE", label: "电气工程" },
  { value: "math", label: "数学" },
  { value: "innovation", label: "创新创业" },
  { value: "others", label: "其他" },
];

const MONTHS = [
  { value: 1, label: "1月" },
  { value: 2, label: "2月" },
  { value: 3, label: "3月" },
  { value: 4, label: "4月" },
  { value: 5, label: "5月" },
  { value: 6, label: "6月" },
  { value: 7, label: "7月" },
  { value: 8, label: "8月" },
  { value: 9, label: "9月" },
  { value: 10, label: "10月" },
  { value: 11, label: "11月" },
  { value: 12, label: "12月" },
];

const ContestEdit = () => {
  const { contest_id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    description: "",
    logo: "",
    place: "",
    level: "",
    quality: "",
    months: [],
    keywords: [],
    website: "",
    materials: [],
    registration_start: "",
    registration_end: "",
  });

  const [materialInput, setMaterialInput] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  // 获取比赛详情
  useEffect(() => {
    const fetchContest = async () => {
      const controller = new AbortController();

      try {
        const res = await contestAPI.getContestDetail(contest_id, { signal: controller.signal });
        if (res.success) {
          setFormData({
            ...res.data,
            registration_start: res.data.registration_start
              ? new Date(res.data.registration_start).toISOString().slice(0, 16)
              : "",
            registration_end: res.data.registration_end
              ? new Date(res.data.registration_end).toISOString().slice(0, 16)
              : "",
          });
          setLogoPreview(res.data.logo || "");
        } else {
          showMessage(`获取比赛详情失败：${res.message}`, "error");
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，请稍后再试：${err}`, "error");
      }

      return () => controller.abort();
    };

    fetchContest();
  }, [contest_id]);

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleAddMaterial = () => {
    if (materialInput.name && materialInput.url) {
      setFormData({
        ...formData,
        materials: [...formData.materials, { ...materialInput }],
      });
      setMaterialInput({ name: "", url: "" });
    }
  };

  const handleRemoveMaterial = (index) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: newMaterials });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showMessage("请选择图片文件", "warning", false);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showMessage("图片文件大小不能超过2MB", "warning", false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setFormData({ ...formData, logo: base64String });
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: "" });
    setLogoPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const controller = new AbortController();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        registration_start: formData.registration_start
          ? new Date(formData.registration_start).toISOString()
          : null,
        registration_end: formData.registration_end
          ? new Date(formData.registration_end).toISOString()
          : null,
      };

      const res = await contestAPI.updateContest(contest_id, submitData, { signal: controller.signal });

      if (res.success) {
        showMessage("比赛更新成功！", "success");
      } else {
        showMessage(`比赛更新失败：${res.message || "未知错误。"}`, "error");
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      showMessage(
        `比赛更新失败：${error.response?.data?.detail || error.message}`,
        "error",
      );
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        编辑比赛
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* 基本信息 */}
              <Typography variant="h6" color="primary">
                基本信息
              </Typography>

              <TextField
                fullWidth
                label="比赛名称"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
              />

              <TextField
                fullWidth
                label="举办年份"
                type="number"
                value={formData.year}
                onChange={handleInputChange("year")}
                inputProps={{ min: 2000, max: 2200 }}
                required
              />

              <TextField
                fullWidth
                label="比赛描述"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange("description")}
              />

              {/* Logo上传 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  比赛Logo
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    选择图片
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>

                  {(formData.logo || logoPreview) && (
                    <>
                      <Avatar
                        src={logoPreview || formData.logo}
                        sx={{ width: 60, height: 60 }}
                        variant="rounded"
                      />
                      <IconButton
                        onClick={handleRemoveLogo}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  支持 JPG、PNG 格式，文件大小不超过 2MB
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="比赛地点"
                value={formData.place}
                onChange={handleInputChange("place")}
                required
              />

              <TextField
                fullWidth
                label="官网链接"
                type="url"
                value={formData.website}
                onChange={handleInputChange("website")}
              />

              {/* 分类信息 */}
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                分类信息
              </Typography>

              <FormControl fullWidth required>
                <InputLabel>赛事级别</InputLabel>
                <Select
                  value={formData.level}
                  onChange={handleInputChange("level")}
                  label="赛事级别"
                >
                  {CONTEST_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>素拓类别</InputLabel>
                <Select
                  value={formData.quality}
                  onChange={handleInputChange("quality")}
                  label="素拓类别"
                >
                  {CONTEST_QUALITIES.map((quality) => (
                    <MenuItem key={quality.value} value={quality.value}>
                      {quality.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>比赛月份</InputLabel>
                <Select
                  multiple
                  value={formData.months}
                  onChange={handleMultiSelectChange("months")}
                  input={<OutlinedInput label="比赛月份" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={MONTHS.find((m) => m.value === value)?.label}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {MONTHS.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>关键词</InputLabel>
                <Select
                  multiple
                  value={formData.keywords}
                  onChange={handleMultiSelectChange("keywords")}
                  input={<OutlinedInput label="关键词" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            CONTEST_KEYWORDS.find((k) => k.value === value)
                              ?.label
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {CONTEST_KEYWORDS.map((keyword) => (
                    <MenuItem key={keyword.value} value={keyword.value}>
                      {keyword.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 报名时间 */}
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                报名时间
              </Typography>

              <TextField
                fullWidth
                label="报名开始时间"
                type="datetime-local"
                value={formData.registration_start}
                onChange={handleInputChange("registration_start")}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="报名结束时间"
                type="datetime-local"
                value={formData.registration_end}
                onChange={handleInputChange("registration_end")}
                InputLabelProps={{ shrink: true }}
              />

              {/* 学习材料 */}
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                学习材料
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <TextField
                  label="材料名称"
                  value={materialInput.name}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, name: e.target.value })
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="材料链接"
                  value={materialInput.url}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, url: e.target.value })
                  }
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddMaterial}
                  sx={{ height: "56px" }}
                >
                  添加
                </Button>
              </Box>

              {formData.materials.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    已添加的材料:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.materials.map((material, index) => (
                      <Chip
                        key={index}
                        label={material.name}
                        onDelete={() => handleRemoveMaterial(index)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "保存中..." : "保存修改"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContestEdit;
