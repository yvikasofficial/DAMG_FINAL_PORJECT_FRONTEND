import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  message,
  Popconfirm,
  Tag,
  Typography,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface Concert {
  concertId: number;
  name: string;
  date: string;
  time: string;
  ticketSalesLimit: number;
  status: "Scheduled" | "Completed" | "Canceled";
  description: string;
  venue: {
    venueId: number;
    name: string;
    location: string;
  };
  artist: {
    artistId: number;
    name: string;
    genre: string;
  };
  manager: {
    managerId: number;
    name: string;
  };
  streaming?: {
    platformId: number;
    name: string;
    url: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "blue";
    case "Completed":
      return "green";
    case "Canceled":
      return "red";
    default:
      return "default";
  }
};

const ConcertsPage: React.FC = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchConcerts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/concerts");
      if (!response.ok) throw new Error("Failed to fetch concerts");
      const data = await response.json();
      setConcerts(data);
    } catch (error) {
      message.error("Failed to fetch concerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleDelete = async (concertId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/concerts/${concertId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Concert deleted successfully");
        fetchConcerts();
      } else {
        message.error(data.message || "Failed to delete concert");
      }
    } catch (error) {
      message.error("Failed to delete concert");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2}>Concerts</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/concerts/create")}
        >
          Add Concert
        </Button>
      </div>

      <Spin spinning={loading} tip="Loading concerts...">
        <Row gutter={[16, 16]}>
          {concerts.map((concert) => (
            <Col xs={24} sm={12} lg={8} key={concert.concertId}>
              <Card
                hoverable
                className="h-full"
                cover={
                  <img
                    alt={concert.name}
                    src="/concert.jpg"
                    className="h-48 object-cover"
                  />
                }
                actions={[
                  <Popconfirm
                    title="Delete concert"
                    description="Are you sure you want to delete this concert?"
                    onConfirm={() => handleDelete(concert.concertId)}
                    okText="Yes"
                    cancelText="No"
                    disabled={concert.status === "Completed"}
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      type="text"
                      disabled={concert.status === "Completed"}
                    />
                  </Popconfirm>,
                ]}
              >
                <div className="mb-4">
                  <Tag color={getStatusColor(concert.status)} className="mb-2">
                    {concert.status}
                  </Tag>
                  <Title level={4} className="mb-0">
                    {concert.name}
                  </Title>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2" />
                    <Text>{dayjs(concert.date).format("MMMM D, YYYY")}</Text>
                  </div>

                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-2" />
                    <Text>{concert.time}</Text>
                  </div>

                  <div className="flex items-center">
                    <EnvironmentOutlined className="mr-2" />
                    <Text>
                      {concert.venue.name} ({concert.venue.location})
                    </Text>
                  </div>

                  <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    <Text>
                      {concert.artist.name} - {concert.artist.genre}
                    </Text>
                  </div>

                  <div className="flex items-center">
                    <TeamOutlined className="mr-2" />
                    <Text>{concert.manager.name}</Text>
                  </div>

                  {concert.streaming && (
                    <div className="flex items-center">
                      <VideoCameraOutlined className="mr-2" />
                      <a
                        href={concert.streaming.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {concert.streaming.name}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center">
                    <TeamOutlined className="mr-2" />
                    <Text>
                      {concert.ticketSalesLimit.toLocaleString()} tickets
                    </Text>
                  </div>

                  <div className="mt-4">
                    <Text type="secondary">{concert.description}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default ConcertsPage;
