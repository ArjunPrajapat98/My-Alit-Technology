import * as Yup from "yup";
const mobileFormateRehex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const pinCodeRegex = /^[1-9][0-9]{5}$/;

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const errorSchema = {
  createSignUp: Yup.object().shape({
    FirstName: Yup.string().trim().required("Please enter your first name.").max(50, "Max 50 characters."),
    LastName: Yup.string().trim().max(50, "Max 50 characters."), // optional per spec
    Email: Yup.string()
      .trim()
      .required("Enter a valid email address.")
      .email("Enter a valid email address.")
      .max(100, "Max 100 characters.")
      .test("tld-check", "Top-level domain cannot contain numbers", (value) => {
        if (!value) return true;
        const tld = value.split("@")[1]?.split(".").pop();
        return tld ? !/\d/.test(tld) : false;
      }),
    Password: Yup.string()
      .required("Password must be at least 8 characters long.")
      .min(8, "Password must be at least 8 characters long.")
      .max(20, "Password must be at most 20 characters.")
      .matches(strongPasswordRegex, "Use upper, lower, number and a special character."),
    CompanyName: Yup.string().trim().required("Please enter your company name.").max(100, "Max 100 characters."),
    Address: Yup.string().trim().required("Please enter company address.").max(500, "Max 500 characters."),
    City: Yup.string().trim().required("Please enter city.").max(50, "Max 50 characters."),
    ZipCode: Yup.string()
      .trim()
      .required("Zip must be exactly 6 digits.")
      .matches(/^\d{6}$/, "Zip must be exactly 6 digits."),
    Industry: Yup.string().trim().max(50, "Max 50 characters."), // optional per spec
    CurrencySymbol: Yup.string().trim().required("Currency symbol is required.").max(5, "Max 5 characters."),
  }),
  // createSignUp: Yup.object().shape({
  //   FirstName: Yup.string().trim().required("This filed is Required"),
  //   LastName: Yup.string().trim().required("This filed is Required"),
  //   Email: Yup.string()
  //     // .nullable() // Allows empty values
  //     .required()
  //     .email("Invalid email format. Example: example@domain.com")
  //     .test("tld-check", "Top-level domain cannot contain numbers", (value) => {
  //       if (!value) return true;
  //       const domain = value.split("@")[1];
  //       if (!domain) return false;
  //       const tld = domain.split(".").pop();
  //       return !/\d/.test(tld);
  //     }),
  //   Password: Yup.string()
  //     .trim()
  //     .required("This field is Required")
  //     .matches(
  //       strongPasswordRegex,
  //       "Password must contain minimum 8 characters, one uppercase, one lowercase, one number and one special character"
  //     ),
  //   CompanyName: Yup.string().trim().required("This filed is Required"),
  //   Address: Yup.string().trim().required("This filed is Required"),
  //   City: Yup.string().trim().required("This filed is Required"),
  //   ZipCode: Yup.string().trim().required("This filed is Required"),
  //   Industry: Yup.string().trim().required("This filed is Required"),
  //   CurrencySymbol: Yup.string().trim().required("This filed is Required"),
  // }),
  loginSchema: Yup.object().shape({
    email: Yup.string()
      .required()
      .email("Invalid email format. Example: example@domain.com")
      .test("tld-check", "Top-level domain cannot contain numbers", (value) => {
        if (!value) return true;
        const domain = value.split("@")[1];
        if (!domain) return false;
        const tld = domain.split(".").pop();
        return !/\d/.test(tld);
      }),
    password: Yup.string()
      .trim()
      .required("This field is Required")
      .matches(
        strongPasswordRegex,
        "Password must contain minimum 8 characters, one uppercase, one lowercase, one number and one special character"
      ),
    rememberMe: Yup.boolean(),
  }),
  createItemSchema: Yup.object().shape({
    itemName: Yup.string().trim().required("Please enter item name.").max(50, "Max 50 characters."),
    description: Yup.string().max(500, "Max 500 characters."),
    salesRate: Yup
      .number().transform((v, o) => (o === "" ? undefined : v))
      .typeError("Enter a valid rate.").min(0, "Enter a valid rate.").required("Enter a valid rate."),
    discountPct: Yup
      .number().transform((v, o) => (o === "" ? undefined : v))
      .typeError("0–100 only.").min(0, "0–100 only.").max(100, "0–100 only."),
  }),
  createInvoiceSchema: Yup.object().shape({
    customerName: Yup.string().trim().required("This filed is Required"),
  }),
};