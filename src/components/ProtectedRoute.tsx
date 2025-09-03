// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../stores";
import { encryptStorage } from "../utils/encryptStorage";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<Dispatch>();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("🔐 ProtectedRoute checking auth for:", location.pathname);

        const access_token = await encryptStorage.getItem("access_token");
        const projectId = await encryptStorage.getItem("projectId");
        const myDeveloperId = await encryptStorage.getItem("myDeveloperId");

        console.log("🔍 Storage check:", {
          hasToken: !!access_token,
          hasProjectId: !!projectId,
          hasDeveloperId: !!myDeveloperId,
          isAuthFromRedux: isAuth,
        });

        // สำคัญ: ใช้ token เป็นหลักในการตัดสินใจ (ไม่ใช่ isAuth อย่างเดียว)
        // เพราะเวลา refresh หน้า Redux state จะหาย แต่ token ยังอยู่
        if (!access_token) {
          console.log("🚫 No access token found, redirecting to login");
          if (location.pathname !== "/auth") {
            localStorage.setItem("redirectAfterLogin", location.pathname);
          }

          if (isMounted) {
            navigate("/auth", { replace: true });
          }
          return;
        }

        // แก้ไข projectId ถ้าขาดหาย
        let finalProjectId = projectId;
        if (!finalProjectId && myDeveloperId) {
          console.log("🔧 Restoring projectId from myDeveloperId");
          await encryptStorage.setItem("projectId", myDeveloperId);
          finalProjectId = myDeveloperId;
        } else if (!finalProjectId) {
          console.log("🔧 Setting fallback projectId for session");
          await encryptStorage.setItem("projectId", "session_project_id");
          finalProjectId = "session_project_id";
        }

        // กรณี refresh หน้า: มี token แต่ Redux state อาจหาย
        if (access_token && finalProjectId && !isAuth) {
          console.log(
            "🔄 Token exists but auth state lost - attempting to restore..."
          );

          try {
            // ลองตรวจสอบ token และ restore auth state
            const isValid = await dispatch.userAuth.checkTokenValidity();
            if (!isValid) {
              console.log("❌ Token validation failed");
              if (isMounted) {
                navigate("/auth", { replace: true });
              }
              return;
            }
          } catch (error) {
            console.log("❌ Token check failed:", error);
            if (isMounted) {
              navigate("/auth", { replace: true });
            }
            return;
          }
        }

        // ตรวจสอบขั้นสุดท้าย - ใช้ token เป็นหลัก
        if (access_token && finalProjectId) {
          console.log("✅ Authentication verified - access granted");
          if (isMounted) {
            setIsAuthenticated(true);
            setIsChecking(false);
          }
        } else {
          console.log("🚫 Missing required credentials");
          if (location.pathname !== "/auth") {
            localStorage.setItem("redirectAfterLogin", location.pathname);
          }
          if (isMounted) {
            navigate("/auth", { replace: true });
          }
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (isMounted) {
          if (location.pathname !== "/auth") {
            localStorage.setItem("redirectAfterLogin", location.pathname);
          }
          navigate("/auth", { replace: true });
        }
      }
    };

    // รอให้ Redux hydrate เสร็จก่อน (สำหรับ page refresh)
    const timer = setTimeout(() => {
      if (isMounted) {
        checkAuth();
      }
    }, 300); // เพิ่ม delay ให้มากขึ้น

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate, location.pathname, dispatch]); // เอา isAuth ออกจาก dependency

  // แสดง loading ระหว่างตรวจสอบ
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}>
        <Spin size="large" tip="Verifying authentication..." />
      </div>
    );
  }

  // ถ้าไม่ได้ authenticated ให้ return null
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
