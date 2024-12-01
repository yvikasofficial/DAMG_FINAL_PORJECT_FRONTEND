import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Tag,
  Button,
  Descriptions,
  message,
  Divider,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  RollbackOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Concert {
  id: number;
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

const ConcertPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/concerts/${id}`
        );
        if (!response.ok) throw new Error("Concert not found");
        const data = await response.json();
        setConcert(data);
      } catch (error) {
        message.error("Failed to fetch concert details");
        navigate("/admin/concerts");
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/concerts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete concert");

      message.success("Concert deleted successfully");
      navigate("/admin/concerts");
    } catch (error) {
      message.error("Failed to delete concert");
    }
  };

  return (
    <div className="p-6">
      <Space className="mb-4">
        <Button
          icon={<RollbackOutlined />}
          onClick={() => navigate("/admin/concerts")}
        >
          Back to Concerts
        </Button>
      </Space>

      <Spin spinning={loading}>
        {concert && (
          <>
            <Card
              className="mb-4"
              cover={
                <div style={{ height: "300px", overflow: "hidden" }}>
                  <img
                    alt={concert.name}
                    src="/concert.jpg"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                </div>
              }
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} className="mb-2">
                    {concert.name}
                  </Title>
                  <Tag color={getStatusColor(concert.status)} className="mb-4">
                    {concert.status}
                  </Tag>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/admin/concerts/edit/${id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                      disabled={concert.status === "Completed"}
                    >
                      Delete
                    </Button>
                  </Space>
                </Col>
              </Row>

              <Divider />

              <Descriptions
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined className="mr-2" />
                      Date
                    </>
                  }
                >
                  {dayjs(concert.date).format("MMMM D, YYYY")}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <ClockCircleOutlined className="mr-2" />
                      Time
                    </>
                  }
                >
                  {concert.time}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <EnvironmentOutlined className="mr-2" />
                      Venue
                    </>
                  }
                >
                  {concert.venue.name} ({concert.venue.location})
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined className="mr-2" />
                      Artist
                    </>
                  }
                >
                  {concert.artist.name} - {concert.artist.genre}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <TeamOutlined className="mr-2" />
                      Manager
                    </>
                  }
                >
                  {concert.manager.name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <TeamOutlined className="mr-2" />
                      Ticket Sales Limit
                    </>
                  }
                >
                  {concert.ticketSalesLimit}
                </Descriptions.Item>
                {concert.streaming && (
                  <Descriptions.Item
                    label={
                      <>
                        <VideoCameraOutlined className="mr-2" />
                        Streaming Platform
                      </>
                    }
                  >
                    <a
                      href={concert.streaming.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {concert.streaming.name}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider />

              <div className="mt-6">
                <Title level={4}>Description</Title>
                <Card className="mt-4 bg-gray-50">
                  <Text>{concert.description}</Text>
                </Card>
              </div>
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ConcertPage;
