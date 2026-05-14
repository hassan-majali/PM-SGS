import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { HomePage } from "./pages/home/HomePage";
import { ClientsListPage } from "./pages/clients/ClientsListPage";
import { ClientDetailPage } from "./pages/clients/ClientDetailPage";
import { ProjectsListPage } from "./pages/projects/ProjectsListPage";
import { ProjectWorkspacePage } from "./pages/projects/project-workspace/ProjectWorkspacePage";
import { InitiativesListPage } from "./pages/initiatives/InitiativesListPage";
import { InitiativeWorkspacePage } from "./pages/initiatives/InitiativeWorkspacePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
              <Route path="/initiatives" element={<InitiativesListPage />} />
              <Route path="/initiatives/:id" element={<InitiativeWorkspacePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
