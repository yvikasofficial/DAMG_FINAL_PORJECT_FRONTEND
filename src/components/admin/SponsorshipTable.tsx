import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface Sponsorship {
  sponsorshipId: string;
  name: string;
  contactInfo: string;
  contributionAmt: number;
}

const SponsorshipTable: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/sponsorships");
      const data = await response.json();
      setSponsorships(data);
    } catch (error) {
      message.error("Failed to fetch sponsorships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const handleCreate = async (values: {
    name: string;
    contactInfo: string;
    contributionAmt: number;
  }) => {
    try {
      const response = await fetch("http://localhost:3000/api/sponsorships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Sponsorship created successfully");
        setModalVisible(false);
        form.resetFields();
        fetchSponsorships();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Failed to create sponsorship");
      }
    } catch (error) {
      message.error("Failed to create sponsorship");
    }
  };

  const handleDelete = async (sponsorshipId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/sponsorships/${sponsorshipId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Sponsorship deleted successfully");
        fetchSponsorships();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Failed to delete sponsorship");
      }
    } catch (error) {
      message.error("Failed to delete sponsorship");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Info",
      dataIndex: "contactInfo",
      key: "contactInfo",
    },
    {
      title: "Contribution Amount",
      dataIndex: "contributionAmt",
      key: "contributionAmt",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Sponsorship) => (
        <div className="space-x-2">
          <Popconfirm
            title="Delete sponsorship"
            description="Are you sure you want to delete this sponsorship?"
            onConfirm={() => handleDelete(record.sponsorshipId)}
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
        <h1 className="text-2xl font-bold">Sponsorship Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Sponsorship
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sponsorships}
        loading={loading}
        rowKey="sponsorshipId"
      />

      <Modal
        title="Add Sponsorship"
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
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contactInfo"
            label="Contact Info"
            rules={[
              { required: true, message: "Please enter the contact info" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contributionAmt"
            label="Contribution Amount"
            rules={[
              {
                required: true,
                message: "Please enter the contribution amount",
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Sponsorship
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SponsorshipTable;
