import React from "react";
import { newsAPI } from "../../services/NewsServices";
import { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";

const CreateNews = () => {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  const handleInputChange = (field) => (event) => {
    setFormData({...formData, [field]: event.target.value});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
        await newsAPI.CreateNews(formData);
        setMessage({
            open: true,
            text: "新闻创建成功！",
            severity: "success",
        });

        setFormData({
            title: "",
            summary: "",
            url: "",
        });
    } catch (error) {
        console.error("创建新闻失败:", error);
        setMessage({
            open: true,
            text: `创建新闻失败: ${error.response?.data?.detail || error.message}`,
            severity: "error",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage({ ...message, open: false });
  };

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom>
            创建新闻
        </Typography>

        <Card>
            <CardContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography variant="h6" color="primary">
                            基本信息
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="新闻标题"
                            value={formData.title}
                            onChange={handleInputChange("title")}
                            required
                        />

                        <TextField
                            fullWidth
                            label="新闻摘要"
                            multiline
                            rows={3}
                            value={formData.summary}
                            onChange={handleInputChange("summary")}
                            required
                        />

                        <TextField
                            fullWidth
                            label="新闻链接"
                            value={formData.url}
                            onChange={handleInputChange("url")}
                            required
                        />

                        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            >
                            {loading ? "创建中..." : "创建新闻"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>

        <Snackbar
            open={message.open}
            autoHideDuration={6000}
            onClose={handleCloseMessage}
        >
            <Alert
          onClose={handleCloseMessage}
          severity={message.severity}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
        </Snackbar>
    </Box>
  )
};

export default CreateNews;