import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Stack,
    Typography,
    Button,
    IconButton,
    Divider,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import toast from "react-hot-toast";
import Field from "../common/Input";
import { utils } from "../../utils/utils";
import { errorSchema } from "../../utils/errorSchema";
import { createNewItem, saveItem } from "../../_services/itemsServices";
import { getThumbnilImage, uploadFiles } from "../../_services/commonServices/commonServices";

const darkBtnSx = {
    bgcolor: "#2b2f36",
    textTransform: "none",
    px: 3,
    "&:hover": { bgcolor: "#1f2329" },
};

function FieldLabel({ children, required }) {
    return (
        <Typography component="label" sx={{ display: "block", mb: 0.75, fontSize: 14, fontWeight: 500 }}>
            {children}
            {required && <Box component="span" sx={{ color: "error.main" }}>*</Box>}
        </Typography>
    );
}

const initialValue = {
    itemName: "",
    description: "",
    salesRate: "",
    discountPct: "",
};

const CreateItemModal = ({ open = false, item = null, onClose = () => { }, onSaved = () => { } }) => {
    const isEdit = Boolean(item?.itemID);

    const [formValue, setFormValue] = useState(initialValue);
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [pictureFile, setPictureFile] = useState(null);

    const getThumbnil = async (id) => {
        try {
            const res = await getThumbnilImage(id);
            console.log("res", res)
            if (res) {
                setPreview(res);
            } else {
                console.error(error)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            setFormValue({
                itemName: item.itemName ?? "",
                description: item.description ?? "",
                salesRate: item.salesRate ?? "",
                discountPct: item.discountPct ?? "",
            });
            getThumbnil(item?.itemID);
        } else {
            setFormValue(initialValue);
            setPreview(null);
        }
        setFormError({});
    }, [open, item, isEdit]);

    const handleOnChange = async (name, value) => {
        setFormValue((s) => ({ ...s, [name]: value }));
        if (!utils.isObjectKeyEmpty(formError)) {
            const result = await utils.checkFormError({ ...formValue, [name]: value }, errorSchema.createItemSchema);
            setFormError(result === true ? {} : result);
        }
    };

    const uploadPicture = async (itemID) => {
        const formData = new FormData();
        formData.append("file", pictureFile);
        formData.append("ItemID", itemID);

        await uploadFiles(formData);
        // if (res?.responseCode !== 200) {
        //     toast.error("Item saved, but picture upload failed.");
        // }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const validationResult = await utils?.checkFormError(formValue, errorSchema.createItemSchema);
        if (utils?.isObjectKeyEmpty(validationResult)) {
            setLoading(true);
            try {
                const payload = {
                    itemID: item?.itemID ?? 0,
                    itemName: formValue.itemName.trim(),
                    description: (formValue.description ?? "").trim(),
                    salesRate: Number(formValue.salesRate) || 0,
                    discountPct: Number(formValue.discountPct) || 0,
                    updatedOnPrev: item?.updatedOn ?? null, // concurrency stamp (null on insert)
                };
                const res = await createNewItem(payload);
                if (res?.primaryKeyID) {
                    const newId = item?.itemID || res?.primaryKeyID || res?.data?.primaryKeyID;

                    if (pictureFile && newId) {
                        await uploadPicture(newId);
                    }

                    toast.success(isEdit ? "Item updated successfully" : "Item created successfully");
                    onSaved();
                    onClose();
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.log('error', error)
                setLoading(false);
                // toast.error("");
            } finally {
                setLoading(false);
            }
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

        setPictureFile(file);                  // upload Save ke baad hoga
        setPreview(URL.createObjectURL(file)); // turant preview
        e.target.value = "";
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            {/* header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {isEdit ? "Edit Item" : "New Item"}
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Stack>
            <Divider />

            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={3}>
                    {/* picture upload */}
                    <Box>
                        <FieldLabel>Item Picture</FieldLabel>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box
                                sx={{
                                    width: 84,
                                    height: 84,
                                    borderRadius: 2,
                                    bgcolor: "#f1f2f5",
                                    color: "#9aa1ad",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.5,
                                    overflow: "hidden",
                                }}
                            >
                                {preview ? (
                                    <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <>
                                        <ImageOutlinedIcon />
                                        <Typography variant="caption">Preview</Typography>
                                    </>
                                )}
                            </Box>

                            <Box>
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
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                                    PNG or JPG, max 5MB
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* name */}
                    <Box>
                        <FieldLabel required>Item Name</FieldLabel>
                        <Field
                            size="small"
                            name="itemName"
                            placeholder="Enter item name"
                            value={formValue.itemName}
                            onChange={({ target: { name, value } }) => handleOnChange(name, value)}
                            error={!!formError?.itemName}
                            helperText={formError?.itemName || ""}
                        />
                    </Box>

                    {/* description */}
                    <Box>
                        <FieldLabel>Description</FieldLabel>
                        <Field
                            multiline
                            rows={4}
                            name="description"
                            placeholder="Enter item description"
                            value={formValue.description}
                            onChange={({ target: { name, value } }) => handleOnChange(name, value.slice(0, 500))}
                            error={!!formError?.description}
                            helperText={formError?.description || ""}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right", mt: 0.5 }}>
                            {(formValue.description || "").length}/500
                        </Typography>
                    </Box>

                    {/* rate + discount */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <Box>
                            <FieldLabel required>Sale Rate</FieldLabel>
                            <Field
                                size="small"
                                name="salesRate"
                                placeholder="0.00"
                                value={formValue.salesRate}
                                onChange={({ target: { name, value } }) => handleOnChange(name, value)}
                                inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                                error={!!formError?.salesRate}
                                helperText={formError?.salesRate || ""}
                            />
                        </Box>
                        <Box>
                            <FieldLabel>Discount %</FieldLabel>
                            <Field
                                size="small"
                                name="discountPct"
                                placeholder="0 %"
                                value={formValue.discountPct}
                                onChange={({ target: { name, value } }) => handleOnChange(name, value)}
                                inputProps={{ inputMode: "numeric", style: { textAlign: "right" } }}
                                error={!!formError?.discountPct}
                                helperText={formError?.discountPct || ""}
                            />
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>

            <Divider />

            {/* footer */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disableElevation
                    sx={darkBtnSx}
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? 'Loading' : 'Save'}
                </Button>
            </Stack>
        </Dialog>
    );
};

export default CreateItemModal;