import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";

import "antd/dist/reset.css";
import "./App.css";
// layouts
import AuthorizedLayout from "./navigation/AuthorizedLayout";
import UnauthorizedLayout from "./navigation/UnauthorizedLayout";

import ProtectedRoute from "./components/ProtectedRoute";

// authorize routes
// old legacy routes
import ResidentInformationMain from "./modules/userManagement/screens/ResidentInformationMain";
import JuristicInvitation from "./modules/juristicManagement/screens/JuristicInvitation";
import JuristicManage from "./modules/juristicManagement/screens/JuristicManage";
import DevTeamInvitations from "./modules/developerTeam/screens/DevTeamInvitations";
import DevTeamList from "./modules/developerTeam/screens/DevTeamList";
import DevTeamPermission from "./modules/developerTeam/screens/DevTeamPermission";
import ProjectInvitation from "./modules/projectTeam/screens/ProjectInvitations";
import ProjectLists from "./modules/projectTeam/screens/ProjectLists";
import ProjectManagement from "./modules/projectManagement/screens/ProjectManagement";
import LicenseManagement from "./modules/licenseManagement/screens/LicenseManagement";
import DeveloperNews from "./modules/developerNews/screens/DeveloperNews";
import Profile from "./modules/setting/screens/Profile";

// unauthorized routes
import SignInScreen from "./modules/main/SignInScreen";
import RecoveryScreen from "./modules/main/RecoveryScreen";
import ResetPassword from "./modules/main/ResetPassword";
import SuccessResetScreen from "./modules/main/SuccessResetScreen";
import PaymentHistory from "./modules/licenseManagement/screens/PaymentHistory";

// components

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* old legacy routes */}
        {/* unauthorized_route */}
        <Route element={<UnauthorizedLayout />}>
          <Route path="auth" index element={<SignInScreen />} />
          <Route path="recovery" element={<RecoveryScreen />} />
          <Route path="forgot-password" element={<ResetPassword />} />
          <Route path="success-reset" element={<SuccessResetScreen />} />
        </Route>

        {/* authorized_route */}
        <Route
          path="dashboard/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="" element={<AuthorizedLayout />}>
                  <Route
                    index
                    element={<Navigate to="userManagement" replace />}
                  />
                  <Route
                    path="userManagement"
                    element={<ResidentInformationMain />}
                  />

                  {/* Project Team */}
                  <Route
                    path="projectInvitations"
                    element={<ProjectInvitation />}
                  />
                  <Route path="projectList" element={<ProjectLists />} />

                  {/* Juristic manage */}
                  <Route
                    path="juristicInvitation"
                    element={<JuristicInvitation />}
                  />
                  <Route path="juristicManage" element={<JuristicManage />} />

                  {/* project manage */}
                  <Route
                    path="projectManagement"
                    element={<ProjectManagement />}
                  />

                  {/* Developer Team */}
                  <Route
                    path="developerTeamInvitations"
                    element={<DevTeamInvitations />}
                  />
                  <Route path="developerTeamList" element={<DevTeamList />} />
                  <Route
                    path="developerTeamPermission"
                    element={<DevTeamPermission />}
                  />
                  <Route path="developerNews" element={<DeveloperNews />} />
                  {/* License Manage */}
                  <Route path="license" element={<LicenseManagement />} />
                  <Route path="paymentHistory" element={<PaymentHistory />} />
                  {/* Profile */}
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
