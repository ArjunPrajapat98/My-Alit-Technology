const AUTH_KEY = "token";
const LANG_KEY = "lang";
const PHONE_KEY = "phone";
const COMP_KEY = "companyId";
const FIRM_KEY = "firmId"
const BRANCH_KEY = "branchId";
const COMPNAME_KEY = "company";
const USER_ID = "userId";
const USER_NAME = "userName";
const CURRENT_MENU_ID_KEY = "current_menu_id";
const CITIES = "cities";
const STATE = "states"
const GSTIN_NUMBER = 'gst_number'
class StorageService {
    static clearStorage(key = "") {
        if (key) {
            localStorage.removeItem(key);
        } else {
            localStorage.clear();
        }
    }

    static setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting item in localStorage: ${error}`);
        }
    }

    static getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error getting item from localStorage: ${error}`);
            return null;
        }
    }

    static setToken(token) {
        this.setItem(AUTH_KEY, token);
    }

    static getToken() {
        return this.getItem(AUTH_KEY);
    }

    static getLocalItem(key) {
        return this.getItem(key);
    }

    static setLocalItem(key, value) {
        return this.setItem(key, value);
    }
}

export default StorageService;