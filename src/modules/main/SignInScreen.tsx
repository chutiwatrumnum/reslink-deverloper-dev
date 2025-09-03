// src/modules/main/SignInScreen.tsx
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import LOGO from "../../assets/images/SignInLogo.png";
import LOGO_MAIN from "../../assets/images/LogoNexres.png";
import "./styles/signIn.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../stores";

const { Title } = Typography;

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

const SignInScreen = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuth) {
      // ตรวจสอบว่ามี URL ที่เก็บไว้ก่อน login หรือไม่
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath && redirectPath !== "/auth") {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/dashboard/projectManagement", { replace: true });
      }
    }
  }, [isAuth, navigate]);

  // Handle Email/Password Login
  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const result = await dispatch.userAuth.loginEffects({
        username: values.username,
        password: values.password,
      });

      if (result) {
        message.success("Login successful!");

        // ตรวจสอบว่ามี URL ที่ต้อง redirect หลัง login หรือไม่
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath && redirectPath !== "/auth") {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath, { replace: true });
        } else {
          navigate("/dashboard/projectManagement", { replace: true });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    message.warning("Please check your input and try again.");
  };

  return (
    <div className="modern-signin-container">
      <Row className="modern-signin-row">
        {/* Left Side - Form */}
        <Col xs={24} lg={12} className="signin-form-section">
          <div className="modern-form-container">
            {/* Logo and Title */}
            <div className="signin-header">
              <div className="logo-container">
                <img src={LOGO_MAIN} alt="Logo Brand" className="logo-brand" />
              </div>

              <Title level={2} className="signin-title">
                Developer login
              </Title>
            </div>

            {/* Email/Password Form */}
            <Form
              name="signin"
              form={form}
              className="modern-signin-form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off">
              {/* Email Input */}
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}>
                <Input
                  size="large"
                  placeholder="Email"
                  className="modern-input"
                  autoComplete="username"
                />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}>
                <Input.Password
                  size="large"
                  placeholder="Password"
                  className="modern-input"
                  autoComplete="current-password"
                />
              </Form.Item>

              {/* Options Row */}
              <div className="signin-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="keep-logged-checkbox">
                    Keep me logged in
                  </Checkbox>
                </Form.Item>

                <Link to="/recovery" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  className="login-button"
                  loading={loading}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

        {/* Right Side - Illustration */}
        <Col xs={0} lg={12} className="modern-illustration-section">
          <div className="illustration-content">
            {/* Background Shapes */}
            <div className="bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
              <div className="shape shape-6"></div>
            </div>

            {/* Main Content */}
            <div className="main-text">
              <img src={LOGO} alt="Logo Brand" className="logo-brand-left" />
              {/* <h1 className="text-4xl font-bold mb-4 text-white">
                Developer Portal
              </h1> */}
              {/* <p className="text-xl text-blue-100 max-w-md mx-auto">
                Access your development tools and manage your projects
              </p> */}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignInScreen;
