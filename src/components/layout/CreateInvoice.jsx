import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };

const darkBtnSx = {
  bgcolor: "#1b1d21",
  textTransform: "none",
  px: 3,
  "&:hover": { bgcolor: "#0f1113" },
};

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatMoney = (v) => `$${money.format(Number(v) || 0)}`;

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

// options would come from getItemLookupList()
const ITEM_OPTIONS = [
  { id: 1, name: "Wireless Headphones", rate: 199.99 },
  { id: 2, name: "Design Consultation", rate: 150 },
  { id: 3, name: "Office Chair", rate: 299.99 },
];

const emptyRow = () => ({ key: crypto.randomUUID(), item: "", description: "", qty: "", rate: "", disc: "" });

const lineAmount = (row) => {
  const qty = Number(row.qty) || 0;
  const rate = Number(row.rate) || 0;
  const disc = Number(row.disc) || 0;
  return qty * rate * (1 - disc / 100);
};

const CreateInvoice = () => {
  const [rows, setRows] = useState([emptyRow()]);
  const [taxPct, setTaxPct] = useState("");

  const subTotal = useMemo(() => rows.reduce((sum, r) => sum + lineAmount(r), 0), [rows]);
  const taxAmt = (subTotal * (Number(taxPct) || 0)) / 100;
  const invoiceAmount = subTotal + taxAmt;

  const updateRow = (key, field, value) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const copyRow = () =>
    setRows((prev) => (prev.length ? [...prev, { ...prev[prev.length - 1], key: crypto.randomUUID() }] : prev));

  const deleteRow = () => setRows((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const onSelectItem = (key, itemId) => {
    const picked = ITEM_OPTIONS.find((o) => o.id === itemId);
    setRows((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, item: itemId, rate: picked ? picked.rate : r.rate, qty: r.qty || 1 } : r
      )
    );
  };

  const lineBtnSx = { textTransform: "none", color: "text.primary", borderColor: "#d7dade" };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f7f8fa", minHeight: "100vh" }}>
      {/* header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          New Invoice
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button sx={{ textTransform: "none", color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" disableElevation sx={darkBtnSx}>
            Save
          </Button>
        </Stack>
      </Stack>

      {/* invoice details */}
      <SectionCard title="Invoice Details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <FieldLabel>Invoice No</FieldLabel>
            <TextField fullWidth size="small" placeholder="INV-001" sx={fieldSx} helperText="Auto next available number" />
          </Box>
          <Box>
            <FieldLabel required>Invoice Date</FieldLabel>
            <TextField fullWidth size="small" type="date" defaultValue="2025-01-15" sx={fieldSx} />
          </Box>

          <Box>
            <FieldLabel required>Customer Name</FieldLabel>
            <TextField fullWidth size="small" placeholder="Enter customer name" sx={fieldSx} />
          </Box>
          <Box>
            <FieldLabel>City</FieldLabel>
            <TextField fullWidth size="small" placeholder="Enter city" sx={fieldSx} />
          </Box>

          <Box>
            <FieldLabel>Address</FieldLabel>
            <TextField fullWidth multiline rows={3} placeholder="Enter address" sx={fieldSx} />
          </Box>
          <Box>
            <FieldLabel>Notes</FieldLabel>
            <TextField fullWidth multiline rows={3} placeholder="Additional notes" sx={fieldSx} />
          </Box>
        </Box>
      </SectionCard>

      {/* line items */}
      <SectionCard
        title="Line Items"
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addRow} sx={lineBtnSx}>
              Add Row
            </Button>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyRow} sx={lineBtnSx}>
              Copy
            </Button>
            <Button size="small" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={deleteRow} sx={lineBtnSx}>
              Delete
            </Button>
          </Stack>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { color: "text.secondary", fontWeight: 600, borderBottom: "none" } }}>
              <TableCell width={48}>S.No</TableCell>
              <TableCell width={180}>Item *</TableCell>
              <TableCell>Description</TableCell>
              <TableCell width={90} align="right">Qty *</TableCell>
              <TableCell width={110} align="right">Rate *</TableCell>
              <TableCell width={90} align="right">Disc %</TableCell>
              <TableCell width={110} align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.key}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Select
                    fullWidth
                    size="small"
                    displayEmpty
                    value={row.item}
                    onChange={(e) => onSelectItem(row.key, e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="" disabled>
                      Select item...
                    </MenuItem>
                    {ITEM_OPTIONS.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) => updateRow(row.key, "description", e.target.value)}
                    sx={fieldSx}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="0.00"
                    value={row.qty}
                    onChange={(e) => updateRow(row.key, "qty", e.target.value)}
                    inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                    sx={fieldSx}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="0.00"
                    value={row.rate}
                    onChange={(e) => updateRow(row.key, "rate", e.target.value)}
                    inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                    sx={fieldSx}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="0.00"
                    value={row.disc}
                    onChange={(e) => updateRow(row.key, "disc", e.target.value)}
                    inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                    sx={fieldSx}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {formatMoney(lineAmount(row))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ bgcolor: "#f5f6f8", borderRadius: 1.5, mt: 1.5, px: 2, py: 1.25 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={4}>
            <Typography variant="body2" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatMoney(subTotal)}
            </Typography>
          </Stack>
        </Box>
      </SectionCard>

      {/* totals */}
      <SectionCard title="Invoice Totals">
        <Stack spacing={2} sx={{ maxWidth: 420, ml: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Sub Total
            </Typography>
            <Box sx={{ bgcolor: "#f5f6f8", borderRadius: 1.5, px: 2, py: 1, minWidth: 140, textAlign: "right" }}>
              {formatMoney(subTotal)}
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Tax
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="0.00 %"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                sx={{ width: 100, ...fieldSx }}
              />
              <Box sx={{ bgcolor: "#f5f6f8", borderRadius: 1.5, px: 2, py: 1, minWidth: 120, textAlign: "right" }}>
                {formatMoney(taxAmt)}
              </Box>
            </Stack>
          </Stack>

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
      </SectionCard>
    </Box>
  );
};

export default CreateInvoice;