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
  DatePicker,
  Select,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const FACILITIES = [
  "Parking",
  "Sound System",
  "Lighting System",
  "Stage",
  "Dressing Rooms",
  "VIP Lounges",
  "Food Court",
  "Security System",
  "Backstage Area",
  "Technical Support",
];

interface Venue {
  venueId: number;
  name: string;
  location: string;
  capacity: number;
  availabilitySchedule: string;
  facilities: string;
}

const VenuesTable: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/venues");
      if (!response.ok) throw new Error("Failed to fetch venues");
      const data = await response.json();
      setVenues(data);
    } catch (error) {
      message.error("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreate = async (values: {
    name: string;
    location: string;
    capacity: number;
    availabilitySchedule: [dayjs.Dayjs, dayjs.Dayjs];
    facilities: string[];
  }) => {
    try {
      const formattedData = {
        ...values,
        availabilitySchedule: `${values.availabilitySchedule[0].format(
          "YYYY-MM-DD"
        )} - ${values.availabilitySchedule[1].format("YYYY-MM-DD")}`,
        facilities: values.facilities.join(", "),
      };

      const response = await fetch("http://localhost:3000/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Venue created successfully");
        setModalVisible(false);
        form.resetFields();
        fetchVenues();
      } else {
        message.error(data.message || "Failed to create venue");
      }
    } catch (error) {
      message.error("Failed to create venue");
    }
  };

  const handleDelete = async (venueId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/venues/${venueId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Venue deleted successfully");
        fetchVenues();
      } else {
        message.error(data.message || "Failed to delete venue");
      }
    } catch (error) {
      message.error("Failed to delete venue");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity: number) => capacity.toLocaleString(),
    },
    {
      title: "Availability Schedule",
      dataIndex: "availabilitySchedule",
      key: "availabilitySchedule",
      render: (schedule: string) => {
        const [startDate, endDate] = schedule.split(" - ");
        return (
          <span>
            {dayjs(startDate).format("MMM D, YYYY")} -{" "}
            {dayjs(endDate).format("MMM D, YYYY")}
          </span>
        );
      },
    },
    {
      title: "Facilities",
      dataIndex: "facilities",
      key: "facilities",
      render: (facilities: string) => (
        <div>
          {facilities.split(", ").map((facility, index) => (
            <div key={index}>{facility}</div>
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Venue) => (
        <div className="space-x-2">
          <Popconfirm
            title="Delete venue"
            description="Are you sure you want to delete this venue?"
            onConfirm={() => handleDelete(record.venueId)}
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
        <h1 className="text-2xl font-bold">Venues Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Venue
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={venues}
        loading={loading}
        rowKey="venueId"
      />

      <Modal
        title="Add Venue"
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
            label="Venue Name"
            rules={[{ required: true, message: "Please input venue name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please input location!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: "Please input capacity!" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              formatter={(value) =>
                String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            name="availabilitySchedule"
            label="Availability Schedule"
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
            name="facilities"
            label="Facilities"
            rules={[{ required: true, message: "Please select facilities!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select facilities"
              style={{ width: "100%" }}
              options={FACILITIES.map((facility) => ({
                label: facility,
                value: facility,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Venue
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VenuesTable;
