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
  DatePicker,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface Manager {
  managerId: number;
  name: string;
  role: string;
}

interface Artist {
  artistId: number;
  name: string;
  genre: string;
  contactInfo: string;
  availability: string;
  socialMediaLink: string;
  manager: Manager;
}

interface StaffMember {
  staffId: string;
  name: string;
  role: string;
}

const POPULAR_GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Jazz",
  "Classical",
  "Electronic",
  "Country",
  "Blues",
  "Folk",
];

const ArtistsTable: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/artists");
      if (!response.ok) throw new Error("Failed to fetch artists");
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      message.error("Failed to fetch artists");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff members");
      const data = await response.json();
      setStaffMembers(data);
    } catch (error) {
      message.error("Failed to fetch staff members");
    }
  };

  useEffect(() => {
    fetchArtists();
    fetchStaffMembers();
  }, []);

  const handleCreate = async (values: {
    name: string;
    genre: string;
    contactInfo: string;
    availability: [dayjs.Dayjs, dayjs.Dayjs];
    socialMediaLink: string;
    managerId: string;
  }) => {
    try {
      const formattedAvailability = `${values.availability[0].format(
        "YYYY-MM-DD"
      )} - ${values.availability[1].format("YYYY-MM-DD")}`;

      const response = await fetch("http://localhost:3000/api/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          availability: formattedAvailability,
          managerId: parseInt(values.managerId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Artist created successfully");
        setModalVisible(false);
        form.resetFields();
        fetchArtists();
      } else {
        message.error(data.message || "Failed to create artist");
      }
    } catch (error) {
      message.error("Failed to create artist");
    }
  };

  const handleDelete = async (artistId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/artists/${artistId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Artist deleted successfully");
        fetchArtists();
      } else {
        message.error(data.message || "Failed to delete artist");
      }
    } catch (error) {
      message.error("Failed to delete artist");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
    },
    {
      title: "Contact Info",
      dataIndex: "contactInfo",
      key: "contactInfo",
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      render: (availability: string) => {
        const [startDate, endDate] = availability.split(" - ");
        return (
          <span>
            {dayjs(startDate).format("MMM D, YYYY")} -{" "}
            {dayjs(endDate).format("MMM D, YYYY")}
          </span>
        );
      },
    },
    {
      title: "Social Media",
      dataIndex: "socialMediaLink",
      key: "socialMediaLink",
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      render: (manager: Manager) => (
        <span>
          {manager.name} ({manager.role})
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Artist) => (
        <div className="space-x-2">
          <Popconfirm
            title="Delete artist"
            description="Are you sure you want to delete this artist?"
            onConfirm={() => handleDelete(record.artistId)}
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
        <h1 className="text-2xl font-bold">Artists Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Artist
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={artists}
        loading={loading}
        rowKey="artistId"
      />

      <Modal
        title="Add Artist"
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
            label="Artist Name"
            rules={[{ required: true, message: "Please input artist name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="genre"
            label="Genre"
            rules={[{ required: true, message: "Please select a genre!" }]}
          >
            <Select placeholder="Select a genre">
              {POPULAR_GENRES.map((genre) => (
                <Select.Option key={genre} value={genre}>
                  {genre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="contactInfo"
            label="Contact Info"
            rules={[
              { required: true, message: "Please input contact info!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="availability"
            label="Availability Period"
            rules={[
              { required: true, message: "Please select availability period!" },
            ]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            name="socialMediaLink"
            label="Social Media Link"
            rules={[
              { required: true, message: "Please input social media link!" },
              { type: "url", message: "Please enter a valid URL!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="managerId"
            label="Manager"
            rules={[{ required: true, message: "Please select a manager!" }]}
          >
            <Select placeholder="Select a manager" optionFilterProp="children">
              {staffMembers.map((staff) => (
                <Select.Option key={staff.staffId} value={staff.staffId}>
                  {staff.name} ({staff.role})
                </Select.Option>
              ))}
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

export default ArtistsTable;
