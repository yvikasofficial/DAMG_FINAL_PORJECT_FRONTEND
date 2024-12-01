import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

interface FormData {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async (values: FormData) => {
    setLoading(true);
    try {
      const backendData = {
        name: values.name,
        contactInfo: values.email,
        password: values.password,
      };

      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Registration successful!");
        navigate("/login");
      } else {
        message.error(data.message || "Registration failed");
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
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="MKYKV"
              style={{
                height: "150px",
                objectFit: "contain",
              }}
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Register Account
          </h2>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

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
              {
                min: 6,
                message: "Password must be at least 6 characters",
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
              Register
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
