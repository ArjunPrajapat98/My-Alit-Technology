import React, { useState } from "react";
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

const Footer = () => {
    return (
        <Box sx={{ borderTop: "1px solid #ececec", py: 2.5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                © 2025 InvoiceApp. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 0.5 }}>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>
                    Privacy Policy
                </Link>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>
                    Terms of Service
                </Link>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>
                    Support
                </Link>
            </Stack>
        </Box>
    );
}

export default Footer