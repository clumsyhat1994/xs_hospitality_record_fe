import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import RHFTextField from "../../form/RHFTextField";
import RHFSelect from "../../form/RHFSelect";
import RHFMultiAutocomplete from "../../form/RHFMultiAutocomplete";
import roleLabels from "../../../constants/roleLabels";

function rolesEqual(a = [], b = []) {
  const left = [...a].map(String).sort().join(",");
  const right = [...b].map(String).sort().join(",");
  return left === right;
}

export default function UsersDialog({
  open,
  initialValues,
  onClose,
  save,
  onSaveSuccess,
  departments = [],
  roleOptions = [],
}) {
  const form = useForm({
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const isEditMode = initialValues?.id != null;

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const buildPayload = (data) => {
    if (!isEditMode) {
      return {
        username: data.username.trim(),
        roles: data.roles ?? [],
        departmentId: data.departmentId,
        password: data.password.trim(),
      };
    }

    // Partial update — only send fields that changed.
    const payload = {};
    const username = data.username.trim();
    if (username !== (initialValues.username ?? "")) {
      payload.username = username;
    }

    const roles = data.roles ?? [];
    if (!rolesEqual(roles, initialValues.roles ?? [])) {
      payload.roles = roles;
    }

    if (data.departmentId !== initialValues.departmentId) {
      payload.departmentId = data.departmentId;
    }

    if (data.password?.trim()) {
      payload.password = data.password.trim();
    }

    return payload;
  };

  const onSubmit = async (data) => {
    const payload = buildPayload(data);
    if (isEditMode && Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await save(payload);
      await onSaveSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        const body = err.response.data;
        setError(body?.field || "username", {
          type: "server",
          message: body?.detail || "用户名已存在",
        });
        return;
      }
      const detail = err.response?.data?.detail;
      if (detail) {
        window.alert(detail);
      }
    }
  };

  return (
    <FormProvider {...form}>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: 560 },
          },
        }}
        maxWidth="sm"
      >
        <DialogTitle>{isEditMode ? "编辑用户" : "新建用户"}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2} pt={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="username" label="用户名" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField
                name="password"
                label={isEditMode ? "新密码（留空不改）" : "密码"}
                type="password"
                required={!isEditMode}
                rules={{
                  validate: (v) => {
                    const trimmed = (v ?? "").trim();
                    if (!trimmed) {
                      return isEditMode ? true : "不能为空";
                    }
                    return trimmed.length >= 8 || "密码至少 8 位";
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFSelect
                name="departmentId"
                label="部门"
                options={departments}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => opt.id}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFMultiAutocomplete
                name="roles"
                control={control}
                label="角色"
                options={roleOptions}
                getOptionLabel={(opt) =>
                  roleLabels[opt] || opt?.name || String(opt)
                }
                getOptionValue={(opt) =>
                  typeof opt === "string" ? opt : opt?.name
                }
              />
            </Grid>
            {isEditMode && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  仅提交有改动的字段；密码留空表示不修改。
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isSubmitting}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
