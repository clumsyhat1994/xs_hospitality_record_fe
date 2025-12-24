import {
  Table,
  Button,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import invoiceRunsApi from "../../api/invoiceRunsApi";
import moduleRoutes from "../../constants/moduleRoutes";

export default function SequentialInvoiceNumber() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const reqIdRef = useRef(0);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0);
  };

  const load = useCallback(
    async (p = page, s = size) => {
      const reqId = ++reqIdRef.current;
      setLoading(true);
      try {
        const res = await invoiceRunsApi.list(p, s);
        if (reqId !== reqIdRef.current) return;
        setRows(res.data.content ?? []);
        setTotalElements(res.data.totalElements ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    load();
    // invoiceRunsApi
    //   .list(page, size)
    //   .then((res) => {
    //     console.log(res);
    //     setRows(res.data.content);
    //     setTotalElements(res.data.totalElements);
    //   })
    //   .catch(console.error);
  }, [load]);

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

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await invoiceRunsApi.refresh();
      setPage(0);
      await load(0, size);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-start"
        sx={{ margin: 2 }}
        spacing={1}
      >
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          startIcon={refreshing ? <CircularProgress size={16} /> : null}
        >
          {refreshing ? "刷新中…" : "刷新记录"}
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>操作</TableCell>
            <TableCell>发票号</TableCell>
            <TableCell>招待日期</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            return (
              <TableRow key={row.startNumber}>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleGoToRecords(row)}
                    disabled={loading || refreshing}
                  >
                    查看明细
                  </Button>
                </TableCell>
                <TableCell>{row.invoiceNumberStrings.join(", ")}</TableCell>

                <TableCell>{row.receptionDates.join(", ")}</TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="left">
                没有任何连号发票，奖励一碗丝瓜汤吧~
              </TableCell>
            </TableRow>
          )}
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
        disabled={loading || refreshing}
      />
    </>
  );
}
