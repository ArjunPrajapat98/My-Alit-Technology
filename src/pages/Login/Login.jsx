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
    InputAdornment,
    IconButton,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Link, useNavigate } from "react-router-dom";
import { errorSchema } from "../../utils/errorSchema";
import Field from "../../components/common/Input";
import { createLogin } from "../../_services/authServices";
import { utils } from "../../utils/utils";
import toast from "react-hot-toast";
import StorageService from "../../utils/StorageServices/StorageServices";

function Label({ text, required }) {
    return (
        <Typography component="label" sx={{ fontSize: 13, fontWeight: 500, mb: 0.5, display: "block" }}>
            {text}
            {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
        </Typography>
    );
}

function FieldLabel({ children, required }) {
    return (
        <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 14, fontWeight: 500 }}>
            {children}
            {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
        </Typography>
    );
}

const initialValue = {
    email: '',
    password: '',
    rememberMe: false,
}

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [formValue, setFormValue] = useState(initialValue);
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleOnChange = async (name, value) => {
        setFormValue((s) => ({
            ...s,
            [name]: value
        }));

        if (!utils.isObjectKeyEmpty(formError)) {
            const validationResult = await utils.checkFormError(formValue, errorSchema.loginSchema);
            if (validationResult === true) {
                setFormError("");
            } else {
                setFormError(validationResult);
            }
        }
    };

    const apiCallingFunction = async () => {
        try {
            const res = await createLogin(formValue);
            if (res?.token) {
                StorageService.setToken(res?.token);
                StorageService.setLocalItem("userDetais", JSON.stringify(res));
                StorageService.setLocalItem("currencySymbol", res?.company?.currencySymbol || formValue.CurrencySymbol);
                toast.success("User Login successfully");
                setLoading(false);
                setFormValue(initialValue);
                navigate("/dashboard");
            } else {
                setLoading(false);
                toast.error("Invalid information");
            }
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    const handleClick = async (e) => {
        e.preventDefault();
        const validationResult = await utils?.checkFormError(formValue, errorSchema.loginSchema);
        if (utils?.isObjectKeyEmpty(validationResult)) {
            setLoading(true);
            await apiCallingFunction();
            setFormError("");
        } else {
            setFormError(validationResult);
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

        if (!allowedTypes.includes(e?.target?.files[0]?.type)) {
            e.target.value = "";
            toast.error("Only image is allowed");
            return;
        }

        const selectedFiles = Array.from(e.target.files);
        handleOnChange("logo", URL.createObjectURL(selectedFiles));
    };

    console.log('formValue', formValue)

    return (
        <>
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f7f7f8" }}>
                <Header />

                <Box sx={{ flex: 1, px: 2, py: 6 }}>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Welcome Back
                        </Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                            Log in to your account.
                        </Typography>
                    </Box>

                    <Paper
                        variant="outlined"
                        sx={{ maxWidth: 320, mx: "auto", p: 3, borderColor: "#e6e6e6", borderRadius: 2 }}
                    >
                        <Box sx={{ mb: 2.5 }}>
                            <FieldLabel required>Email</FieldLabel>
                            <Field
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formValue.email}
                                onChange={({ target: { name, value } }) =>
                                    handleOnChange(name, value)
                                }
                                error={!!(typeof formError === "object" && formError?.email)}
                                helperText={!!(typeof formError === "object") ? formError?.email : ""}
                            />
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                            <FieldLabel required>Password</FieldLabel>
                            <Field
                                name="password"
                                placeholder="Enter password"
                                type={showPassword ? "text" : "password"}
                                value={formValue.password}
                                onChange={({ target: { name, value } }) =>
                                    handleOnChange(name, value)
                                }
                                error={!!(typeof formError === "object" && formError?.password)}
                                helperText={!!(typeof formError === "object") ? formError?.password : ""}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" size="small" onClick={() => setShowPassword((v) => !v)}>
                                                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>

                        <FormControlLabel
                            checked={formValue?.rememberMe}
                            id="rememberMe"
                            onChange={(value) =>
                                handleOnChange("rememberMe", value?.target?.checked)
                            }
                            control={<Checkbox size="small" />}
                            label={<Typography sx={{ fontSize: 13 }}>Remember me</Typography>}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                            <Button
                                variant="contained"
                                disableElevation
                                disabled={loading}
                                onClick={(e) => handleClick(e)}
                                sx={{
                                    bgcolor: "#3f4451",
                                    textTransform: "none",
                                    px: 3,
                                    "&:hover": { bgcolor: "#31353f" },
                                }}
                            >
                                {loading ? 'Loading...' : 'Login'}
                            </Button>
                        </Box>

                        <Typography sx={{ textAlign: "center", fontSize: 13, mt: 3 }}>
                            <Link to="/signup" underline="hover" color="inherit">
                                Create account
                            </Link>
                        </Typography>
                    </Paper>
                </Box>

                <Footer />
            </Box>
        </>
    );
}

export default Login