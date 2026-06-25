import { TextField, MenuItem } from "@mui/material";

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2
    }
};

const Dropdown = ({
    dropdownArray = [],
    label = "Select",
    placeholder,
    value,
    onChange,
    name,
    ...props
}) => {

    return (
        <TextField
            select
            fullWidth
            sx={fieldSx}
            // label={label}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
        >
            {
                dropdownArray?.map((option) => (
                    <MenuItem
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))
            }
        </TextField>
    )
}

export default Dropdown;