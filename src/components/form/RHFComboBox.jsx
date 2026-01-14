import { Controller, useFormContext } from "react-hook-form";
import { Autocomplete, TextField, Grid } from "@mui/material";
import { useFormMode } from "../../context/FormModeContext";
import { useState, useEffect } from "react";
import masterDataApi from "../../api/masterDataApi";
import BaseComboBox from "./BaseComboBox";
export default function RHFComboBox({
  name,
  label,
  getOptionLabel = (opt) => opt?.name ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt,
  options,
  setOptions,
  fetchOptions,
  isAdmin,
  xs = 12,
  sm = 6,
  rules = {},
  required = true,
  ...rest
}) {
  const { control } = useFormContext();
  const { isEditMode } = useFormMode();

  return (
    <Controller
      name={name}
      control={control}
      rules={
        required && !isEditMode ? { required: "不能为空", ...rules } : rules
      }
      render={({ field, fieldState: { error } }) => {
        return (
          <BaseComboBox
            {...rest}
            label={label}
            xs={xs}
            sm={sm}
            fieldValue={field.value}
            onChange={field.onChange}
            error={error}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            options={options}
            setOptions={setOptions}
            fetchOptions={fetchOptions}
            isAdmin={isAdmin}
          />
        );
      }}
    />
  );
}
