import React from "react";
import {
    Dialog,
    DialogContent,
    IconButton,
    Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CommonPreviewModal = (props) => {
    const {
        isOpen,
        onClose,
        children,
        maxWidth = "md",
        fullWidth = true,
        ...rest
    } = props;

    return (
        <Dialog
            open={Boolean(isOpen)}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            {...rest}
        >
            <Box
                sx={{
                    position: "relative",
                    p: 1
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        zIndex: 1
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent>
                    {children}
                </DialogContent>
            </Box>
        </Dialog>
    );
}

export default CommonPreviewModal

