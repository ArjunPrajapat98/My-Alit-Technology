import { Navigate } from "react-router-dom";
import StorageService from "../../utils/StorageServices/StorageServices";

function PublicRoute({ children }) {
  const token = StorageService.getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;