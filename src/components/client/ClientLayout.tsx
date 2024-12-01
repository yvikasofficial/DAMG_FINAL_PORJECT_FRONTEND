import { Layout, Menu, Button, Dropdown } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/concerts",
      icon: <CalendarOutlined />,
      label: "Concerts",
    },
    {
      key: "/tickets",
      icon: <DollarOutlined />,
      label: "My Tickets",
    },
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      // Clear all auth data from localStorage
      localStorage.clear();
      // Or if you want to clear specific items:
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');

      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
        }}
      >
        <div
          className="p-4 flex justify-center"
          style={{
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="MKYKV"
            style={{
              height: collapsed ? "32px" : "100px",
              transition: "height 0.3s",
            }}
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            boxShadow: "0 2px 8px 0 rgba(29,35,41,.05)",
          }}
        >
          <div className="flex justify-between items-center px-4 h-full">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Button type="text" icon={<UserOutlined />}>
                User
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientLayout;
