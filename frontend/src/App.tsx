import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ModelBuilder from "./pages/ModelBuilder.tsx";
import DataManager from "./pages/DataManager.tsx";
import Layout from "./components/Layout.tsx";

function App() {
  const { token } = useAuthStore();

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" /> : <Register />}
          />

          <Route
            path="/"
            element={token ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="models/new" element={<ModelBuilder />} />
            <Route path="models/:modelName/edit" element={<ModelBuilder />} />
            <Route path="data/:modelName" element={<DataManager />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
