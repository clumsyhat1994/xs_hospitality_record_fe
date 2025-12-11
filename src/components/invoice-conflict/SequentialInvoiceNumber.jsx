import {
  Table,
  Button,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import invoiceRunsApi from "../../api/invoiceRunsApi";
import moduleRoutes from "../../constants/moduleRoutes";

export default function SequentialInvoiceNumber() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0);
  };
  useEffect(() => {
    invoiceRunsApi
      .list(page, size)
      .then((res) => {
        console.log(res);
        setRows(res.data.content);
        setTotalElements(res.data.totalElements);
      })
      .catch(console.error);
  }, [page, size]);

  const handleGoToRecords = (row) => {
    const invoices = row.invoiceNumberStrings ?? [];
    if (!invoices.length) return;

    const from = invoices[0];
    const to = invoices[invoices.length - 1];

    const params = new URLSearchParams({
      invoiceNumberFrom: from,
      invoiceNumberTo: to,
    });

    // adjust path if your route is different
    navigate(`${moduleRoutes.HOSPITALITY_RECORDS}?${params.toString()}`);
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>发票号</TableCell>
            <TableCell>招待日期</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleGoToRecords(row)}
                >
                  查看明细
                </Button>
              </TableCell>
              <TableCell>{row.invoiceNumberStrings.join(", ")}</TableCell>

              <TableCell>{row.receptionDates.join(", ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={size}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </>
  );
}
