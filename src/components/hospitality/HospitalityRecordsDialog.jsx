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
import fieldLabels from "../../constants/recordFieldLabels";
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
import { useAuth } from "../../context/AuthProvider";
import RHFTextareaField from "../form/RHFTextareaField";
//import masterDataFetchers from "../../api/masterDataFetchers";

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
  } = methods;
  const [softConfirmDialogOpen, setSoftConfirmDialogOpen] = useState(false);
  const {
    departments,
    setDepartments,
    hospitalityTypes,
    setHospitalityTypes,
    ourHostPositions,
    setOurHostPositions,
    theirHostPositions,
    setTheirHostPositions,
    counterparties,
    setCounterparties,
  } = useMasterData();
  // console.log(departments);
  // console.log(hospitalityTypes);
  // console.log(ourHostPositions);
  // console.log(counterparties);
  const [softErrors, setSoftErrors] = useState([]);
  // const fetchCounterparties = useCallback(
  //   (keyword) => masterDataApi.searchCounterParties(keyword),
  //   []
  // );
  //const user = getCurrentUserFromToken();
  //const isAdmin = isAdminFn(user);
  const { departmentCode, isAdmin, user } = useAuth();

  useEffect(() => {
    if (!open) return;
    reset(initialValues);
    if (!isAdmin) setValue("departmentCode", departmentCode);
  }, [initialValues, isAdmin, open, reset, setValue, departmentCode]);

  const cleanData = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== null && v !== undefined && v !== ""
      )
    );
    //return data;
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
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
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

              <RHFComboBox
                name="departmentCode"
                getOptionValue={(opt) => opt.code ?? opt}
                options={departments ?? []}
                setOptions={setDepartments}
                label={fieldLabels.department}
                fetchOptions={masterDataApi.searchDepartments}
                isAdmin={isAdmin}
              />

              {/* <RHFSelect
                name="departmentCode"
                //control={control}
                getOptionValue={(opt) => opt.code ?? opt}
                label={fieldLabels.department}
                options={departments ?? []}
                isAdmin={isAdmin}
              /> */}

              <RHFTextField
                name="handlerName"
                //control={control}
                label={fieldLabels.handlerName}
              />

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
