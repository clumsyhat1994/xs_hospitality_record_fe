import { useState, useEffect, useCallback } from "react";
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
import RHFTextField from "../form/RHFGridTextField";
import RHFSelect from "../form/RHFGridSelect";
import RHFCalculatedGridTextField from "../form/RHFCalculatedGridTextField";

import HospitalityItemsFieldArray from "./HospitalityItemsFieldArray";
import fieldLabels from "../../constants/recordFieldLabels";
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
//import masterDataFetchers from "../../api/masterDataFetchers";

const DEPTWITHQUOTA = ["SCYWB", "QCCZB"];
export default function HospitalityRecordDialog({
  open,
  initialValues,
  isEditMode,
  onClose,
  onSave,
}) {
  const methods = useForm({
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getFieldState,
    formState: { isSubmitting },
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
    reset(initialValues);
    if (!isAdmin) setValue("departmentCode", userDepartmentCode);
  }, [initialValues, isAdmin, open, reset, setValue, userDepartmentCode]);

  useEffect(() => {
    if (!DEPTWITHQUOTA.includes(formDepartmentCode)) {
      setValue("usesDeptQuota", null, { shouldValidate: true });
    }
  }, [formDepartmentCode, setValue]);

  const cleanData = (data) => {
    console.log(data);

    return Object.fromEntries(
      Object.entries(data).filter(([k, v]) => {
        return (
          (v !== null && v !== undefined && v !== "") || k === "usesDeptQuota"
        );
      })
    );
  };

  const submit = async (data, confirm = false) => {
    try {
      let res;
      //console.log(data);
      data = cleanData(data);
      if (isEditMode) {
        // update
        res = await hospitalityApi.update(initialValues.id, data, confirm);
        //console.log(res.data);
      } else {
        // create
        res = await hospitalityApi.create(data, confirm);
        //console.log(res.data);
      }
      setSoftConfirmDialogOpen(false);
      onSave();
    } catch (err) {
      //console.error(err);

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
              <RHFTextField
                name="receptionDate"
                //control={control}
                label={fieldLabels.receptionDate}
                type="date"
                sm={4}
              />

              <RHFComboBox
                name="counterpartyId"
                //control={control}
                options={counterparties ?? []}
                setOptions={setCounterparties}
                label={fieldLabels.counterparty}
                fetchOptions={masterDataApi.searchCounterParties}
                sm={8}
              />

              {/* <RHFComboBox
                name="departmentCode"
                getOptionValue={(opt) => opt.code ?? opt}
                options={departments ?? []}
                setOptions={setDepartments}
                label={fieldLabels.department}
                fetchOptions={masterDataApi.searchDepartments}
                isAdmin={isAdmin}
                sm={"grow"}
              /> */}

              <RHFAutocomplete
                name="departmentCode"
                getOptionValue={(opt) => opt.code ?? opt}
                options={departments ?? []}
                label={fieldLabels.department}
                sm={"grow"}
              />

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

              {/* <RHFSelect
                name="departmentCode"
                //control={control}
                getOptionValue={(opt) => opt.code ?? opt}
                label={fieldLabels.department}
                options={departments ?? []}
                isAdmin={isAdmin}
              /> */}

              {/* <RHFTextField
                sm={5}
                name="handlerName"
                label={fieldLabels.handlerName}
              /> */}

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

              <RHFComboBox
                name="hospitalityTypeId"
                options={hospitalityTypes ?? []}
                setOptions={setHospitalityTypes}
                label={fieldLabels.hospitalityType}
                fetchOptions={masterDataApi.searchHospitalityTypes}
              />

              {/* <RHFSelect
                name="hospitalityTypeId"
                //control={control}
                label={fieldLabels.hospitalityType}
                options={hospitalityTypes ?? []}
              /> */}

              <RHFTextField name="location" label={fieldLabels.location} />

              <RHFTextField
                name="invoiceDate"
                label={fieldLabels.invoiceDate}
                type="date"
                sm={4}
              />

              <RHFTextField
                name="invoiceNumberString"
                required={false}
                numericOnly={true}
                label={fieldLabels.invoiceNumberString}
                sm={8}
              />

              <RHFTextField
                name="invoiceAmount"
                label={fieldLabels.invoiceAmount}
                type="number"
              />

              <RHFCalculatedGridTextField
                label={fieldLabels.totalAmount}
                name="totalAmount"
                computeValue={(values) => {
                  const items = values?.items ?? [];
                  const itemsTotal = items.reduce(
                    (sum, item) => sum + (Number(item?.lineTotal) || 0),
                    0
                  );
                  return itemsTotal + Number(values?.invoiceAmount || 0);
                }}
              />

              <RHFTextField
                name="theirCount"
                label={fieldLabels.theirCount}
                type="number"
              />
              <RHFTextField
                name="ourCount"
                label={fieldLabels.ourCount}
                type="number"
              />

              <RHFCalculatedGridTextField
                label={fieldLabels.totalCount}
                name="totalCount"
                computeValue={(values) => {
                  const our = Number(values?.ourCount) || 0;
                  const their = Number(values?.theirCount) || 0;
                  return our + their;
                }}
              />

              <RHFCalculatedGridTextField
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

              {/* <RHFSelect
                name="ourHostPositionId"
                //control={control}
                label={fieldLabels.ourHostPosition}
                options={positions ?? []}
              /> */}

              {/* <RHFComboBox
                name="theirHostPositionId"
                options={theirHostPositions ?? []}
                setOptions={setTheirHostPositions}
                label={fieldLabels.theirHostPosition}
                fetchOptions={masterDataApi.searchPositions}
              /> */}

              {/* <RHFSelect
                name="theirHostPositionId"
                //control={control}
                label={fieldLabels.theirHostPosition}
                options={positions ?? []}
              /> */}

              <RHFTextField
                name="theirHostPosition"
                label={fieldLabels.theirHostPosition}
              />

              <RHFTextField
                name="deptHeadApprovalDate"
                label={fieldLabels.deptHeadApprovalDate}
                type="date"
              />
              <RHFTextField
                name="partySecretaryApprovalDate"
                label={fieldLabels.partySecretaryApprovalDate}
                type="date"
              />
              <RHFTextareaField name={"remark"} label={fieldLabels.remark} />
            </Grid>
            <HospitalityItemsFieldArray control={control} name="items" />
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
