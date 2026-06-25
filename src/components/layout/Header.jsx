import { useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Link,
    InputAdornment,
    IconButton,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

function Label({ text, required }) {
    return (
        <Typography component="label" sx={{ fontSize: 13, fontWeight: 500, mb: 0.5, display: "block" }}>
            {text}
            {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
        </Typography>
    );
}

const Header = () => {

    return (
        <Box
            sx={{
                bgcolor: "#fff",
                borderBottom: "1px solid #ececec",
                py: 1.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
            }}
        >
            <ReceiptLongIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontWeight: 600 }}>InvoiceApp</Typography>
        </Box>
    );
}

export default Header