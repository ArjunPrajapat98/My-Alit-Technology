import { useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    LinearProgress,
    Button,
    Link,
    Divider,
} from "@mui/material";

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };

const Field = (props) => {
    return (
        <TextField
            fullWidth
            sx={fieldSx}
            {...props}
        />
    )
}

export default Field