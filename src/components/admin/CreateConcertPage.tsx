import { useState, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
  Button,
  message,
  Card,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

interface Venue {
  venueId: number;
  name: string;
  location: string;
}

interface Artist {
  artistId: number;
  name: string;
  genre: string;
}

interface Manager {
  managerId: number;
  name: string;
}

interface StreamingPlatform {
  platformId: number;
  name: string;
  url: string;
}

interface StaffMember {
  staffId: number;
  name: string;
  role: string;
  contactInfo: string;
}

const CONCERT_STATUS = ["Scheduled", "Completed", "Canceled"];

const CreateConcertPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [streamingPlatforms, setStreamingPlatforms] = useState<
    StreamingPlatform[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venuesRes, artistsRes, staffRes, streamingRes] =
          await Promise.all([
            fetch("http://localhost:3000/api/venues"),
            fetch("http://localhost:3000/api/artists"),
            fetch("http://localhost:3000/api/staff"),
            fetch("http://localhost:3000/api/streaming"),
          ]);

        if (
          !venuesRes.ok ||
          !artistsRes.ok ||
          !staffRes.ok ||
          !streamingRes.ok
        ) {
          throw new Error("One or more requests failed");
        }

        const [venuesData, artistsData, staffData, streamingData] =
          await Promise.all([
            venuesRes.json(),
            artistsRes.json(),
            staffRes.json(),
            streamingRes.json(),
          ]);

        setVenues(venuesData);
        setArtists(artistsData);
        setStreamingPlatforms(streamingData);

        const managersData = staffData
          .filter((staff: StaffMember) =>
            staff.role.toLowerCase().includes("manager")
          )
          .map((manager: StaffMember) => ({
            managerId: manager.staffId,
            name: `${manager.name} (${manager.role})`,
          }));

        setManagers(managersData);
      } catch (error) {
        message.error("Failed to fetch required data");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formattedData = {
        ...values,
        date: dayjs(values.date).format("YYYY-MM-DD"),
        time: dayjs(values.time).format("HH:mm"),
        ticketSalesLimit: parseInt(values.ticketSalesLimit),
        managerId: parseInt(values.managerId),
        venueId: parseInt(values.venueId),
        artistId: parseInt(values.artistId),
        streamingId: values.streamingId
          ? parseInt(values.streamingId)
          : undefined,
      };

      const response = await fetch("http://localhost:3000/api/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Concert created successfully");
        navigate("/admin/concerts");
      } else {
        throw new Error(data.message || "Failed to create concert");
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to create concert"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Create New Concert</Title>
      <Card className="mt-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl"
        >
          <Form.Item
            name="name"
            label="Concert Name"
            rules={[{ required: true, message: "Please input concert name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            label="Concert Date"
            rules={[{ required: true, message: "Please select concert date!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="time"
            label="Concert Time"
            rules={[{ required: true, message: "Please select concert time!" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="venueId"
            label="Venue"
            rules={[{ required: true, message: "Please select a venue!" }]}
          >
            <Select placeholder="Select venue">
              {venues.map((venue) => (
                <Select.Option key={venue.venueId} value={venue.venueId}>
                  {venue.name} ({venue.location})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="artistId"
            label="Artist"
            rules={[{ required: true, message: "Please select an artist!" }]}
          >
            <Select placeholder="Select artist">
              {artists.map((artist) => (
                <Select.Option key={artist.artistId} value={artist.artistId}>
                  {artist.name} ({artist.genre})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="managerId"
            label="Manager"
            rules={[{ required: true, message: "Please select a manager!" }]}
          >
            <Select placeholder="Select manager">
              {managers.map((manager) => (
                <Select.Option
                  key={manager.managerId}
                  value={manager.managerId}
                >
                  {manager.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ticketSalesLimit"
            label="Ticket Sales Limit"
            rules={[
              { required: true, message: "Please input ticket sales limit!" },
            ]}
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
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select placeholder="Select status">
              {CONCERT_STATUS.map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="streamingId" label="Streaming Platform">
            <Select placeholder="Select streaming platform" allowClear>
              {streamingPlatforms.map((platform) => (
                <Select.Option
                  key={platform.platformId}
                  value={platform.platformId}
                >
                  {platform.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Concert
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateConcertPage;
