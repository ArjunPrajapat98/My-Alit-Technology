import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PrivateRoute from "./components/privateRoute/PrivateRoute.jsx";
import Login from "./pages/Login/Login.jsx";
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import SignUp from './pages/SignUp/SignUp.jsx';
import { Toaster } from 'react-hot-toast';
import InvoicesList from './pages/InvoicesList/InvoicesList.jsx';
import InvoiceEditor from './pages/InvoicesList/InvoiceEditor.jsx';
import ItemList from './pages/Items/ItemList.jsx';
import PublicRoute from './components/publicRoute/PublicRoute.jsx';
import HomeRoute from './components/publicRoute/HomeRoute.jsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<HomeRoute />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/items"
            element={
              <PrivateRoute>
                <ItemList />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoice"
            element={
              <PrivateRoute>
                <InvoicesList />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoice/editor"
            element={
              <PrivateRoute>
                <InvoiceEditor />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  )
}

export default App;