import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import StorageService from "../../utils/StorageServices/StorageServices";

function PrivateRoute({ children }) {
    const token = StorageService.getToken();

    if (!token || token === null) {
        return <Navigate to="/login" />;
    }

    return children;
}


export default PrivateRoute;