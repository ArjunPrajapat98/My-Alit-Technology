import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Divider,
    TextField,
    InputAdornment,
    Button,
    IconButton,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    TableContainer,
    Select,
    MenuItem,
    Pagination,
    Tooltip,
    Menu,
    FormControlLabel,
    Checkbox,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from '@mui/icons-material/Delete';
import toast from "react-hot-toast";
import { getItemsList, deleteItem } from "../../_services/itemsServices";
import CreateItemModal from "../../components/layout/CreateItemModal";
import ConfirmDialog from "../../components/layout/ConfirmDialog";
import ImagePreview from "./ImagePreview";
import { getThumbnilImage } from "../../_services/commonServices/commonServices";
import { useNavigate } from "react-router-dom";

const darkBtnSx = {
    bgcolor: "#2b2f36",
    textTransform: "none",
    "&:hover": { bgcolor: "#1f2329" },
};

// columns map directly to the API field names (everything except picture is sortable)
const COLUMNS = [
    { id: "itemName", label: "Item Name" },
    { id: "description", label: "Description" },
    { id: "salesRate", label: "Sale Rate", align: "right", numeric: true },
    { id: "discountPct", label: "Discount %", align: "right", numeric: true },
];

const numberFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const formatRate = (v) => numberFmt.format(Number(v) || 0); // 12,2 + thousand sep
const formatPct = (v) => `${numberFmt.format(Number(v) || 0)}%`;

const csvCell = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("itemName");
    const [order, setOrder] = useState("asc");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const [openItemModal, setOpenItemModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [colAnchor, setColAnchor] = useState(null);
    const [visibleCols, setVisibleCols] = useState(COLUMNS.map((c) => c.id));

    const [imagePreview, setImagePreview] = useState(null);

    const loadItems = async () => {
        try {
            setLoading(true);
            const res = await getItemsList();
            // backend may return a plain array or wrap it in { data: [...] }
            const list = Array.isArray(res) ? res : res?.data ?? [];
            setItems(list);
        } catch (err) {
            // common errors already toasted by the axios interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleSort = (id) => {
        if (orderBy === id) {
            setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setOrderBy(id);
            setOrder("asc");
        }
    };

    // search (client-side) + sort
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = items.filter(
            (it) =>
                (it.itemName || "").toLowerCase().includes(q) ||
                (it.description || "").toLowerCase().includes(q)
        );

        return [...list].sort((a, b) => {
            const x = a[orderBy];
            const y = b[orderBy];
            if (typeof x === "number" && typeof y === "number") {
                return order === "asc" ? x - y : y - x;
            }
            return order === "asc"
                ? String(x ?? "").localeCompare(String(y ?? ""))
                : String(y ?? "").localeCompare(String(x ?? ""));
        });
    }, [items, search, order, orderBy]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(page, pageCount);
    const paged = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

    const handleAdd = () => {
        setSelectedItem(null);
        setOpenItemModal(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setOpenItemModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteItem(deleteTarget.itemID);
            toast.success("Item deleted.");
            setItems((prev) => prev.filter((it) => it.itemID !== deleteTarget.itemID));
            setDeleteTarget(null);
        } catch (err) {
            // interceptor toasts 404/401 etc.
        } finally {
            setDeleting(false);
        }
    };

    const handleExport = () => {
        const headers = ["Item Name", "Description", "Sale Rate", "Discount %"];
        const lines = filtered.map((r) =>
            [r.itemName, r.description ?? "", r.salesRate, r.discountPct].map(csvCell).join(",")
        );
        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "items.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleCol = (id) => {
        setVisibleCols((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const shownColumns = COLUMNS.filter((c) => visibleCols.includes(c.id));
    const colSpan = shownColumns.length + 2; // picture + actions

    const getThumbnil = async (id) => {
        try {
            const res = await getThumbnilImage(id);
            if (res) {
                setImagePreview(res);
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <Box sx={{ p: { xs: 2, md: 2 }, bgcolor: "#fff", minHeight: "100vh" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
                        Items
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button onClick={() => navigate("/dashboard")} sx={{ textTransform: "none", color: "text.secondary" }}>
                            Go to dashboard
                        </Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* toolbar */}
                <Box
                    sx={{
                        mb: 3,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: 2,
                    }}
                >
                    {/* left side — search */}
                    <Box sx={{ flexGrow: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            sx={{ width: { xs: "100%", sm: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* right side — actions */}
                    <Stack direction="row" spacing={1.5}>
                        <Button onClick={handleAdd} variant="contained" disableElevation startIcon={<AddIcon />} sx={darkBtnSx}>
                            Add New Item
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleExport}
                            startIcon={<FileDownloadOutlinedIcon />}
                            sx={{ textTransform: "none", color: "text.primary", borderColor: "#d7dade" }}
                        >
                            Export
                        </Button>
                        <IconButton
                            onClick={(e) => setColAnchor(e.currentTarget)}
                            sx={{ border: "1px solid #d7dade", borderRadius: 1.5 }}
                        >
                            <ViewColumnOutlinedIcon fontSize="small" />
                        </IconButton>
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

                {/* table */}
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ "& th": { bgcolor: "#fafafa", fontWeight: 600, color: "text.secondary" } }}>
                                <TableCell>Picture</TableCell>
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
                                        No items found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paged.map((item) => (
                                    <TableRow key={item.itemID} hover>
                                        <TableCell onClick={(e) => getThumbnil(item.itemID)} sx={{ color: "success.main", cursor: "pointer" }} >
                                            Preview
                                        </TableCell>

                                        {visibleCols.includes("itemName") && (
                                            <TableCell sx={{ fontWeight: 600 }}>{item.itemName}</TableCell>
                                        )}

                                        {visibleCols.includes("description") && (
                                            <TableCell sx={{ color: "text.secondary", maxWidth: 280 }}>
                                                <Tooltip title={item.description || ""} placement="top" arrow>
                                                    <Box
                                                        sx={{
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: 280,
                                                        }}
                                                    >
                                                        {item.description}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                        )}

                                        {visibleCols.includes("salesRate") && (
                                            <TableCell align="right">{formatRate(item.salesRate)}</TableCell>
                                        )}

                                        {visibleCols.includes("discountPct") && (
                                            <TableCell align="right">{formatPct(item.discountPct)}</TableCell>
                                        )}

                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton size="small" onClick={() => handleEdit(item)}>
                                                    <EditOutlinedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                                                    <DeleteIcon /> {/* <DeleteOutlineIcon fontSize="small" /> */}
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* footer */}
                <Box
                    sx={{
                        mt: 2,
                        mb: 3,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
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
                                setPage(1);
                            }}
                            sx={{ "& .MuiOutlinedInput-input": { py: 0.5 } }}
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </Stack>

                    <Pagination
                        count={pageCount}
                        page={safePage}
                        onChange={(_, value) => setPage(value)}
                        shape="rounded"
                        sx={{ "& .Mui-selected": { bgcolor: "#1f2937 !important", color: "#fff" } }}
                    />
                </Box>
            </Box>

            <CreateItemModal
                open={openItemModal}
                item={selectedItem}
                onClose={() => setOpenItemModal(false)}
                onSaved={loadItems}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete item"
                message={`Are you sure to delete this ${deleteTarget?.itemName} ?`}
                loading={deleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteTarget(null)}
            />

            <ImagePreview
                isOpen={imagePreview}
                onClose={() => setImagePreview(null)}
            />
        </>
    );
};

export default ItemList;