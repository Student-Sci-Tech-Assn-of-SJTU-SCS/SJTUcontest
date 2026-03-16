import {
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { contestAPI } from "../../services/ContestServices";
import showMessage from "../../utils/message";
import { useConfirm } from "material-ui-confirm";

const ViewContests = () => {
  const confirm = useConfirm();

  const [loading, setLoading] = useState(false);
  const [contests, setContests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const navigate = useNavigate();
  const pageSize = 10;

  // 获取比赛数据
  useEffect(() => {
    const fetchContests = async () => {
      const controller = new AbortController();
      setLoading(true);

      try {
        const res = await contestAPI.getContests(pageIndex, pageSize, {
          signal: controller.signal,
        });
        if (res.success) {
          setContests(res.data.matches || []);
          setPageCount(res.data.total_pages);
        } else {
          showMessage(
            `获取比赛数据失败：${res.message || "未知错误。"}`,
            "error",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage("网络错误，请稍后重试。", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
    // console.log(contests);
  }, [pageIndex, pageSize]);

  // 删除所选比赛
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const { confirmed, reason } = await confirm({
      title: "确认删除",
      description: `确定要删除所选的 ${selectedIds.length} 个比赛吗？此操作不可撤销。`,
      confirmationText: "删除",
      cancellationText: "取消",
    });

    if (!confirmed) {
      // console.log("管理员取消删除。");
      return;
    }
    // console.log("管理员确认删除。");

    const controller = new AbortController();

    try {
      await Promise.all(
        selectedIds.map((contest_id) => contestAPI.deleteContest(contest_id), {
          signal: controller.signal,
        }),
      );
      setContests((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);

      showMessage("比赛删除成功！", "success");
    } catch (err) {
      if (axios.isCancel(err)) return;
      showMessage(`删除失败，请稍后再试：${err}`, "error");
    }

    return () => controller.abort();
  };

  const columns = [
    // { field: "id", headerName: "UUID", width: 100 },
    { field: "name", headerName: "比赛名称", flex: 1 },
    { field: "year", headerName: "年份", width: 60 },
    { field: "description", headerName: "描述", width: 400 },
    {
      field: "actions",
      headerName: "操作",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/admin/edit-contest/${params.row.id}`)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Box
      sx={{
        px: 5,
        py: 5,
        transition: "width 0.5s ease",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        管理比赛
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="error"
              disabled={selectedIds.length === 0}
              onClick={handleDelete}
            >
              批量删除
            </Button>
          </Box>

          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={contests}
              columns={columns}
              checkboxSelection
              pageSize={pageSize}
              onRowSelectionModelChange={(model) => {
                setSelectedIds(Array.from(model.ids));
              }}
              paginationMode="server"
              rowCount={pageCount * pageSize}
              page={pageIndex - 1}
              onPaginationModelChange={(model) => {
                if (model.page !== pageIndex - 1) {
                  setPageIndex(model.page + 1);
                }
              }}
              localeText={{
                footerRowSelected: (count) =>
                  `${count.toLocaleString()} 行已选择`,
                footerTotalRows: "总行数：",
                MuiTablePagination: {
                  labelRowsPerPage: "每页行数：",
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}–${to} 共 ${count !== -1 ? count : `超过 ${to}`}`,
                },
              }}
            />
          </div>
        </>
      )}
    </Box>
  );
};

export default ViewContests;
