import { useEffect } from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import { useWatch, useFormContext } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import RHFTableTextField from "../form/RHFTableTextField";

export default function ItemRow({ tableName, index, onRemove }) {
  const { setValue, control } = useFormContext();

  const row = useWatch({
    control,
    name: `${tableName}.${index}`,
  });

  useEffect(() => {
    const unit = Number(row?.unitPrice) || 0;
    const qty = Number(row?.quantity) || 0;
    const total = unit * qty;

    setValue(`${tableName}.${index}.lineTotal`, total || "", {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [row?.unitPrice, row?.quantity, tableName, index, setValue]);

  return (
    <TableRow>
      <RHFTableTextField
        name={`${tableName}.${index}.itemName`}
        control={control}
        label="物品名称"
      />

      <RHFTableTextField
        name={`${tableName}.${index}.unitPrice`}
        control={control}
        label="单价"
        type="number"
      />

      <RHFTableTextField
        name={`${tableName}.${index}.quantity`}
        control={control}
        label="数量"
        type="number"
      />

      <RHFTableTextField
        name={`${tableName}.${index}.lineTotal`}
        control={control}
        label="总价"
        type="number"
        readOnly
      />

      <TableCell align="center">
        <IconButton onClick={() => onRemove(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
