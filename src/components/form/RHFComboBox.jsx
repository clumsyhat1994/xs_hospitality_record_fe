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
  xs = 12,
  sm = 6,
  rules = {},
  ...rest
}) {
  const { control } = useFormContext();
  const { isEditMode } = useFormMode();
  //const [keyword, setKeyword] = useState("");

  // useEffect(() => {
  //   const handle = setTimeout(() => {
  //     fetchOptions(keyword).then((res) => {
  //       setOptions(res.data);
  //     });
  //   }, 150);

  //   return () => clearTimeout(handle);
  // }, [keyword, fetchOptions, setOptions]);

  return (
    <Controller
      name={name}
      control={control}
      rules={!isEditMode ? { required: "不能为空", ...rules } : rules}
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
          />
          // <Autocomplete
          //   options={options ?? []}
          //   filterOptions={(x) => x}
          //   getOptionLabel={getOptionLabel}
          //   isOptionEqualToValue={(opt, val) =>
          //     getOptionValue(opt) === getOptionValue(val)
          //   }
          //   value={
          //     options.find((o) => getOptionValue(o) === field.value) || null
          //   }
          //   onInputChange={(event, newInputValue) => {
          //     setKeyword(newInputValue);
          //   }}
          //   onChange={(_, newVal) => {
          //     field.onChange(newVal ? getOptionValue(newVal) : null);
          //   }}
          //   renderInput={(params) => (
          //     <TextField
          //       {...params}
          //       size="small"
          //       label={label}
          //       error={!!error}
          //       slotProps={{
          //         inputLabel: {
          //           shrink: true,
          //         },
          //       }}
          //       helperText={error?.message}
          //     />
          //   )}
          //   {...rest}
          // />
        );
      }}
    />
  );
}
