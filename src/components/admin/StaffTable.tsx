import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface StaffMember {
  staffId: string;
  name: string;
  role: string;
}

const StaffTable: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/staff");
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      message.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (values: { name: string; role: string }) => {
    try {
      const response = await fetch("http://localhost:3000/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Staff member created successfully");
        setModalVisible(false);
        form.resetFields();
        fetchStaff();
      } else {
        message.error("Failed to create staff member");
      }
    } catch (error) {
      message.error("Failed to create staff member");
    }
  };

  const handleDelete = async (staffId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/staff/${staffId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Staff member deleted successfully");
        fetchStaff();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Failed to delete staff member");
      }
    } catch (error) {
      message.error("Failed to delete staff member");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: StaffMember) => (
        <div className="space-x-2">
          <Popconfirm
            title="Delete staff member"
            description="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.staffId)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger type="text" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Staff Member
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={staff}
        loading={loading}
        rowKey="staffId"
      />

      <Modal
        title="Add Staff Member"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input staff name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select staff role!" }]}
          >
            <Select>
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="Assistant">Assistant</Select.Option>
              <Select.Option value="Staff">Staff</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button
              type="default"
              className="mr-2"
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffTable;
