import { useEffect, useState } from "react";
import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";
import { encryptStorage } from "../utils/encryptStorage";
import "./styles/unAuthorizedLayout.css";

const UnauthorizedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndRedirect = async () => {
      try {
        // เฉพาะหน้า auth เท่านั้นที่ต้องตรวจสอบการ redirect
        if (location.pathname === "/auth") {
          const access_token = await encryptStorage.getItem("access_token");

          // ถ้ามี token และ isAuth = true แล้ว ให้ redirect ไป dashboard
          if (isAuth && access_token) {
            if (isMounted) {
              navigate("/dashboard/projectManagement", { replace: true });
            }
            return;
          }
        }

        // เสร็จสิ้นการตรวจสอบ
        if (isMounted) {
          setIsChecking(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // รอ Redux state อัพเดทเสร็จก่อน
    const timer = setTimeout(() => {
      if (isMounted) {
        checkAuthAndRedirect();
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAuth, location.pathname, navigate]);

  // แสดง loading เฉพาะตอนตรวจสอบ
  if (isChecking && location.pathname === "/auth") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}>
        Loading...
      </div>
    );
  }

  // ถ้าเป็นหน้า auth ให้แสดง outlet ตรงๆ
  if (location.pathname === "/auth") {
    return <>{outlet}</>;
  }

  // สำหรับหน้าอื่นๆ ใช้ layout เดิม
  return (
    <Row className="container">
      <Col className="contentContainer">{outlet}</Col>
    </Row>
  );
};

export default UnauthorizedLayout;
