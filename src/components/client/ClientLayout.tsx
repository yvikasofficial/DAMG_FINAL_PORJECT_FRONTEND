import { Layout, Menu, Button, Dropdown } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
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
      // Handle logout logic here
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
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: collapsed ? "14px" : "24px",
              fontWeight: "bold",
              transition: "font-size 0.3s",
            }}
          >
            MKYKV
          </h1>
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
