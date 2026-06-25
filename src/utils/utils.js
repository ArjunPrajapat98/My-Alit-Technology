import { constant } from "./constant";

Array.prototype.mapWithKey = function (callback) {
  let newArray = [];
  for (let index = 0; index < this.length; index++) {
    let counter = callback(
      this[index],
      JSON.stringify(this[index]),
      index,
      this
    );
    newArray.push(counter);
  }
  return newArray;
};

export const utils = {
  isEqualObject: (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2),

  isObjectValueEmpty: (obj) =>
    Object.values(obj).every(
      (item) => item !== "" || item !== "undefined" || item !== undefined
    )
      ? true
      : false,

  isObjectKeyEmpty: (obj) => (Object.keys(obj).length ? false : true),
  isObjectKeyExist: (obj, key) => Object.keys(obj).includes(key),
  checkFormError: async (inputValue, schema) => {
    try {
      const validationResult = await schema.validate(inputValue, {
        abortEarly: false,
      });
      return !!validationResult;
    } catch (error) {
      let obj = {};
      error?.inner?.forEach((vr) => {
        obj[vr.path] = vr.errors[0];
      });
      return obj;
    }
  },
  firstLetterCapital: (word = "") =>
    word?.length > 1
      ? word?.charAt(0).toUpperCase() + word?.slice(1)
      : word?.toUpperCase(),

  capitalFirstLetter: (word = "") =>
    word?.length > 1 ? word?.charAt(0).toUpperCase() : "NA",
}