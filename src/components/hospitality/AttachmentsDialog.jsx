import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import hospitalityApi from "../../api/hospitalityApi";

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return "";
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function fileNameFromPath(path, fallback = "附件") {
  if (!path) return fallback;
  const normalized = String(path).trim().replace(/\/+$/, "");
  const last = normalized.split("/").pop();
  if (!last) return fallback;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function fileKey(file) {
  if (!file) return "";
  // Quick/simple dedupe within the current selection list.
  // Avoids uploading the exact same file twice during one "add" flow.
  return `${file.name ?? ""}|${file.size ?? ""}|${file.lastModified ?? ""}`;
}

async function openProtectedImage(relativePath) {
  const res = await hospitalityApi.fetchAttachmentBlob(relativePath);
  if (!res?.data) return;
  const objectUrl = URL.createObjectURL(res.data);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function AttachmentsDialog({
  open,
  record,
  onClose,
  onSave,
}) {
  const invoiceInputRef = useRef(null);
  const formInputRef = useRef(null);
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [formFiles, setFormFiles] = useState([]);
  const [removedInvoicePaths, setRemovedInvoicePaths] = useState([]);
  const [removedFormPaths, setRemovedFormPaths] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // UI-only state for showing which drop zone is currently highlighted.
  const [activeDropSection, setActiveDropSection] = useState(null);

  useEffect(() => {
    if (!open) return;
    setInvoiceFiles([]);
    setFormFiles([]);
    setRemovedInvoicePaths([]);
    setRemovedFormPaths([]);
    setSaveError("");
  }, [open, record?.id]);

  const toggleInvoiceRemoved = (path) => {
    if (!path) return;
    setRemovedInvoicePaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const toggleFormRemoved = (path) => {
    if (!path) return;
    setRemovedFormPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const appendDedupedFiles = (setFiles, nextFiles) => {
    const normalizedNext = Array.from(nextFiles || []);
    if (!normalizedNext.length) return;
    setFiles((prev) => {
      const current = prev ?? [];
      const existingKeys = new Set(current.map(fileKey));
      const filteredNext = normalizedNext.filter((f) => !existingKeys.has(fileKey(f)));
      return [...current, ...filteredNext];
    });
  };

  const removeSelectedFile = (setFiles, inputRef, index) => {
    setFiles((prev) => (prev ?? []).filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearSelectedFiles = (setFiles, inputRef) => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const renderAttachmentSection = ({
    sectionLabel,
    selectLabel,
    pendingLabel,
    existingLabel,
    existingNamePrefix,
    selectedFiles,
    setSelectedFiles,
    inputRef,
    existingEntries,
    removedPaths,
    toggleRemoved,
    dropKey,
  }) => (
    <Box sx={{ py: 0.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        <Box
          sx={{
            display: "inline-flex",
            px: 1,
            py: 0.25,
            borderLeft: "3px solid",
            borderLeftColor: "primary.main",
          }}
        >
          <Typography  color="text.primary">
            {sectionLabel}
          </Typography>
        </Box>
        <Box
          sx={{
            border: "1px dashed",
            borderColor: activeDropSection === dropKey ? "primary.main" : "divider",
            borderRadius: 1,
            px: 1,
            py: 1,
            bgcolor: activeDropSection === dropKey ? "primary.50" : "transparent",
            transition: "all 120ms ease-in-out",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setActiveDropSection(dropKey);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (e.currentTarget.contains(e.relatedTarget)) return;
            // When dragging quickly across drop areas, a late dragleave from this area
            // can fire after another area becomes active; only clear if still active.
            setActiveDropSection((prev) => (prev === dropKey ? null : prev));
          }}
          onDrop={(e) => {
            e.preventDefault();
            setActiveDropSection((prev) => (prev === dropKey ? null : prev));
            appendDedupedFiles(setSelectedFiles, e.dataTransfer?.files);
          }}
        >
          <Button component="label" variant="outlined" size="small">
            {selectLabel}
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept="image/*,.pdf,application/pdf"
              onChange={(e) => {
                appendDedupedFiles(setSelectedFiles, e.target.files);
                // Allow selecting the same file again to trigger onChange.
                e.target.value = "";
              }}
            />
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            或将文件拖拽到此区域
          </Typography>
        </Box>
      </Box>
      {selectedFiles?.length > 0 && (
        <Box
          mt={1}
          sx={{
            border: "1px dashed",
            borderColor: "primary.light",
            borderRadius: 1,
            p: 1,
            backgroundColor: "primary.50",
          }}
        >
          <Typography variant="body2">{pendingLabel}</Typography>
          <Box display="flex" flexDirection="column" gap={0.5} mt={0.5}>
            {selectedFiles.map((f, index) => (
              <Box
                key={`${f?.name ?? "file"}-${index}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Typography variant="caption" color="text.secondary" noWrap>
                  {index + 1}. {f?.name}
                  {f?.size ? ` (${formatBytes(f.size)})` : ""}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => removeSelectedFile(setSelectedFiles, inputRef, index)}
                >
                  移除
                </Button>
              </Box>
            ))}
          </Box>
          <Button
            size="small"
            variant="text"
            onClick={() => clearSelectedFiles(setSelectedFiles, inputRef)}
            sx={{ mt: 1, alignSelf: "flex-start" }}
          >
            清空选择
          </Button>
        </Box>
      )}

      {existingEntries?.length > 0 && (
        <Box
          mt={1}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1,
            backgroundColor: "grey.50",
          }}
        >
          <Typography variant="body2">{existingLabel}</Typography>
          <Box display="flex" flexDirection="column" gap={0.5} mt={0.5}>
            {existingEntries.map((entry, index) => {
              const { path, sizeBytes } = entry;
              if (!path) return null;
              const sz = formatBytes(sizeBytes);
              const isRemoved = removedPaths.includes(path);
              return (
                <Box
                  key={path || index}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Button
                    variant="text"
                    size="small"
                    disabled={isRemoved}
                    sx={{ fontSize: "0.75rem" }}
                    onClick={() => openProtectedImage(path).catch(console.error)}
                  >
                    {fileNameFromPath(path, `${existingNamePrefix}${index + 1}`)}
                    {sz ? ` (${sz})` : ""}
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color={isRemoved ? "primary" : "error"}
                    onClick={() => toggleRemoved(path)}
                  >
                    {isRemoved ? "撤销删除" : "删除"}
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );

  const hasPendingChanges =
    (invoiceFiles?.length ?? 0) > 0 ||
    (formFiles?.length ?? 0) > 0 ||
    removedInvoicePaths.length > 0 ||
    removedFormPaths.length > 0;

  const handleSave = async () => {
    if (!hasPendingChanges || isSaving) return;
    try {
      setIsSaving(true);
      setSaveError("");
      await onSave({
        invoiceFiles: invoiceFiles ?? [],
        formFiles: formFiles ?? [],
        removeInvoicePaths: removedInvoicePaths,
        removeFormPaths: removedFormPaths,
      });
    } catch (e) {
      const serverMessage = e?.response?.data?.message;
      const message =
        (typeof serverMessage === "string" && serverMessage.trim()) ||
        e?.message ||
        "保存失败，请稍后重试";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <span>附件： 发票 / 业务招待清单 </span>
        <Typography variant="subtitle1">
          发票号码：{record?.invoiceNumberString || "未填写"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {record && (
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" flexDirection="column" gap={2}>
              {renderAttachmentSection({
                sectionLabel: "发票附件（可上传多张）",
                selectLabel: "选择发票",
                pendingLabel: "待上传发票：",
                existingLabel: "已上传发票：",
                existingNamePrefix: "发票",
                selectedFiles: invoiceFiles,
                setSelectedFiles: setInvoiceFiles,
                inputRef: invoiceInputRef,
                existingEntries: record.invoiceImages,
                removedPaths: removedInvoicePaths,
                toggleRemoved: toggleInvoiceRemoved,
                dropKey: "invoice",
              })}

              <Divider sx={{ borderColor: "text.disabled" }} />

              {renderAttachmentSection({
                sectionLabel: "业务招待清单附件（可上传多张）",
                selectLabel: "选择业务招待清单",
                pendingLabel: "待上传业务招待清单：",
                existingLabel: "已上传业务招待清单：",
                existingNamePrefix: "业务招待清单",
                selectedFiles: formFiles,
                setSelectedFiles: setFormFiles,
                inputRef: formInputRef,
                existingEntries: record.formImages,
                removedPaths: removedFormPaths,
                toggleRemoved: toggleFormRemoved,
                dropKey: "form",
              })}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {saveError && (
          <Typography variant="body2" color="error" sx={{ mr: "auto", ml: 1 }}>
            {saveError}
          </Typography>
        )}
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hasPendingChanges || isSaving}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

