import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const HeaderLayout = ({ isButton = true }) => {

    const navigate = useNavigate();

    return (
        <Box
            sx={{
                bgcolor: "#fff",
                borderBottom: "1px solid #ececec",
                py: 1.5,
                px: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            {/* Left Side */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <ReceiptLongIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600 }}>
                    InvoiceApp
                </Typography>
            </Box>

            {/* Right Side */}
            {isButton && <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                size="small"
                onClick={() => navigate('/dashboard')}
            >
                Back
            </Button>}
        </Box>
    );
};

export default HeaderLayout;