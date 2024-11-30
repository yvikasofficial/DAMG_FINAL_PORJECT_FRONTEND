import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface StreamingPlatform {
  platformId: number;
  name: string;
  url: string;
  streamingDate: string;
}

const StreamingTable: React.FC = () => {
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/streaming");
      if (!response.ok) {
        throw new Error("Failed to fetch streaming platforms");
      }
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      message.error("Failed to fetch streaming platforms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleCreate = async (values: {
    name: string;
    url: string;
    streamingDate: dayjs.Dayjs;
  }) => {
    try {
      const formattedData = {
        ...values,
        streamingDate: values.streamingDate.format("YYYY-MM-DD"),
      };

      const response = await fetch("http://localhost:3000/api/streaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Streaming platform created successfully");
        setModalVisible(false);
        form.resetFields();
        fetchPlatforms();
      } else {
        message.error(data.message || "Failed to create streaming platform");
      }
    } catch (error) {
      message.error("Failed to create streaming platform");
    }
  };

  const handleDelete = async (platformId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/streaming/${platformId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Streaming platform deleted successfully");
        fetchPlatforms();
      } else {
        message.error(data.message || "Failed to delete streaming platform");
      }
    } catch (error) {
      message.error("Failed to delete streaming platform");
    }
  };

  const columns = [
    {
      title: "Platform Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: "Streaming Date",
      dataIndex: "streamingDate",
      key: "streamingDate",
      render: (date: string) => dayjs(date).format("MMMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: StreamingPlatform) => (
        <div className="space-x-2">
          <Popconfirm
            title="Delete streaming platform"
            description="Are you sure you want to delete this streaming platform?"
            onConfirm={() => handleDelete(record.platformId)}
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
        <h1 className="text-2xl font-bold">Streaming Platforms</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Platform
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={platforms}
        loading={loading}
        rowKey="platformId"
      />

      <Modal
        title="Add Streaming Platform"
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
            label="Platform Name"
            rules={[{ required: true, message: "Please input platform name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please input URL!" },
              { type: "url", message: "Please enter a valid URL!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="streamingDate"
            label="Streaming Date"
            rules={[
              { required: true, message: "Please select streaming date!" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
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

export default StreamingTable;
