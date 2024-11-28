import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

interface LoginFormData {
  email: string;
  password: string;
}

interface AttendeeData {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const userData = localStorage.getItem("userData");
    if (userData) {
      navigate("/"); // Redirect to home if already logged in
    }
  }, [navigate]);

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // Transform the data before sending to backend
      const backendData = {
        contactInfo: values.email, // Map email to contactInfo
        password: values.password,
      };

      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (response.ok) {
        // Transform backend data to frontend format before storing
        const frontendData = {
          ...data,
          email: data.contactInfo, // Map contactInfo to email
        };
        delete frontendData.contactInfo; // Remove contactInfo from stored data

        // Save user data to localStorage
        localStorage.setItem("userData", JSON.stringify(frontendData));
        message.success("Login successful!");
        navigate("/");
      } else {
        message.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
              {
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              type="email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
