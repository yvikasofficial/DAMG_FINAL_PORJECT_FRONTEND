import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Spin,
} from "antd";
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

interface Concert {
  id: number;
  name: string;
  date: string;
  time: string;
  ticketSalesLimit: number;
  status: string;
  description: string;
  venue: {
    venueId: number;
    name: string;
  };
  artist: {
    artistId: number;
    name: string;
  };
  manager: {
    managerId: number;
    name: string;
  };
  streaming?: {
    platformId: number;
    name: string;
  };
}

const CONCERT_STATUS = ["Scheduled", "Completed", "Canceled"];

const EditConcertPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [streamingPlatforms, setStreamingPlatforms] = useState<
    StreamingPlatform[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [concertRes, venuesRes, artistsRes, staffRes, streamingRes] =
          await Promise.all([
            fetch(`http://localhost:3000/api/concerts/${id}`),
            fetch("http://localhost:3000/api/venues"),
            fetch("http://localhost:3000/api/artists"),
            fetch("http://localhost:3000/api/staff"),
            fetch("http://localhost:3000/api/streaming"),
          ]);

        if (!concertRes.ok) throw new Error("Concert not found");

        const [concert, venuesData, artistsData, staffData, streamingData] =
          await Promise.all([
            concertRes.json(),
            venuesRes.json(),
            artistsRes.json(),
            staffRes.json(),
            streamingRes.json(),
          ]);

        setVenues(venuesData);
        setArtists(artistsData);
        const managersData = staffData
          .filter((staff: any) => staff.role.toLowerCase().includes("manager"))
          .map((manager: any) => ({
            managerId: manager.staffId,
            name: `${manager.name} (${manager.role})`,
          }));
        setManagers(managersData);
        setStreamingPlatforms(streamingData);

        // Set initial form values
        form.setFieldsValue({
          name: concert.name,
          date: dayjs(concert.date),
          time: dayjs(concert.time, "HH:mm"),
          venueId: concert.venue.venueId,
          artistId: concert.artist.artistId,
          managerId: concert.manager.managerId,
          ticketSalesLimit: concert.ticketSalesLimit,
          status: concert.status,
          streamingId: concert.streaming?.platformId,
          description: concert.description,
        });
      } catch (error) {
        message.error("Failed to fetch concert data");
        navigate("/admin/concerts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, navigate]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const formattedData = {
        ...values,
        date: dayjs(values.date).format("YYYY-MM-DD"),
        time: dayjs(values.time).format("HH:mm"),
      };

      const response = await fetch(`http://localhost:3000/api/concerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update concert");
      }

      message.success("Concert updated successfully");
      navigate(`/admin/concerts/${id}`);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to update concert"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Edit Concert</Title>

      <Spin spinning={loading}>
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
              rules={[
                { required: true, message: "Please input concert name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select date!" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Please select time!" }]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>

            <Form.Item
              name="venueId"
              label="Venue"
              rules={[{ required: true, message: "Please select venue!" }]}
            >
              <Select placeholder="Select venue">
                {venues.map((venue) => (
                  <Select.Option key={venue.venueId} value={venue.venueId}>
                    {venue.name} - {venue.location}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="artistId"
              label="Artist"
              rules={[{ required: true, message: "Please select artist!" }]}
            >
              <Select placeholder="Select artist">
                {artists.map((artist) => (
                  <Select.Option key={artist.artistId} value={artist.artistId}>
                    {artist.name} - {artist.genre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="managerId"
              label="Manager"
              rules={[{ required: true, message: "Please select manager!" }]}
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
              <Button type="primary" htmlType="submit" loading={submitting}>
                Update Concert
              </Button>
              <Button
                className="ml-2"
                onClick={() => navigate(`/admin/concerts/${id}`)}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default EditConcertPage;
