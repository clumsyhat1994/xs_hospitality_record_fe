import { useState, Fragment } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Table,
  TableHead,
  TableBody,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import fieldLabels from "../../constants/recordFieldLabels";

export default function ItemsTable({ items = [] }) {
  if (!items.length) {
    return (
      <Typography variant="body2" sx={{ p: 1 }}>
        没有领用物品~
      </Typography>
    );
  }

  return (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell>{fieldLabels.itemName}</TableCell>
          <TableCell align="right">{fieldLabels.quantity}</TableCell>
          <TableCell align="right">{fieldLabels.unitPrice}</TableCell>
          <TableCell align="right">{fieldLabels.lineTotal}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((it) => (
          <TableRow key={it.id ?? `${it.name}-${it.amount}-${it.qty}`}>
            <TableCell>{it.itemName}</TableCell>
            <TableCell align="right">{it.quantity}</TableCell>
            <TableCell align="right">{it.unitPrice}</TableCell>
            <TableCell align="right">{it.lineTotal}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
