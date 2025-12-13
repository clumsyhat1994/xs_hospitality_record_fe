import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import RHFTextField from "../form/RHFGridTextField";
import RHFSelect from "../form/RHFGridSelect";
import RHFCalculatedGridTextField from "../form/RHFCalculatedGridTextField";

import HospitalityItemsFieldArray from "./HospitalityItemsFieldArray";
import fieldLabels from "../../constants/fieldLables";
import hospitalityApi from "../../api/hospitalityApi";
import { validationMessages } from "../../constants/validationMessages";
import { BEErrorFieldToFEFormFieldMap } from "../../constants/BEErrorFieldToFEFormFieldMap";
import { FormModeProvider } from "../../context/FormModeContext";
import { analyzeBackendErrors, SOFT_CODES } from "../../utils/errorUtils";
import RHFComboBox from "../form/RHFComboBox";
import { useMasterData } from "../../context/MasterDataContext";
import {
  getCurrentUserFromToken,
  isAdmin as isAdminFn,
} from "../../auth/authService";
import masterDataApi from "../../api/masterDataApi";

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

  const { control, handleSubmit, reset, setError, setValue, getFieldState } =
    methods;
  const [softConfirmDialogOpen, setSoftConfirmDialogOpen] = useState(false);
  const {
    departments,
    hospitalityTypes,
    positions,
    counterparties,
    setCounterparties,
  } = useMasterData();
  const [softErrors, setSoftErrors] = useState([]);
  const fetchCounterparties = useCallback(
    (keyword) => masterDataApi.searchCounterParties(keyword),
    []
  );
  const user = getCurrentUserFromToken();
  const isAdmin = isAdminFn(user);

  useEffect(() => {
    reset(initialValues);

    if (!isAdmin) setValue("departmentCode", user.departmentCode);
  }, [initialValues, isAdmin, open, reset, setValue, user.departmentCode]);

  const cleanDataForUpdate = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== null && v !== undefined && v !== ""
      )
    );
  };

  const submit = async (data, confirm = false) => {
    console.log("clicked submit");

    try {
      let res;
      if (isEditMode) {
        // update
        res = await hospitalityApi.update(
          initialValues.id,
          cleanDataForUpdate(data),
          confirm
        );

        console.log(res.data);
      } else {
        // create
        res = await hospitalityApi.create(data, confirm);
        console.log(res.data);
      }
      setSoftConfirmDialogOpen(false);
      onSave(res.data);
    } catch (err) {
      console.error(err);

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
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <RHFTextField
                name="receptionDate"
                //control={control}
                label={fieldLabels.receptionDate}
                type="date"
                sm={4}
                rules={{ required: "Reception date is required" }}
              />

              <RHFComboBox
                name="counterpartyId"
                //control={control}
                options={counterparties ?? []}
                setOptions={setCounterparties}
                label={fieldLabels.counterparty}
                fetchOptions={fetchCounterparties}
                sm={8}
                rules={{ required: "Counterparty is required" }}
              />

              <RHFSelect
                name="departmentCode"
                //control={control}
                getOptionValue={(opt) => opt.code ?? opt}
                label={fieldLabels.department}
                options={departments ?? []}
                isAdmin={isAdmin}
                rules={{ required: "Department is required" }}
              />

              <RHFTextField
                name="handlerName"
                //control={control}
                label={fieldLabels.handlerName}
              />

              <RHFSelect
                name="hospitalityTypeId"
                //control={control}
                label={fieldLabels.hospitalityType}
                options={hospitalityTypes ?? []}
                rules={{ required: "Hospitality type is required" }}
              />

              <RHFTextField
                name="location"
                //control={control}
                label={fieldLabels.location}
              />

              <RHFTextField
                name="invoiceDate"
                //control={control}
                label={fieldLabels.invoiceDate}
                type="date"
                sm={4}
              />

              <RHFTextField
                name="invoiceNumberString"
                //control={control}
                label={fieldLabels.invoiceNumberString}
                sm={8}
              />

              <RHFTextField
                name="invoiceAmount"
                //control={control}
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
                //control={control}
                label={fieldLabels.theirCount}
                type="number"
              />
              <RHFTextField
                name="ourCount"
                //control={control}
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
              <RHFSelect
                name="ourHostPositionId"
                //control={control}
                label={fieldLabels.ourHostPosition}
                options={positions ?? []}
                rules={{ required: "我方主持招待人员职务 is required" }}
              />

              <RHFSelect
                name="theirHostPositionId"
                //control={control}
                label={fieldLabels.theirHostPosition}
                options={positions ?? []}
                rules={{ required: "对方主持招待人员职务 is required" }}
              />

              <RHFTextField
                name="deptHeadApprovalDate"
                //control={control}
                label={fieldLabels.deptHeadApprovalDate}
                type="date"
              />
              <RHFTextField
                name="partySecretaryApprovalDate"
                //control={control}
                label={fieldLabels.partySecretaryApprovalDate}
                type="date"
              />
            </Grid>
            <HospitalityItemsFieldArray control={control} name="items" />
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>取消</Button>
            <Button
              variant="contained"
              onClick={handleSubmit((data) => submit(data))}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog maxWidth="md" open={softConfirmDialogOpen}>
          <DialogTitle>你确定要提交吗？？</DialogTitle>
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
              onClick={handleSubmit((data) => submit(data, true))}
            >
              确认提交
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </FormModeProvider>
  );
}
