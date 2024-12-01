import { useState, useEffect } from "react";
import {
  Card,
  List,
  Avatar,
  Typography,
  message,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  MailOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Sponsor {
  sponsorId: number;
  name: string;
  contactInfo: string;
  contributionAmt: number;
  concert: {
    name: string;
    date: string;
  };
}

interface SponsorshipsProps {
  concertId: number;
  isClientView?: boolean;
}

const Sponsorships: React.FC<SponsorshipsProps> = ({
  concertId,
  isClientView = false,
}) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchSponsors = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/sponsorships/concert/${concertId}`
      );
      if (!response.ok) throw new Error("Failed to fetch sponsors");
      const data = await response.json();
      setSponsors(data);
    } catch (error) {
      message.error("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [concertId]);

  const handleAddSponsor = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/sponsorships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          concertId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add sponsor");
      }

      message.success("Sponsor added successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchSponsors();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Failed to add sponsor");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (sponsorId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/sponsorships/${sponsorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete sponsor");
      }

      message.success("Sponsor deleted successfully");
      fetchSponsors();
    } catch (error) {
      message.error("Failed to delete sponsor");
    }
  };

  if (sponsors.length === 0 && !loading && isClientView) {
    return null;
  }

  return (
    <Card
      title="Concert Sponsors"
      className="mt-4"
      extra={
        !isClientView && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Sponsor
          </Button>
        )
      }
    >
      <Spin spinning={loading}>
        <List
          itemLayout="horizontal"
          dataSource={sponsors}
          renderItem={(sponsor) => (
            <List.Item
              actions={
                !isClientView
                  ? [
                      <Popconfirm
                        title="Delete Sponsor"
                        description="Are you sure you want to delete this sponsor?"
                        onConfirm={() => handleDeleteSponsor(sponsor.sponsorId)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                }
                title={
                  <div className="flex items-center justify-between">
                    <Text strong>{sponsor.name}</Text>
                    <Text type="success" className="text-lg">
                      <DollarOutlined className="mr-1" />
                      {sponsor.contributionAmt.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Text>
                  </div>
                }
                description={
                  <div className="flex items-center">
                    <MailOutlined className="mr-2" />
                    <Text type="secondary">{sponsor.contactInfo}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title="Add Sponsor"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSponsor}>
          <Form.Item
            name="name"
            label="Sponsor Name"
            rules={[{ required: true, message: "Please enter sponsor name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contactInfo"
            label="Contact Email"
            rules={[
              { required: true, message: "Please enter contact email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contributionAmt"
            label="Contribution Amount"
            rules={[
              { required: true, message: "Please enter contribution amount" },
              {
                type: "number",
                min: 0,
                message: "Amount must be greater than 0",
              },
            ]}
          >
            <InputNumber
              prefix="$"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Add Sponsor
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Sponsorships;
