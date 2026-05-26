import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFieldArray } from "react-hook-form";
import RHFCellTextField from "../form/RHFCellTextField";
import { purchaseRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

const emptyLine = {
  id: null,
  productName: "",
  specification: "",
  unitPrice: null,
  purchasedQuantity: null,
};

export default function PurchaseLinesFieldArray() {
  const { fields, append, remove } = useFieldArray({ name: "lines" });

  return (
    <>
      <TableContainer sx={{ mt: 1 }}>
        <Table size="small">
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell sx={{ width: 48, color: "text.secondary" }}>{index + 1}</TableCell>
                <TableCell>
                  <RHFCellTextField
                    name={`lines.${index}.productName`}
                    label={fieldLabels.productName}
                    rules={{ required: "请输入物品名称" }}
                  />
                </TableCell>
                <TableCell>
                  <RHFCellTextField
                    name={`lines.${index}.specification`}
                    label={fieldLabels.specification}
                    rules={{ required: "请输入规格" }}
                  />
                </TableCell>
                <TableCell>
                  <RHFCellTextField
                    name={`lines.${index}.unitPrice`}
                    label={fieldLabels.unitPrice}
                    type="number"
                    rules={{ required: "请输入单价" }}
                  />
                </TableCell>
                <TableCell>
                  <RHFCellTextField
                    name={`lines.${index}.purchasedQuantity`}
                    label={fieldLabels.purchasedQuantity}
                    type="number"
                    rules={{ required: "请输入数量" }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ width: 56 }}>
                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label="删除明细行"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        sx={{ mt: 1 }}
        size="small"
        variant="outlined"
        onClick={() => append({ ...emptyLine })}
        startIcon={<AddIcon />}
      >
        添加明细行
      </Button>
    </>
  );
}
