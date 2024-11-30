import { Layout, Menu, Button, Dropdown } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  DollarOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div className="px-4 py-2">
          <div className="font-bold">{adminData.username}</div>
          <div className="text-sm text-gray-500">{adminData.email}</div>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full text-left"
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="text-white text-xl font-bold p-4 text-center">
          {collapsed ? "Admin" : "Admin Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={[
            {
              key: "/admin/staff",
              icon: <TeamOutlined />,
              label: "Staff",
            },
            {
              key: "/admin/sponsorships",
              icon: <DollarOutlined />,
              label: "Sponsorships",
            },
            {
              key: "/admin/streaming",
              icon: <VideoCameraOutlined />,
              label: "Streaming",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<UserOutlined />}
                className="flex items-center"
              >
                <span className="ml-2">{adminData.username}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
