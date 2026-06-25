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
    Divider,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import Field from "../../components/common/Input";
import { utils } from "../../utils/utils";
import { Link, useNavigate } from "react-router-dom";
import { createSignup } from "../../_services/authServices";
import { errorSchema } from "../../utils/errorSchema";
import Dropdown from "../../components/common/Dropdown";
import { constant } from "../../utils/constant";
import toast, { Toaster } from 'react-hot-toast';
import "./SignUp.css"
import StorageService from "../../utils/StorageServices/StorageServices";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function FieldLabel({ children, required }) {
    return (
        <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 14, fontWeight: 500 }}>
            {children}
            {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
        </Typography>
    );
}

function SectionTitle({ children }) {
    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {children}
            </Typography>
            <Divider sx={{ mt: 1.5, mb: 3 }} />
        </>
    );
}

const initialValue = {
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    CompanyName: '',
    Address: '',
    City: '',
    ZipCode: '',
    Industry: '',
    CurrencySymbol: '',
    logo: '',
}

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [formValue, setFormValue] = useState(initialValue);
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState(null);

    const navigate = useNavigate();

    const handleOnChange = async (name, value) => {
        setFormValue((s) => ({
            ...s,
            [name]: value
        }));

        if (!utils.isObjectKeyEmpty(formError)) {
            const validationResult = await utils.checkFormError(formValue, errorSchema.createSignUp);
            if (validationResult === true) {
                setFormError("");
            } else {
                setFormError(validationResult);
            }
        }
    };

    const apiCallingFunction = async () => {
        try {
            const formData = new FormData();
            formData.append("FirstName", formValue?.FirstName);
            formData.append("LastName", formValue?.LastName);
            formData.append("Email", formValue?.Email);
            formData.append("Password", formValue?.Password);
            formData.append("CompanyName", formValue?.CompanyName);
            formData.append("Address", formValue?.Address);
            formData.append("City", formValue?.City);
            formData.append("ZipCode", formValue?.ZipCode);
            formData.append("Industry", formValue?.Industry);
            formData.append("CurrencySymbol", formValue?.CurrencySymbol);
            if (formValue?.logo) {
                formData.append("logo", formValue?.logo);
            }

            const res = await createSignup(formData);
            if (res?.token) {
                toast.success("User signup successfully");
                navigate("/login");
                setLoading(false);
                setFormValue(initialValue);
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
        const validationResult = await utils?.checkFormError(formValue, errorSchema.createSignUp);
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
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowed.includes(file.type)) {
            toast.error("Invalid file type. Use PNG or JPG.");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Invalid file size. Max 5MB.");
            e.target.value = "";
            return;
        }

        setPreview(URL.createObjectURL(file)); // turant preview
        handleOnChange("logo", file) //  URL.createObjectURL(file));
        e.target.value = "";
    };

    return (
        <>
            <Header />
            <Box sx={{ bgcolor: "#f3f4f6", minHeight: "100vh", py: 6, px: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        maxWidth: 880,
                        mx: "auto",
                        p: { xs: 3, md: 5 },
                        borderRadius: 3,
                        boxShadow: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.1)",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            columnGap: 6,
                            rowGap: 4,
                            alignItems: "start",
                        }}
                    >
                        <Box>
                            <SectionTitle>User Information</SectionTitle>

                            <Stack spacing={2.5}>
                                <Box>
                                    <FieldLabel required>First Name</FieldLabel>
                                    <Field
                                        name="FirstName"
                                        placeholder="Enter first name"
                                        inputProps={{ maxLength: 50 }}
                                        value={formValue.FirstName}
                                        // onChange={(e) => utils.handleNameInputChange(e, handleOnChange)}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.FirstName)}
                                        helperText={!!(typeof formError === "object") ? formError?.FirstName : ""}
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel required>Last Name</FieldLabel>
                                    <Field
                                        name="LastName"
                                        placeholder="Enter last name"
                                        value={formValue.LastName}
                                        inputProps={{ maxLength: 50 }}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.LastName)}
                                        helperText={!!(typeof formError === "object") ? formError?.LastName : ""}
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel required>Email</FieldLabel>
                                    <Field
                                        type="email"
                                        inputProps={{ maxLength: 100 }}
                                        name="Email"
                                        placeholder="Enter your email"
                                        value={formValue.Email}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        helperText={typeof formError === "object" ? formError?.Email : ""}
                                        error={!!(typeof formError === "object" && formError?.Email)}
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel required>Password</FieldLabel>
                                    <Field
                                        name="Password"
                                        placeholder="Enter password"
                                        inputProps={{ maxLength: 20 }}
                                        type={showPassword ? "text" : "password"}
                                        value={formValue.Password}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.Password)}
                                        helperText={!!(typeof formError === "object") ? formError?.Password : ""}
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
                                    <LinearProgress
                                        variant="determinate"
                                        value={!formValue?.Password ? 0 : (strongPasswordRegex.test(formValue?.Password) ? 100 : 35)}
                                        sx={{
                                            mt: 1.25,
                                            height: 5,
                                            borderRadius: 3,
                                            bgcolor: "#e5e7eb",
                                            "& .MuiLinearProgress-bar": { bgcolor: strongPasswordRegex.test(formValue?.Password) ? "#00d449" : "#374151", borderRadius: 3 },
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
                                        Password strength: {strongPasswordRegex.test(formValue?.Password) ? 'Strong' : 'Weak'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box>
                            <SectionTitle>Company Information</SectionTitle>

                            <Stack spacing={2.5}>
                                <Box>
                                    <FieldLabel required>Company Name</FieldLabel>
                                    <Field
                                        name="CompanyName"
                                        placeholder="Enter company name"
                                        inputProps={{ maxLength: 100 }}
                                        value={formValue.CompanyName}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.CompanyName)}
                                        helperText={!!(typeof formError === "object") ? formError?.CompanyName : ""}
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel>Company Logo</FieldLabel>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Stack alignItems="center" spacing={0.5}>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 48,
                                                    bgcolor: "#f1f2f5",
                                                    borderRadius: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#9aa1ad",
                                                }}
                                            >
                                                {preview ? (
                                                    <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <>
                                                        <ImageOutlinedIcon />
                                                    </>
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Max 2-5 MB
                                            </Typography>
                                        </Stack>

                                        <Box
                                            sx={{
                                                flex: 1,
                                                border: "1px solid #e3e6eb",
                                                borderRadius: 1.5,
                                                px: 1.25,
                                                py: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                            }}
                                        >
                                            {/* <Box
                                                component="label"
                                                sx={{
                                                    // width: 56,
                                                    // height: 32,
                                                    border: "1px solid #e3e6eb",
                                                    borderRadius: 1,
                                                    bgcolor: "#fff",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <input
                                                    hidden
                                                    type="file"
                                                    name="logo"
                                                    id="_fileUpload"
                                                    onChange={(e) => handleFileChange(e)}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                No file chosen
                                            </Typography> */}
                                            <Box
                                                component="label"
                                                sx={{
                                                    display: "inline-block",
                                                    border: "1px solid #cfd3d8",
                                                    borderRadius: 1.5,
                                                    px: 1.5,
                                                    py: 0.75,
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Choose file
                                                <input type="file" hidden accept="image/png, image/jpeg" onChange={handleFileChange} />
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box>
                                    <FieldLabel required>Address</FieldLabel>
                                    <Field
                                        placeholder="Enter company address"
                                        multiline rows={3}
                                        name="Address"
                                        inputProps={{ maxLength: 500 }}
                                        value={formValue.Address}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.Address)}
                                        helperText={!!(typeof formError === "object") ? formError?.Address : ""}
                                    />
                                </Box>

                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                    <Box>
                                        <FieldLabel required>City</FieldLabel>
                                        <Field
                                            placeholder="Enter city"
                                            name="City"
                                            inputProps={{ maxLength: 50 }}
                                            value={formValue.City}
                                            onChange={({ target: { name, value } }) =>
                                                handleOnChange(name, value)
                                            }
                                            error={!!(typeof formError === "object" && formError?.City)}
                                            helperText={!!(typeof formError === "object") ? formError?.City : ""}
                                        />
                                    </Box>
                                    <Box>
                                        <FieldLabel required>Zip Code</FieldLabel>
                                        <Field
                                            placeholder="6 digit zip code"
                                            name="ZipCode"
                                            value={formValue.ZipCode}
                                            // onChange={({ target: { name, value } }) =>
                                            //     handleOnChange(name, value)
                                            // }
                                            onChange={({ target: { value } }) =>
                                                handleOnChange("ZipCode", value.replace(/\D/g, "").slice(0, 6))
                                            }
                                            inputProps={{ inputMode: "numeric" }}
                                            error={!!(typeof formError === "object" && formError?.ZipCode)}
                                            helperText={!!(typeof formError === "object") ? formError?.ZipCode : ""}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <FieldLabel required>Industry</FieldLabel>
                                    <Field
                                        placeholder="Industry type"
                                        name="Industry"
                                        value={formValue.Industry}
                                        inputProps={{ maxLength: 50 }}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value)
                                        }
                                        error={!!(typeof formError === "object" && formError?.Industry)}
                                        helperText={!!(typeof formError === "object") ? formError?.Industry : ""}
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel required>Currency Symbol</FieldLabel>
                                    <Field
                                        placeholder="$, ₹, €, AED"
                                        name="CurrencySymbol"
                                        value={formValue.CurrencySymbol}
                                        inputProps={{ maxLength: 5 }}
                                        onChange={({ target: { name, value } }) =>
                                            handleOnChange(name, value.replace(/[^A-Za-z₹$€£¥₽₩]/g, "").slice(0, 5))
                                        }
                                        error={!!(typeof formError === "object" && formError?.CurrencySymbol)}
                                        helperText={!!(typeof formError === "object") ? formError?.CurrencySymbol : ""}
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            onClick={(e) => handleClick(e)}
                            disabled={loading}
                            variant="contained"
                            disableElevation
                            sx={{
                                bgcolor: "#3f4451",
                                px: 4,
                                py: 1.1,
                                textTransform: "none",
                                fontWeight: 500,
                                "&:hover": { bgcolor: "#2f333d" },
                            }}
                        >
                            {loading ? 'Loading...' : 'Sign Up'}
                        </Button>
                    </Box>

                    <Typography variant="body2" align="center" sx={{ mt: 3, color: "text.secondary" }}>
                        Already have an account?{" "}
                        <Link to="/login" underline="hover" color="text.primary" sx={{ fontWeight: 500 }}>
                            Login
                        </Link>
                    </Typography>
                </Paper>
            </Box>
            <Footer />
        </>
    );
}

export default SignUp