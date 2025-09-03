import { useEffect, useState, useLayoutEffect, useMemo } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../stores";
import { encryptStorage } from "../utils/encryptStorage";
import SideMenu from "../components/templates/SideMenu";
import "./styles/authorizedLayout.css";

const { Sider, Content } = Layout;

function AuthorizedLayout() {
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const outlet = useOutlet();

  const [collapsed, setCollapsed] = useState(() => {
    const isSmallScreen = window.innerWidth <= 1024;
    return isSmallScreen;
  });
  const [reload, setReload] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);

  useLayoutEffect(() => {
    const validateAuth = async () => {
      try {
        const access_token = await encryptStorage.getItem("access_token");
        let projectId = await encryptStorage.getItem("projectId");
        const myDeveloperId = await encryptStorage.getItem("myDeveloperId");

        // ถ้าไม่มี token ให้ redirect ไป login
        if (!access_token) {
          dispatch.userAuth.onLogout();
          navigate("/auth", { replace: true });
          return false;
        }

        // แก้ไข projectId ถ้าขาดหาย
        if (!projectId) {
          if (myDeveloperId) {
            await encryptStorage.setItem("projectId", myDeveloperId);
            projectId = myDeveloperId;
          } else {
            await encryptStorage.setItem("projectId", "session_project_id");
            projectId = "session_project_id";
          }
        }

        // ถ้ามี token แต่ isAuth = false (เกิดจาก page refresh)
        if (access_token && projectId && !isAuth) {
          dispatch.userAuth.updateAuthState(true);
          return true;
        }

        // Development mode: bypass token validation for mock tokens
        if (
          access_token === "mock_access_token" &&
          projectId === "mock_project_id"
        ) {
          dispatch.userAuth.updateAuthState(true);
          return true;
        }

        // ถ้ามีทุกอย่างครบ ให้ผ่าน
        if (access_token && projectId && isAuth) {
          return true;
        }

        // Check Refresh token (only for real tokens)
        try {
          const resReToken = await dispatch.userAuth.refreshTokenNew();
          if (!resReToken) {
            navigate("/auth", { replace: true });
            return false;
          }
        } catch (refreshError) {
          dispatch.userAuth.onLogout();
          navigate("/auth", { replace: true });
          return false;
        }

        dispatch.userAuth.updateAuthState(true);
        return true;
      } catch (error) {
        const access_token = await encryptStorage.getItem("access_token");

        if (access_token !== "mock_access_token") {
          dispatch.userAuth.onLogout();
          navigate("/auth", { replace: true });
        } else {
          dispatch.userAuth.updateAuthState(true);
        }
        return false;
      }
    };

    // เรียกตรวจสอบเฉพาะเมื่ออยู่ในหน้า dashboard
    if (window.location.pathname.startsWith("/dashboard")) {
      validateAuth();
    }
  }, [dispatch, navigate]);

  // Handle responsive behavior and menu collapse changes
  useEffect(() => {
    const handleResize = () => {
      const currentIsLargeScreen = window.innerWidth > 1024;
      setIsLargeScreen(currentIsLargeScreen);

      if (!currentIsLargeScreen) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        localStorage.setItem("sideMenuCollapsed", "false");
      }
    };

    const handleCollapsedChange = () => {
      if (isLargeScreen) {
        const newCollapsedState =
          localStorage.getItem("sideMenuCollapsed") === "true";
        setCollapsed(newCollapsedState);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("sideMenuCollapsed", handleCollapsedChange);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sideMenuCollapsed", handleCollapsedChange);
    };
  }, [isLargeScreen]);

  // Calculate sider width
  const siderWidth = useMemo(() => {
    if (!isLargeScreen) {
      return window.innerWidth <= 768 ? 70 : 80;
    }
    return collapsed ? 80 : 320;
  }, [isLargeScreen, collapsed]);

  return (
    <Layout>
      <Sider
        width={isLargeScreen ? 320 : siderWidth}
        collapsedWidth={siderWidth}
        collapsed={collapsed}
        trigger={null}
        className="sideContainer"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}>
        <SideMenu
          onMenuChange={() => {
            setReload(!reload);
          }}
        />
      </Sider>
      <div
        className="authorizeBG"
        style={{ left: siderWidth, transition: "all 0.3s" }}
      />
      <Layout style={{ marginLeft: siderWidth, transition: "all 0.3s" }}>
        <Content className="authorizeContentContainer">
          <div>{outlet}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AuthorizedLayout;
