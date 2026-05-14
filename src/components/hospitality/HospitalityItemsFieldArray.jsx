import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Button,
} from "@mui/material";
import { useFieldArray, Controller } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ItemRow from "../form/ItemRow";
import { hospitalityRecordFieldLabels as fieldLabels } from "../../constants/recordFieldLabels";

export default function HospitalityItemsFieldArray({
  control,
  name = "items",
}) {
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  const handleAdd = () => {
    append({
      itemName: "",
      unitPrice: "",
      quantity: "",
      specification: "",
      lineTotal: "",
    });
  };
  return (
    <>
      <TableContainer sx={{ mt: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={5}>{fieldLabels.items}</TableCell>

              <TableCell align="center" sx={{ width: "65px" }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <ItemRow
                key={row.id}
                index={index}
                tableName={name}
                onRemove={remove}
              />
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  这里空空如也~
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        sx={{ mt: 1 }}
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        size="small"
      >
        增加物品
      </Button>
    </>
  );
}
