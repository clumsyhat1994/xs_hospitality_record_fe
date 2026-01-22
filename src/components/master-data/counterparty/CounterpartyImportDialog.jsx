// src/components/counterparty/CounterpartyImportDialog.jsx
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  FormControlLabel,
} from "@mui/material";
import masterDataApi from "../../../api/masterDataApi";

function normalizeHeader(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase();
}

function splitTypes(s) {
  if (!s) return [];
  return String(s)
    .split(/[,，;；、/]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseBool(v) {
  if (v === null || v === undefined || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "是", "y", "yes"].includes(s)) return true;
  if (["false", "0", "否", "n", "no"].includes(s)) return false;
  return undefined;
}

function pickField(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return undefined;
}

export default function CounterpartyImportDialog({ open, onClose, onSuccess }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => rows.slice(0, 20), [rows]);

  const handleFile = async (file) => {
    setError("");
    setResult(null);
    setRows([]);
    setFileName(file?.name ?? "");

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // array of objects

      // Normalize headers
      const normalized = raw.map((r) => {
        const out = {};
        for (const [k, v] of Object.entries(r)) {
          out[normalizeHeader(k)] = v;
        }
        return out;
      });

      // Accept multiple header variants
      const parsed = normalized
        .map((r) => {
          const name = pickField(r, ["name", "招待对象", "单位名称", "名称"]);
          const typesCell = pickField(r, [
            "types",
            "counterpartytypes",
            "归属地",
          ]);
          const activeCell = pickField(r, ["active", "启用", "是否启用"]);

          return {
            name: String(name ?? "")
              .trim()
              .replace(/\s+/g, ""),
            counterpartyTypeNames: splitTypes(typesCell),
            active: parseBool(activeCell),
          };
        })
        .filter((r) => r.name !== "");

      if (parsed.length === 0) {
        setError("没有解析到任何数据（请检查表头/内容）");
        return;
      }
      setRows(parsed);
    } catch (e) {
      console.error(e);
      setError("文件解析失败：请确认是 .xlsx 或 .csv 且第一行是表头");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        rows,
      };

      const res = await masterDataApi.importCounterparty(payload);
      setResult(res.data);

      // refresh list outside
      onSuccess?.();
    } catch (e) {
      console.error(e);
      //setError(e?.response?.data?.detail ?? e?.message ?? "导入失败");
      setError("导入失败, 请联系工程技术部曾轩");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError("");
    setResult(null);
    setRows([]);
    setFileName("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>导入招待对象</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" component="label">
              选择文件（.xlsx/.csv）
              <input
                type="file"
                hidden
                accept=".xlsx,.csv"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {fileName || "未选择文件"}
            </Typography>
          </Stack>

          {/* <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={replaceTypes}
                  onChange={(e) => setReplaceTypes(e.target.checked)}
                />
              }
              label="覆盖类型（否则合并）"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={createMissingTypes}
                  onChange={(e) => setCreateMissingTypes(e.target.checked)}
                />
              }
              label="自动创建不存在的类型"
            />
          </Stack> */}

          {error && <Alert severity="error">{error}</Alert>}

          {rows.length > 0 && (
            <>
              <Alert severity="info">
                解析到 {rows.length} 条（预览前 20 条）
              </Alert>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>单位名称</TableCell>
                    <TableCell>归属地</TableCell>
                    <TableCell>是否启用</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>
                        {(r.counterpartyTypeNames ?? []).join(", ")}
                      </TableCell>
                      <TableCell>
                        {r.active === undefined
                          ? "(默认为是)"
                          : String(r.active)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {result && (
            <Alert severity={result.errors?.length ? "warning" : "success"}>
              总计 {result.total}项，新增 {result.created}项，更新{" "}
              {result.updated}项 ， 跳过 {result.skipped}项。
              {!!result.errors?.length &&
                ` 错误信息 ${result.errors.length} 条。`}
            </Alert>
          )}

          {!!result?.errors?.length && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>序号</TableCell>
                  <TableCell>单位名称</TableCell>
                  <TableCell>错误信息</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.errors.map((e, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{e.rowIndex}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>关闭</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={rows.length === 0 || submitting}
        >
          导入
        </Button>
      </DialogActions>
    </Dialog>
  );
}
