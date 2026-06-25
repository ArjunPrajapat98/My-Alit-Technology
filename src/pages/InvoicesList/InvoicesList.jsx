import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    Button,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TableSortLabel,
    Select,
    MenuItem,
    Menu,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import toast from "react-hot-toast";
import {
    getInvoiceList,
    getInvoiceMetrics,
    getInvoiceTrend12m,
    getInvoiceTopItems,
    deleteInvoice,
} from "../../_services/invoiceServices/invoiceServices";
import ConfirmDialog from "../../components/layout/ConfirmDialog";
import { formatMoney, formatNumber, formatDate, formatMonth, getDateRange } from "../../utils/format";
import { API, AppConfig } from "../../lib";

const darkBtnSx = { bgcolor: "#1b1d21", textTransform: "none", "&:hover": { bgcolor: "#0f1113" } };
const outlinedBtnSx = { textTransform: "none", color: "text.primary", borderColor: "#d7dade" };

const PERIODS = ["Today", "Week", "Month", "Year", "Custom"];
const PIE_COLORS = ["#1b1d21", "#3f4451", "#6b7280", "#9aa1ad", "#c2c7cf", "#e3e6eb"];

const COLUMNS = [
    { id: "invoiceNo", label: "Invoice No", bold: true },
    { id: "invoiceDate", label: "Date", render: (r) => formatDate(r.invoiceDate) },
    { id: "customerName", label: "Customer" },
    { id: "totalItems", label: "Items", render: (r) => r.totalItems ?? "-" },
    { id: "subTotal", label: "Sub Total", align: "right", render: (r) => formatMoney(r.subTotal) },
    { id: "taxPercentage", label: "Tax %", align: "right", render: (r) => Number(r.taxPercentage || 0).toFixed(2) },
    { id: "taxAmount", label: "Tax Amt", align: "right", render: (r) => formatMoney(r.taxAmount) },
    { id: "invoiceAmount", label: "Total", align: "right", bold: true, render: (r) => formatMoney(r.invoiceAmount) },
];

const asArray = (res) => (Array.isArray(res) ? res : res?.data ?? []);
const asObject = (res) => (res && !Array.isArray(res) ? res?.data ?? res : {});

function FieldLabel({ children, required }) {
    return (
        <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 14, fontWeight: 500 }}>
            {children}
            {required && <Box component="span" sx={{ color: "error.main" }}></Box>}
        </Typography>
    );
}

function StatCard({ value, label, sub }) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {sub}
            </Typography>
        </Paper>
    );
}

function ChartShell({ title, hasData, children }) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
            </Typography>
            <Box sx={{ height: 110 }}>
                {hasData ? (
                    children
                ) : (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            No data
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

const InvoicesList = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const period = params.get("range") || "Month";
    const customFrom = params.get("from") || "";
    const customTo = params.get("to") || "";
    const page = Number(params.get("page") || 1);

    const patchParams = (patch) => {
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(patch).forEach(([k, v]) => {
                if (v === undefined || v === null || v === "") next.delete(k);
                else next.set(k, String(v));
            });
            return next;
        });
    };

    const range = useMemo(() => {
        if (period === "Custom") return { from: customFrom, to: customTo };
        return getDateRange(period);
    }, [period, customFrom, customTo]);

    const [rows, setRows] = useState([]);
    const [metrics, setMetrics] = useState({ invoiceCount: 0, totalAmount: 0 });
    const [trend, setTrend] = useState([]);
    const [topItems, setTopItems] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("invoiceDate");
    const [order, setOrder] = useState("desc");
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [visibleCols, setVisibleCols] = useState(COLUMNS.map((c) => c.id));
    const [colAnchor, setColAnchor] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        getInvoiceTrend12m()
            .then((res) => setTrend(asArray(res)))
            .catch(() => { });
    }, []);

    const fetchRangeData = async () => {
        if (!range.from || !range.to) return;
        try {
            setLoading(true);
            setError("");
            const [listRes, metricRes, topRes] = await Promise.all([
                getInvoiceList(range),
                getInvoiceMetrics(range),
                getInvoiceTopItems(range),
            ]);
            setRows(asArray(listRes));
            const m = metricRes[0]; // asObject(metricRes);
            setMetrics({ invoiceCount: m.invoiceCount ?? 0, totalAmount: m.totalAmount ?? 0 });
            setTopItems(asArray(topRes));
        } catch (err) {
            setError("Couldn't refresh some data. Showing the last available values.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRangeData();
    }, [range.from, range.to]);

    const handleSort = (id) => {
        if (orderBy === id) setOrder((p) => (p === "asc" ? "desc" : "asc"));
        else {
            setOrderBy(id);
            setOrder("asc");
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = rows.filter(
            (r) =>
                String(r.invoiceNo ?? "").toLowerCase().includes(q) ||
                (r.customerName || "").toLowerCase().includes(q)
        );
        return [...list].sort((a, b) => {
            const x = a[orderBy];
            const y = b[orderBy];
            if (typeof x === "number" && typeof y === "number") return order === "asc" ? x - y : y - x;
            return order === "asc"
                ? String(x ?? "").localeCompare(String(y ?? ""))
                : String(y ?? "").localeCompare(String(x ?? ""));
        });
    }, [rows, search, orderBy, order]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(page, pageCount);
    const paged = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
    const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
    const rangeEnd = Math.min(safePage * rowsPerPage, filtered.length);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await deleteInvoice(deleteTarget.invoiceID);
            toast.success("Invoice deleted.");
            setDeleteTarget(null);
            fetchRangeData();
            setDeleting(false);
        } catch (error) {
            setDeleting(false);
        }
    };

    const handleExport = () => {
        const cols = COLUMNS.filter((c) => visibleCols.includes(c.id));
        const headers = cols.map((c) => c.label);
        const lines = filtered.map((r) =>
            cols
                .map((c) => {
                    const raw =
                        c.id === "invoiceDate"
                            ? formatDate(r.invoiceDate)
                            : r[c.id] ?? "";
                    const s = String(raw);
                    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                })
                .join(",")
        );
        const csv = [headers.join(","), ...lines].join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "invoices.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = async (id) => {
        // console.log('id', id) /invoice/
        try {
            const response = await fetch(`${AppConfig.api_baseurl}${API.DOWNLOAD_PRINT_INVOICE}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const blob = await response.blob();
            const blobURL = URL.createObjectURL(blob);

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobURL;

            iframe.onload = function () {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                }, 300);
            };

            document.body.appendChild(iframe);
        } catch (error) {
            console.error('Print download failed:', error);
        }
    };

    const toggleCol = (id) =>
        setVisibleCols((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

    const shownColumns = COLUMNS.filter((c) => visibleCols.includes(c.id));
    const colSpan = shownColumns.length + 1; // + actions

    const topTotal = topItems.reduce((s, i) => s + (Number(i.amountSum) || 0), 0);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#fff", minHeight: "100vh" }}>

            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: 2,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Invoices
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <ToggleButtonGroup
                        exclusive
                        value={period}
                        onChange={(_, val) => val && patchParams({ range: val, page: 1, from: undefined, to: undefined })}
                        sx={{
                            "& .MuiToggleButton-root": {
                                border: "1px solid #e3e6eb",
                                borderRadius: "999px !important",
                                px: 2,
                                py: 0.5,
                                mx: 0.5,
                                textTransform: "none",
                                color: "text.secondary",
                            },
                            "& .Mui-selected": { bgcolor: "#1b1d21 !important", color: "#fff !important" },
                        }}
                    >
                        {PERIODS.map((p) => (
                            <ToggleButton key={p} value={p}>
                                {p}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
            </Box>

            {
                period === "Custom" && (
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <FieldLabel required> From </FieldLabel>
                        <TextField
                            size="small"
                            type="date"
                            // label="From"
                            InputLabelProps={{ shrink: true }}
                            value={customFrom}
                            onChange={(e) => patchParams({ from: e.target.value, page: 1 })}
                        />
                        <FieldLabel required> To </FieldLabel>
                        <TextField
                            size="small"
                            type="date"
                            // label="To"
                            InputLabelProps={{ shrink: true }}
                            value={customTo}
                            onChange={(e) => patchParams({ to: e.target.value, page: 1 })}
                        />
                    </Stack>
                )
            }

            {
                error && (
                    <Alert severity="warning" sx={{ mt: 2 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Box
                sx={{
                    mt: 3,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
                    gap: 2,
                }}
            >
                <StatCard value={formatNumber(metrics.invoiceCount).split(".")[0]} label="Number of Invoices" sub={period} />
                <StatCard value={formatMoney(metrics.totalAmount)} label="Total Invoice Amount" sub={period} />

                <ChartShell title="Last 12 Months" hasData={trend.length > 0}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                            <XAxis dataKey="monthStart" tickFormatter={formatMonth} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                formatter={(value, name) =>
                                    name === "amountSum" ? [formatMoney(value), "Amount"] : [value, "Count"]
                                }
                                labelFormatter={formatMonth}
                            />
                            <Line type="monotone" dataKey="amountSum" stroke="#1b1d21" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartShell>

                <ChartShell title="Top 5 Items" hasData={topItems.length > 0}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={topItems} dataKey="amountSum" nameKey="itemName" outerRadius={50} innerRadius={26}>
                                {topItems.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [
                                    `${formatMoney(value)} (${topTotal ? ((value / topTotal) * 100).toFixed(1) : 0}%)`,
                                    name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartShell>
            </Box>

            <Box
                sx={{
                    mt: 7,
                    mb: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: 2,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search Invoice No, Customer..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            patchParams({ page: 1 });
                        }}
                        sx={{ width: { xs: "100%", sm: 320 }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" disableElevation startIcon={<AddIcon />} sx={darkBtnSx} onClick={() => navigate("/invoice/editor")}>
                        New Invoice
                    </Button>
                    <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={outlinedBtnSx} onClick={handleExport}>
                        Export
                    </Button>
                    <Button variant="outlined" startIcon={<ViewColumnOutlinedIcon />} sx={outlinedBtnSx} onClick={(e) => setColAnchor(e.currentTarget)}>
                        Columns
                    </Button>
                    <Menu anchorEl={colAnchor} open={Boolean(colAnchor)} onClose={() => setColAnchor(null)}>
                        {COLUMNS.map((col) => (
                            <MenuItem key={col.id} dense onClick={() => toggleCol(col.id)}>
                                <FormControlLabel
                                    sx={{ m: 0 }}
                                    control={<Checkbox size="small" checked={visibleCols.includes(col.id)} />}
                                    label={col.label}
                                />
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ "& th": { color: "text.secondary", fontWeight: 600 } }}>
                            {shownColumns.map((col) => (
                                <TableCell key={col.id} align={col.align}>
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={orderBy === col.id ? order : "asc"}
                                        onClick={() => handleSort(col.id)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : paged.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paged.map((inv) => (
                                <TableRow key={inv.invoiceID} hover>
                                    {shownColumns.map((col) => (
                                        <TableCell key={col.id} align={col.align} sx={col.bold ? { fontWeight: 700 } : undefined}>
                                            {col.render ? col.render(inv) : inv[col.id]}
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton size="small" onClick={() => navigate(`/invoice/editor?invoiceID=${inv.invoiceID}`)}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handlePrint(inv.invoiceID)}>
                                                <PrintOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(inv)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    mt: 2,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Rows per page:
                    </Typography>
                    <Select
                        size="small"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(e.target.value);
                            patchParams({ page: 1 });
                        }}
                        sx={{ "& .MuiOutlinedInput-input": { py: 0.5 } }}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {rangeStart}-{rangeEnd} of {filtered.length}
                    </Typography>
                    <IconButton size="small" disabled={safePage <= 1} onClick={() => patchParams({ page: safePage - 1 })}>
                        <KeyboardArrowLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" disabled={safePage >= pageCount} onClick={() => patchParams({ page: safePage + 1 })}>
                        <KeyboardArrowRightIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <ConfirmDialog
                open={deleteTarget}
                title="Delete invoice"
                message={`Are you sure to delete this invoice ${deleteTarget?.invoiceNo ?? ""} ? `}
                loading={deleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteTarget(null)}
            />
        </Box >
    );
};

export default InvoicesList;