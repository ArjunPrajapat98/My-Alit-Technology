import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Paper,
    Chip,
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
import StorageService from "../../utils/StorageServices/StorageServices";
import toast from "react-hot-toast";
import Header from "../../components/layout/Header";
const darkBtnSx = { bgcolor: "#1b1d21", textTransform: "none", px: 3, "&:hover": { bgcolor: "#0f1113" } };

const Dashboard = () => {
    const navigate = useNavigate();

    const logout = async (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        await StorageService.clearStorage();
        navigate('/login');
        toast.success("Logged out successfully");
    }

    return (
        <>
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f7f7f8" }}>
                <Header />
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ m: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
                        Dashboad
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                            variant="contained"
                            disableElevation
                            sx={darkBtnSx}
                            onClick={(e) => logout(e)}
                        >
                            Logout
                        </Button>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ m: 3 }}>
                    <Chip label="Items Section" sx={{ fontSize: 16 }} color="primary" onClick={() => navigate('/items')} />
                    <Chip label="Invoice Section" sx={{ fontSize: 16 }} color="success" onClick={() => navigate('/invoice')} />
                </Stack>
            </Box>
        </>
    )
}

export default Dashboard