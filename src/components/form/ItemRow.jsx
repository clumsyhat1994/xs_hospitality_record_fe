import { useEffect } from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import { useWatch, useFormContext } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import RHFCellTextField from "../form/RHFCellTextField";
import { hospitalityRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

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
      <TableCell sx={{ pt: 2, pb: 1, px: 1 }}>
        <RHFCellTextField
          name={`${tableName}.${index}.itemName`}
          control={control}
          label={fieldLabels.itemName}
        />
      </TableCell>

      <TableCell sx={{ pt: 2, pb: 1, px: 1 }}>
        <RHFCellTextField
          name={`${tableName}.${index}.unitPrice`}
          control={control}
          label={fieldLabels.itemUnitPrice}
          type="number"
        />
      </TableCell>

      <TableCell sx={{ pt: 2, pb: 1, px: 1 }}>
        <RHFCellTextField
          name={`${tableName}.${index}.quantity`}
          control={control}
          label={fieldLabels.itemQuantity}
          type="number"
        />
      </TableCell>
      <TableCell sx={{ pt: 2, pb: 1, px: 1 }}>
        <RHFCellTextField
          name={`${tableName}.${index}.specification`}
          control={control}
          label={fieldLabels.itemSpecification}
        />
      </TableCell>
      <TableCell sx={{ pt: 2, pb: 1, px: 1 }}>
        <RHFCellTextField
          name={`${tableName}.${index}.lineTotal`}
          control={control}
          label={fieldLabels.itemLineTotal}
          type="number"
          readOnly
        />
      </TableCell>

      <TableCell align="center">
        <IconButton onClick={() => onRemove(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
