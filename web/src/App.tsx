import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CataloguePage from "./pages/CataloguePage";
import CollectionPage from "./pages/CollectionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CataloguePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="collection" element={<CollectionPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}