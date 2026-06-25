import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormHelperText,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import toast from "react-hot-toast";
import { getItemLookupList } from "../../_services/itemsServices";
import { getInvoiceList, getSingleInvoiceDetails, saveInvoice } from "../../_services/invoiceServices/invoiceServices";
import { formatMoney, round2, todayISO } from "../../utils/format";

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
const darkBtnSx = { bgcolor: "#1b1d21", textTransform: "none", px: 3, "&:hover": { bgcolor: "#0f1113" } };
const lineBtnSx = { textTransform: "none", color: "text.primary", borderColor: "#d7dade" };

function FieldLabel({ children, required }) {
  return (
    <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 14, fontWeight: 500 }}>
      {children}
      {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
    </Typography>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

const emptyLine = () => ({
  key: crypto.randomUUID(),
  itemID: "",
  description: "",
  quantity: "",
  rate: "",
  discountPct: "",
});

// Amount = quantity × Rate − (quantity × Rate × discountPct%/100)
const lineAmount = (line) => {
  const quantity = Number(line.quantity) || 0;
  const rate = Number(line.rate) || 0;
  const discountPct = Number(line.discountPct) || 0;
  return round2(quantity * rate * (1 - discountPct / 100));
};

const InvoiceEditor = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invoiceID = params.get("invoiceID");
  const isEdit = Boolean(invoiceID);

  const [formValue, setFormValue] = useState({
    invoiceNo: "",
    invoiceDate: todayISO(),
    customerName: "",
    address: "",
    city: "",
    notes: "",
  });
  const [lines, setLines] = useState([emptyLine()]);
  const [taxPct, setTaxPct] = useState("");
  const [taxAmt, setTaxAmt] = useState(0);
  const [zeroTaxHint, setZeroTaxHint] = useState(false);
  const [updatedOn, setUpdatedOn] = useState(null); // concurrency stamp on edit

  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({ formValue: {}, lines: {}, general: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // item lookup for the dropdown
  useEffect(() => {
    getItemLookupList()
      .then((res) => setItems(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => { });
  }, []);

  // load invoice when editing

  const getSingleInvoice = async (id) => {
    try {
      const res = await getSingleInvoiceDetails(id);
      if (res?.invoiceID) {
        console.log('res', res)
        setFormValue((s) => ({
          invoiceNo: res.invoiceNo ?? "",
          invoiceDate: (res.invoiceDate || todayISO()).slice(0, 10),
          customerName: res.customerName ?? "",
          address: res.address ?? "",
          city: res.city ?? "",
          notes: res.notes ?? "",
        }))
        const loadedLines = (res.lines || []).map((l) => ({
          key: crypto.randomUUID(),
          itemID: l.itemID ?? "",
          description: l.description ?? "",
          quantity: l.quantity ?? l.quantity ?? "",
          rate: l.rate ?? "",
          discountPct: l.discountPct ?? l.discountPct ?? "",
        }));
        setLines(loadedLines.length ? loadedLines : [emptyLine()]);
        setTaxPct(res.taxPercentage ?? "");
        setUpdatedOn(res.updatedOn ?? null);
      }
    } catch (error) {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (invoiceID) {
      getSingleInvoice(invoiceID);
    }
  }, [invoiceID]);

  const subTotal = useMemo(() => round2(lines.reduce((s, l) => s + lineAmount(l), 0)), [lines]);

  // tax % is canonical: when lines (subtotal) change, recompute the amount from %
  useEffect(() => {
    setTaxAmt(round2((subTotal * (Number(taxPct) || 0)) / 100));
  }, [subTotal, taxPct]);

  const invoiceAmount = round2(subTotal + (Number(taxAmt) || 0));

  const handleOnChange = (name, value) => setFormValue((h) => ({ ...h, [name]: value }));

  const updateLine = (key, field, value) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)));

  const onPickItem = (key, itemID) => {
    const picked = items.find((o) => o.itemID === itemID);
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? {
            ...l,
            itemID,
            // prefill from item, but keep editable. lookup may not carry description.
            rate: picked?.saleRate ?? picked?.rate ?? l.rate,
            discountPct: picked?.discountPct ?? picked?.discountPct ?? l.discountPct,
            description: l.description || picked?.description || "",
            quantity: l.quantity || 1,
          }
          : l
      )
    );
  };

  const addRow = () => setLines((prev) => [...prev, emptyLine()]);

  const copyRow = () =>
    setLines((prev) => (prev.length ? [...prev, { ...prev[prev.length - 1], key: crypto.randomUUID() }] : prev));

  const deleteRow = (key) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  // tax handlers (two-way link)
  const onTaxPctChange = (value) => {
    setZeroTaxHint(false);
    setTaxPct(value);
    // amount recomputes via the effect above
  };

  const onTaxAmtChange = (value) => {
    const amt = Number(value) || 0;
    setTaxAmt(value === "" ? "" : amt);
    if (subTotal > 0) {
      setTaxPct(round2((amt * 100) / subTotal));
      setZeroTaxHint(false);
    } else {
      setTaxPct(0);
      setZeroTaxHint(true);
    }
  };

  const validate = () => {
    const next = { formValue: {}, lines: {}, general: "" };

    if (!formValue.customerName.trim()) next.formValue.customerName = "Enter name.";
    if (!formValue.invoiceDate) next.formValue.invoiceDate = "Pick a date.";
    if ((formValue.notes || "").length > 500) next.formValue.notes = "Max 500 characters.";

    const pct = Number(taxPct) || 0;
    if (pct < 0 || pct > 100) next.formValue.tax = "Tax % 0–100.";
    if ((Number(taxAmt) || 0) < 0) next.formValue.tax = "Tax amt must be ≥ 0.";

    let hasValidLine = false;
    lines.forEach((l) => {
      const e = {};
      if (!l.itemID) e.item = "Pick an item.";
      const quantity = Number(l.quantity) || 0;
      const rate = Number(l.rate) || 0;
      const discountPct = Number(l.discountPct) || 0;
      if (quantity < 0) e.quantity = "quantity ≥ 0.";
      if (rate < 0) e.rate = "Rate ≥ 0.";
      if (discountPct < 0 || discountPct > 100) e.discountPct = "0–100.";
      if (quantity > 0) hasValidLine = true;
      if (Object.keys(e).length) next.lines[l.key] = e;
    });

    if (!hasValidLine) next.general = "Add at least one line with quantity > 0.";

    setErrors(next);
    const ok =
      Object.keys(next.formValue).length === 0 &&
      Object.keys(next.lines).length === 0 &&
      !next.general;
    if (!ok && next.general) toast.error(next.general);
    return ok;
  };

  const handleSave = useCallback(async () => {
    if (saving) return; // no double submit
    if (!validate()) return;

    const payload = {
      invoiceID: isEdit ? Number(invoiceID) : 0,
      invoiceNo: formValue.invoiceNo === "" ? null : Number(formValue.invoiceNo), // null => auto next
      invoiceDate: formValue.invoiceDate,
      customerName: formValue.customerName.trim(),
      address: (formValue.address || "").trim(),
      city: (formValue.city || "").trim(),
      taxPercentage: Number(taxPct) || 0,
      notes: (formValue.notes || "").trim(),
      updatedOnPrev: isEdit ? updatedOn : null,
      lines: lines.map((l, idx) => ({
        rowNo: idx + 1,
        itemID: Number(l.itemID),
        description: (l.description || "").trim(),
        quantity: Number(l.quantity) || 0,
        rate: Number(l.rate) || 0,
        discountPct: Number(l.discountPct) || 0,
      })),
    };

    try {
      setSaving(true);
      const response = await saveInvoice(payload);
      if (response?.primaryKeyID) {
        toast.success(isEdit ? "Invoice updated successfully" : "Invoice created successfully");
        navigate("/invoice");
      }
    } catch (err) {
      setSaving(false);
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, isEdit, invoiceID, formValue, taxPct, updatedOn, lines]);

  // keyboard: Ctrl+Enter save, Alt+N add line
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        addRow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const numCellProps = (val, onChange, error) => ({
    fullWidth: true,
    size: "small",
    placeholder: "0.00",
    value: val,
    onChange: (e) => onChange(e.target.value),
    error: Boolean(error),
    helperText: error || "",
    inputProps: { inputMode: "decimal", style: { textAlign: "right" } },
    sx: fieldSx,
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f7f8fa", minHeight: "100vh" }}>
      {/* formValue bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
          {isEdit ? "Edit Invoice" : "New Invoice"}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button onClick={() => navigate("/invoice")} sx={{ textTransform: "none", color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            sx={darkBtnSx}
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save
          </Button>
        </Stack>
      </Stack>



      {/* invoice details */}
      <SectionCard title="Invoice Details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <FieldLabel>Invoice No</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Auto"
              value={formValue.invoiceNo}
              onChange={(e) => handleOnChange("invoiceNo", e.target.value.replace(/[^\d]/g, ""))}
              helperText="Auto next available number"
              sx={fieldSx}
            />
          </Box>
          <Box>
            <FieldLabel required>Invoice Date</FieldLabel>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={formValue.invoiceDate}
              onChange={(e) => handleOnChange("invoiceDate", e.target.value)}
              error={Boolean(errors.formValue.invoiceDate)}
              helperText={errors.formValue.invoiceDate || ""}
              sx={fieldSx}
            />
          </Box>

          <Box>
            <FieldLabel required>Customer Name</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter customer name"
              value={formValue.customerName}
              onChange={(e) => handleOnChange("customerName", e.target.value)}
              error={Boolean(errors.formValue.customerName)}
              helperText={errors.formValue.customerName || ""}
              inputProps={{ maxLength: 50 }}
              sx={fieldSx}
            />
          </Box>
          <Box>
            <FieldLabel>City</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter city"
              value={formValue.city}
              onChange={(e) => handleOnChange("city", e.target.value)}
              inputProps={{ maxLength: 50 }}
              sx={fieldSx}
            />
          </Box>

          <Box>
            <FieldLabel>Address</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter address"
              value={formValue.address}
              onChange={(e) => handleOnChange("address", e.target.value.slice(0, 500))}
              sx={fieldSx}
            />
          </Box>
          <Box>
            <FieldLabel>Notes</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Additional notes"
              value={formValue.notes}
              onChange={(e) => handleOnChange("notes", e.target.value.slice(0, 500))}
              error={Boolean(errors.formValue.notes)}
              helperText={errors.formValue.notes || ""}
              sx={fieldSx}
            />
          </Box>
        </Box>
      </SectionCard>

      {/* line items */}
      <SectionCard
        title="Line Items"
        action={
          <Stack direction="row" spacing={1} sx={{ ml: 4 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addRow} sx={lineBtnSx}>
              Add Row
            </Button>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyRow} sx={lineBtnSx}>
              Copy
            </Button>
          </Stack>
        }
      >
        {errors.general && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {errors.general}
          </Typography>
        )}

        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { color: "text.secondary", fontWeight: 600, borderBottom: "none" } }}>
              <TableCell width={48}>S.No</TableCell>
              <TableCell width={190}>Item *</TableCell>
              <TableCell>Description</TableCell>
              <TableCell width={90} align="right"> Qty * </TableCell>
              <TableCell width={110} align="right"> Rate * </TableCell>
              <TableCell width={90} align="right"> Discount % </TableCell>
              <TableCell width={120} align="right"> Amount </TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((row, index) => {
              const e = errors.lines[row.key] || {};
              return (
                <TableRow key={row.key} sx={{ verticalAlign: "top" }}>
                  <TableCell sx={{ pt: 2 }}>{index + 1}</TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      size="small"
                      displayEmpty
                      value={row.itemID}
                      onChange={(ev) => onPickItem(row.key, ev.target.value)}
                      error={Boolean(e.item)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="" disabled>
                        Select item...
                      </MenuItem>
                      {items.map((o) => (
                        <MenuItem key={o.itemID} value={o.itemID}>
                          {o.itemName}
                        </MenuItem>
                      ))}
                    </Select>
                    {e.item && <FormHelperText error>{e.item}</FormHelperText>}
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Description"
                      value={row.description}
                      onChange={(ev) => updateLine(row.key, "description", ev.target.value.slice(0, 500))}
                      sx={fieldSx}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField {...numCellProps(row.quantity, (v) => updateLine(row.key, "quantity", v), e.quantity)} />
                  </TableCell>
                  <TableCell>
                    <TextField {...numCellProps(row.rate, (v) => updateLine(row.key, "rate", v), e.rate)} />
                  </TableCell>
                  <TableCell>
                    <TextField {...numCellProps(row.discountPct, (v) => updateLine(row.key, "discountPct", v), e.discountPct)} />
                  </TableCell>
                  <TableCell align="right" sx={{ pt: 2, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatMoney(lineAmount(row))}
                  </TableCell>
                  <TableCell sx={{ pt: 1 }}>
                    <IconButton size="small" color="error" onClick={() => deleteRow(row.key)} disabled={lines.length === 1}>
                      Delete {/* <DeleteOutlineIcon fontSize="small" /> */}
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* <Box sx={{ bgcolor: "#f5f6f8", borderRadius: 1.5, mt: 1.5, px: 2, py: 1.25 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={4}>
            <Typography variant="body2" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatMoney(subTotal)}
            </Typography>
          </Stack>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 4,
            bgcolor: "#f5f6f8",
            borderRadius: 1.5,
            mt: 1.5,
            px: 2,
            py: 1.25
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Subtotal:
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatMoney(subTotal)}
          </Typography>
        </Box>
      </SectionCard>

      {/* totals */}
      {/* <SectionCard title="Invoice Totals">
        <Stack spacing={2} sx={{ maxWidth: 460, ml: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Sub Total
            </Typography>
            <Box sx={{ bgcolor: "#f5f6f8", borderRadius: 1.5, px: 2, py: 1, minWidth: 150, textAlign: "right" }}>
              {formatMoney(subTotal)}
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
              Tax
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Tooltip title="Tax % = Tax Amount × 100 / Sub Total">
                <TextField
                  size="small"
                  placeholder="0.00 %"
                  value={taxPct}
                  onChange={(e) => onTaxPctChange(e.target.value)}
                  error={Boolean(errors.formValue.tax)}
                  inputProps={{ inputMode: "decimal", style: { textAlign: "right" }, "aria-label": "Tax percentage" }}
                  sx={{ width: 110, ...fieldSx }}
                />
              </Tooltip>
              <Tooltip title="Tax Amount = Sub Total × Tax % / 100">
                <TextField
                  size="small"
                  placeholder="0.00"
                  value={taxAmt}
                  onChange={(e) => onTaxAmtChange(e.target.value)}
                  error={Boolean(errors.formValue.tax)}
                  inputProps={{ inputMode: "decimal", style: { textAlign: "right" }, "aria-label": "Tax amount" }}
                  sx={{ width: 130, ...fieldSx }}
                />
              </Tooltip>
            </Stack>
          </Stack>
          {(errors.formValue.tax || zeroTaxHint) && (
            <Typography variant="caption" color={errors.formValue.tax ? "error" : "text.secondary"} sx={{ textAlign: "right" }}>
              {errors.formValue.tax || "No tax on zero."}
            </Typography>
          )}

          <Box
            sx={{
              bgcolor: "#f0f1f3",
              borderRadius: 2,
              px: 2.5,
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>Invoice Amount</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatMoney(invoiceAmount)}
            </Typography>
          </Box>
        </Stack>
      </SectionCard> */}

      <SectionCard title="Invoice Totals">
        <Stack spacing={2} sx={{ maxWidth: 460, ml: "auto" }}>

          {/* Sub Total */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sub Total
            </Typography>

            <Box
              sx={{
                bgcolor: "#f5f6f8",
                borderRadius: 1.5,
                px: 2,
                py: 1,
                minWidth: 150,
                textAlign: "right",
              }}
            >
              {formatMoney(subTotal)}
            </Box>
          </Box>


          {/* Tax */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Tax
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">

              <Tooltip title="Tax % = Tax Amount × 100 / Sub Total">
                <TextField
                  size="small"
                  placeholder="0.00 %"
                  value={taxPct}
                  onChange={(e) => onTaxPctChange(e.target.value)}
                  error={Boolean(errors.formValue.tax)}
                  inputProps={{
                    inputMode: "decimal",
                    style: { textAlign: "right" },
                    "aria-label": "Tax percentage",
                  }}
                  sx={{ width: 110, ...fieldSx }}
                />
              </Tooltip>


              <Tooltip title="Tax Amount = Sub Total × Tax % / 100">
                <TextField
                  size="small"
                  placeholder="0.00"
                  value={taxAmt}
                  onChange={(e) => onTaxAmtChange(e.target.value)}
                  error={Boolean(errors.formValue.tax)}
                  inputProps={{
                    inputMode: "decimal",
                    style: { textAlign: "right" },
                    "aria-label": "Tax amount",
                  }}
                  sx={{ width: 130, ...fieldSx }}
                />
              </Tooltip>

            </Stack>
          </Box>


          {/* Tax Error / Hint */}
          {(errors.formValue.tax || zeroTaxHint) && (
            <Typography
              variant="caption"
              color={errors.formValue.tax ? "error" : "text.secondary"}
              sx={{ textAlign: "right" }}
            >
              {errors.formValue.tax || "No tax on zero."}
            </Typography>
          )}


          {/* Invoice Amount */}
          <Box
            sx={{
              bgcolor: "#f0f1f3",
              borderRadius: 2,
              px: 2.5,
              py: 1.75,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              Invoice Amount
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatMoney(invoiceAmount)}
            </Typography>
          </Box>

        </Stack>
      </SectionCard>
    </Box>
  );
};

export default InvoiceEditor;