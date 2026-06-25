import React from "react";
import CommonPreviewModal from "../../components/common/CommonPreviewModal";
import { utils } from "../../utils/utils";

export default function ImagePreview(props) {

    const { isOpen, onClose } = props;
    const preview = isOpen ? isOpen : null;

    return (
        <CommonPreviewModal
            {...props}
            onClose={onClose}
            previewImage={true}
        >
            {!preview ? (
                <p style={{ padding: "20px" }}>
                    Sorry ⚠️ {utils.firstLetterCapital(preview)} Preview is not available.
                </p>
            ) : (
                <img
                    src={isOpen}
                    alt="Preview"
                    style={{
                        width: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
                        borderRadius: "10px",
                        border: "2px solid #ccc"
                    }}
                />
            )}

        </CommonPreviewModal>
    );
}