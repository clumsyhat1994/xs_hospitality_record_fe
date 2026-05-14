import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import RHFTextField from "../form/RHFTextField";
import RHFSelect from "../form/RHFSelect";
import RHFCalculatedField from "../form/RHFCalculatedField";

import HospitalityItemsFieldArray from "./HospitalityItemsFieldArray";
import UsageItemLinesFieldArray from "../usage/UsageItemLinesFieldArray";
import { hospitalityRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";
import hospitalityApi from "../../api/hospitalityApi";
import { validationMessages } from "../../constants/validationMessages";
import { BEErrorFieldToFEFormFieldMap } from "../../constants/BEErrorFieldToFEFormFieldMap";
import { FormModeProvider } from "../../context/FormModeContext";
import { analyzeBackendErrors, SOFT_CODES } from "../../utils/errorUtils";
import RHFComboBox from "../form/RHFComboBox";
import { useMasterData } from "../../context/MasterDataContext";
import masterDataApi from "../../api/masterDataApi";
import { useAuth } from "../../context/AuthProvider";
import RHFTextareaField from "../form/RHFTextareaField";
import MasterDataDialog from "../master-data/MasterDataDialog";
import RHFAutocomplete from "../form/RHFAutocomplete";
import { toNullableNumber } from "../../utils/numberUtils";
import { initialAllocatedByPurchaseIdFromSlices } from "../../utils/giftAllocationFormUtils";

const DEPTWITHQUOTA = ["SCYWB", "QCCZB"];

/** Gift purchase allocation block under the hospitality form; flip to re-show. */
const SHOW_USAGE_ITEM_LINES_IN_HOSPITALITY_DIALOG = true;

/**
 * Gift usage: API read model vs form write field.
 *
 * - {@code purchaseAllocations}: returned by the backend on hospitality records (resolved slices for display).
 * - {@code giftInventoryLines}: react-hook-form field for the same lines in the UI. When opening the dialog we
 *   copy {@code purchaseAllocations} into {@code giftInventoryLines} (see {@link toHospitalityFormDefaults}) so
 *   {@code UsageItemLinesFieldArray} can edit them. Each line keeps {@code category}, {@code purchaseId}, {@code quantity},
 *   and client-only {@code unitPrice} for totals; display fields come from the selected purchase option.
 * - On save, the client sends {@code giftInventoryLines} in the create/update body (server {@code GiftInventoryLineDTO}
 *   shape). This dialog only submits lines with {@code purchaseId} and {@code quantity} (always {@code productName: null});
 *   incomplete rows are dropped. {@code purchaseAllocations} is not the write contract.
 */

/** Seeds form {@code giftInventoryLines} from API {@code purchaseAllocations} when opening (see block comment above). */
function toHospitalityFormDefaults(values) {
  if (!values) return values;
  const alloc = values.purchaseAllocations;
  if (Array.isArray(alloc) && alloc.length > 0) {
    return {
      ...values,
      giftInventoryLines: alloc.filter(Boolean).map((a) => ({
        category: a.category ?? "",
        purchaseId: a.purchaseId,
        quantity: a.quantity,
        unitPrice: a.unitPrice != null && a.unitPrice !== "" ? a.unitPrice : "",
      })),
    };
  }
  return {
    ...values,
    giftInventoryLines: [],
  };
}

export default function HospitalityRecordDialog({
  open,
  initialValues,
  isEditMode,
  onClose,
  onSave,
}) {
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: toHospitalityFormDefaults(initialValues),
  });

  const initialAllocatedByPurchaseId = useMemo(
    () =>
      initialAllocatedByPurchaseIdFromSlices(
        initialValues?.purchaseAllocations,
      ),
    [initialValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    getFieldState,
    formState: { isSubmitting, errors },
    getValues,
  } = methods;
  const formDepartmentCode = useWatch({ control, name: "departmentCode" });

  const [softConfirmDialogOpen, setSoftConfirmDialogOpen] = useState(false);
  const [createHandlerDialogOpen, setCreateHandlerDialogOpen] = useState(false);
  const {
    departments,
    setDepartments,
    hospitalityTypes,
    setHospitalityTypes,
    ourHostPositions,
    setOurHostPositions,
    counterparties,
    setCounterparties,
    handlers,
    setHandlers,
  } = useMasterData();

  const [softErrors, setSoftErrors] = useState([]);
  const { departmentCode: userDepartmentCode, isAdmin, user } = useAuth();

  useEffect(() => {
    if (!open) return;
    reset(toHospitalityFormDefaults(initialValues));
    if (!isAdmin) setValue("departmentCode", userDepartmentCode);
  }, [initialValues, isAdmin, open, reset, setValue, userDepartmentCode]);

  useEffect(() => {
    if (!DEPTWITHQUOTA.includes(formDepartmentCode)) {
      setValue("usesDeptQuota", null, { shouldValidate: true });
    }
  }, [formDepartmentCode, setValue]);

  const cleanData = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(([k, v]) => {
        return (
          (v !== null && v !== undefined && v !== "") || k === "usesDeptQuota"
        );
      }),
    );
  };

  const submit = async (data, confirm = false) => {
    try {
      let res;

      const normalized = {
        ...data,
        invoiceAmount: toNullableNumber(data.invoiceAmount),
        theirCount: toNullableNumber(data.theirCount, { integer: true }),
        ourCount: toNullableNumber(data.ourCount, { integer: true }),
        items: Array.isArray(data.items)
          ? data.items.map((item) => ({
              ...item,
              unitPrice: toNullableNumber(item?.unitPrice),
              quantity: toNullableNumber(item?.quantity, { integer: true }),
            }))
          : data.items,
        giftInventoryLines: Array.isArray(data.giftInventoryLines)
          ? data.giftInventoryLines
              .map((line) => {
                const purchaseId = toNullableNumber(line?.purchaseId, {
                  integer: true,
                });
                const quantity = toNullableNumber(line?.quantity, {
                  integer: true,
                });
                if (!purchaseId || !quantity || quantity < 1) return null;
                return {
                  id: toNullableNumber(line?.id, { integer: true }),
                  purchaseId,
                  productName: null,
                  quantity,
                };
              })
              .filter(Boolean)
          : data.giftInventoryLines,
      };
      data = cleanData(normalized);
      if (isEditMode) {
        // update
        res = await hospitalityApi.update(initialValues.id, data, confirm);
      } else {
        // create
        const createPayload = {
          ...data,
          giftInventoryLines: data.giftInventoryLines ?? [],
        };
        res = await hospitalityApi.create(createPayload, confirm);
      }
      setSoftConfirmDialogOpen(false);
      onSave();
    } catch (err) {
      let errorData = err.response?.data;

      if (!Array.isArray(errorData)) {
        console.error(errorData?.message);
        return;
      }
      const { hasHardErrors } = analyzeBackendErrors(errorData);

      if (hasHardErrors) {
        errorData = errorData.filter((e) => !SOFT_CODES.includes(e.code));
      } else {
        setSoftConfirmDialogOpen(true);
        setSoftErrors(errorData);
      }
      errorData.forEach((e) => {
        const fieldName = BEErrorFieldToFEFormFieldMap[e.field] ?? e.field;
        const fieldState = getFieldState(fieldName);
        const existingErrorMessage = fieldState.error
          ? fieldState.error?.message + "\n"
          : "";
        setError(fieldName, {
          type: "server",
          message:
            existingErrorMessage + (validationMessages[e.code] ?? e.message),
        });
      });
    }
  };

  return (
    <FormModeProvider isEditMode={isEditMode}>
      <FormProvider {...methods}>
        <Dialog
          //keepMounted
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{isEditMode ? "修改记录" : "新建记录"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }} alignItems="stretch">
              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="receptionDate"
                  label={fieldLabels.receptionDate}
                  type="date"
                />
              </Grid>

              <RHFComboBox
                name="counterpartyId"
                //control={control}
                options={counterparties ?? []}
                setOptions={setCounterparties}
                label={fieldLabels.counterparty}
                fetchOptions={masterDataApi.searchCounterParties}
                sm={8}
              />

              <Grid size={{ xs: 12, sm: "grow" }}>
                <RHFAutocomplete
                  name="departmentCode"
                  requireAdmin
                  getOptionValue={(opt) => opt.code ?? opt}
                  options={departments ?? []}
                  label={fieldLabels.department}
                />
              </Grid>

              {DEPTWITHQUOTA.includes(formDepartmentCode) && (
                <RHFSelect
                  name="usesDeptQuota"
                  label="是否使用部门额度"
                  options={[
                    { value: "true", label: "是" },
                    { value: "false", label: "否" },
                  ]}
                  getOptionLabel={(opt) => opt.label ?? String(opt)}
                  getOptionValue={(opt) => opt.value ?? opt}
                  required
                  sm={2}
                />
              )}

              <RHFComboBox
                name="handlerId"
                options={handlers ?? []}
                setOptions={setHandlers}
                label={fieldLabels.handlerName}
                fetchOptions={masterDataApi.searchHandlers}
                sm={5}
              />

              <Grid size={{ sm: 1 }}>
                <Tooltip
                  title="没有你的名字？点击这里添加吧~"
                  placement="top"
                  arrow
                >
                  <IconButton onClick={() => setCreateHandlerDialogOpen(true)}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFAutocomplete
                  name="hospitalityTypeId"
                  options={hospitalityTypes ?? []}
                  label={fieldLabels.hospitalityType}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="location" label={fieldLabels.location} />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="invoiceDate"
                  label={fieldLabels.invoiceDate}
                  type="date"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 8 }}>
                <RHFTextField
                  name="invoiceNumberString"
                  required={false}
                  numericOnly={true}
                  label={fieldLabels.invoiceNumberString}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="invoiceAmount"
                  label={fieldLabels.invoiceAmount}
                  type="number"
                />
              </Grid>

              <RHFCalculatedField
                label={fieldLabels.totalAmount}
                name="totalAmount"
                computeValue={(values) => {
                  const items = values?.items ?? [];
                  const itemsTotal = items.reduce(
                    (sum, item) => sum + (Number(item?.lineTotal) || 0),
                    0,
                  );
                  const giftLines = values?.giftInventoryLines ?? [];

                  const giftLinesTotal = giftLines.reduce((sum, line) => {
                    const q = Number(line?.quantity);
                    const p = Number(line?.unitPrice);
                    if (
                      !Number.isFinite(q) ||
                      !Number.isFinite(p) ||
                      q <= 0 ||
                      p < 0
                    ) {
                      return sum;
                    }
                    return sum + q * p;
                  }, 0);
                  return (
                    itemsTotal +
                    Number(values?.invoiceAmount || 0) +
                    giftLinesTotal
                  );
                }}
              />

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="theirCount"
                  label={fieldLabels.theirCount}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="ourCount"
                  label={fieldLabels.ourCount}
                  type="number"
                />
              </Grid>

              <RHFCalculatedField
                label={fieldLabels.totalCount}
                name="totalCount"
                computeValue={(values) => {
                  const our = Number(values?.ourCount) || 0;
                  const their = Number(values?.theirCount) || 0;
                  return our + their;
                }}
              />

              <RHFCalculatedField
                name="perCapitaAmount"
                label={fieldLabels.perCapitaAmount}
                computeValue={(values) => {
                  if (!values.totalCount) return "0.00";
                  const totalAmount = Number(values?.totalAmount) || 0;
                  const totalCount = Number(values?.totalCount) || 0;
                  return (totalAmount / totalCount).toFixed(2);
                }}
              />

              <RHFComboBox
                name="ourHostPositionId"
                options={ourHostPositions ?? []}
                setOptions={setOurHostPositions}
                label={fieldLabels.ourHostPosition}
                fetchOptions={masterDataApi.searchPositions}
              />

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="theirHostPosition"
                  label={fieldLabels.theirHostPosition}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="deptHeadApprovalDate"
                  label={fieldLabels.deptHeadApprovalDate}
                  type="date"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="partySecretaryApprovalDate"
                  label={fieldLabels.partySecretaryApprovalDate}
                  type="date"
                />
              </Grid>
              <RHFTextareaField name={"remark"} label={fieldLabels.remark} />
            </Grid>
            <HospitalityItemsFieldArray control={control} name="items" />
            {SHOW_USAGE_ITEM_LINES_IN_HOSPITALITY_DIALOG && (
              <UsageItemLinesFieldArray
                control={control}
                errors={errors}
                clearErrors={clearErrors}
                initialAllocatedByPurchaseId={initialAllocatedByPurchaseId}
              />
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => submit(data))}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogActions>
        </Dialog>

        <MasterDataDialog
          open={createHandlerDialogOpen}
          width={400}
          initialValues={{
            name: "",
          }}
          onClose={() => {
            setCreateHandlerDialogOpen(false);
          }}
          onSaveSuccess={async () => {
            const res = await masterDataApi.searchHandlers();
            setHandlers(res.data ?? []);
          }}
          save={(data) => masterDataApi.createHandler(data)}
          textFields={[
            { fieldName: "name", label: "姓名", sm: 12, chineseOnly: true },
          ]}
        />

        <Dialog maxWidth="md" open={softConfirmDialogOpen}>
          <DialogTitle>您确定要提交吗？</DialogTitle>
          <DialogContent>
            {softErrors.map((e) => (
              <div key={e.code}>
                - {validationMessages[e.code] ?? e.message}
              </div>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSoftConfirmDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="contained"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => submit(data, true))}
            >
              {isSubmitting ? "提交中" : "确认提交"}
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </FormModeProvider>
  );
}
