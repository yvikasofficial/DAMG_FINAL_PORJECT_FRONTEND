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
  RollbackOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Feedback from "../Feedback";

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
  price: number;
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

interface ConcertPageProps {
  isClientView?: boolean;
}

const ConcertPage: React.FC<ConcertPageProps> = ({ isClientView = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  console.log("====================================");
  console.log(concert);
  console.log("====================================");
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
        navigate(isClientView ? "/concerts" : "/admin/concerts");
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
  }, [id, navigate, isClientView]);

  useEffect(() => {
    const checkTicket = async () => {
      if (!isClientView) return;

      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (!userData.attendee) return;

        const response = await fetch(
          `http://localhost:3000/api/tickets/concert/${id}/attendee/${userData.attendee.id}`
        );

        if (response.ok) {
          const ticket = await response.json();
          setHasTicket(true);
          setTicketId(ticket.id);
        }
      } catch (error) {
        // If ticket not found, that's okay
        setHasTicket(false);
        setTicketId(null);
      }
    };

    if (concert) {
      checkTicket();
    }
  }, [id, concert, isClientView]);

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

  const handleBookTicket = async () => {
    setTicketLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (!concert) {
        throw new Error("Concert data not available");
      }

      if (!userData.attendee) {
        throw new Error("User data not available");
      }

      const response = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concertId: concert.id,
          attendeeId: userData.attendee.id,
          price: concert.price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book ticket");
      }

      const ticket = await response.json();
      setHasTicket(true);
      setTicketId(ticket.id);
      message.success("Ticket booked successfully!");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Failed to book ticket");
      }
    } finally {
      setTicketLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    setTicketLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/tickets/${ticketId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to cancel ticket");

      setHasTicket(false);
      setTicketId(null);
      message.success("Ticket cancelled successfully");
    } catch (error) {
      message.error("Failed to cancel ticket");
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Space className="mb-4">
        <Button
          icon={<RollbackOutlined />}
          onClick={() =>
            navigate(isClientView ? "/concerts" : "/admin/concerts")
          }
        >
          Back to Concerts
        </Button>
      </Space>

      <Spin spinning={loading}>
        {concert && (
          <>
            <Card className="mb-4">
              <div
                style={{
                  height: "300px",
                  overflow: "hidden",
                  marginTop: "-24px",
                  marginLeft: "-24px",
                  marginRight: "-24px",
                }}
              >
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

              <Row justify="space-between" align="middle" className="mt-4">
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
                    {isClientView ? (
                      <Button
                        type={hasTicket ? "default" : "primary"}
                        size="large"
                        onClick={
                          hasTicket ? handleCancelTicket : handleBookTicket
                        }
                        loading={ticketLoading}
                        danger={hasTicket}
                      >
                        {hasTicket ? "Cancel Ticket" : "Book Ticket"}
                      </Button>
                    ) : (
                      <>
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
                      </>
                    )}
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
                {!isClientView && (
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
                )}
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
              </Descriptions>

              <Divider />

              <div>
                <Title level={4}>Description</Title>
                <Text>{concert.description}</Text>
              </div>
            </Card>

            <Feedback
              concertId={parseInt(id ?? "")}
              isClientView={isClientView}
            />
          </>
        )}
      </Spin>
    </div>
  );
};

export default ConcertPage;
