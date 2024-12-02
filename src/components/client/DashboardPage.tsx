import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Typography,
  Tag,
  Rate,
  Divider,
} from "antd";
import {
  TrophyOutlined,
  TagOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface DashboardData {
  attendee: {
    name: string;
    loyaltyPoints: number;
    totalTickets: number;
    totalSpent: number;
    totalReviews: number;
    favoriteGenre: string;
  };
  upcomingConcerts: ConcertTicket[];
  pastConcerts: PastConcertTicket[];
}

interface ConcertTicket {
  ticketId: number;
  price: number;
  purchaseDate: string;
  ticketStatus: "ACTIVE" | "USED" | "CANCELLED";
  concert: {
    id: number;
    name: string;
    date: string;
    time: string;
    status: "Scheduled" | "Completed" | "Canceled";
  };
  venue: {
    name: string;
    location: string;
  };
  artist: {
    name: string;
    genre: string;
  };
}

interface PastConcertTicket extends ConcertTicket {
  feedback?: {
    rating: number;
    comment: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "USED":
      return "default";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (!userData.attendee?.id) {
          throw new Error("User ID not found");
        }

        const response = await fetch(
          `http://localhost:3000/api/concerts/attendee/${userData.attendee.id}/dashboard`
        );
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="p-6">
      <Spin spinning={loading}>
        {dashboardData && (
          <>
            <Title level={2}>Welcome, {dashboardData.attendee.name}!</Title>

            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Loyalty Points"
                    value={dashboardData.attendee.loyaltyPoints}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Tickets"
                    value={dashboardData.attendee.totalTickets}
                    prefix={<TagOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Spent"
                    value={dashboardData.attendee.totalSpent}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Favorite Genre"
                    value={dashboardData.attendee.favoriteGenre}
                    valueStyle={{ color: "#cf1322" }}
                  />
                </Card>
              </Col>
            </Row>

            <Title level={3}>Upcoming Concerts</Title>
            <Row gutter={[16, 16]} className="mb-6">
              {dashboardData.upcomingConcerts.map((ticket) => (
                <Col xs={24} md={12} key={ticket.ticketId}>
                  <Card>
                    <Title level={4}>{ticket.concert.name}</Title>
                    <Tag
                      color={getStatusColor(ticket.ticketStatus)}
                      className="mb-4"
                    >
                      {ticket.ticketStatus}
                    </Tag>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2" />
                        <Text>
                          {dayjs(ticket.concert.date).format("MMMM D, YYYY")}
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        <Text>{ticket.concert.time}</Text>
                      </div>
                      <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2" />
                        <Text>
                          {ticket.venue.name} ({ticket.venue.location})
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <UserOutlined className="mr-2" />
                        <Text>
                          {ticket.artist.name} - {ticket.artist.genre}
                        </Text>
                      </div>
                      <div className="mt-2">
                        <Text strong>Price: ${ticket.price.toFixed(2)}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Title level={3}>Concert History</Title>
            <Row gutter={[16, 16]}>
              {dashboardData.pastConcerts.map((ticket) => (
                <Col xs={24} md={12} key={ticket.ticketId}>
                  <Card>
                    <Title level={4}>{ticket.concert.name}</Title>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2" />
                        <Text>
                          {dayjs(ticket.concert.date).format("MMMM D, YYYY")}
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        <Text>{ticket.concert.time}</Text>
                      </div>
                      <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2" />
                        <Text>
                          {ticket.venue.name} ({ticket.venue.location})
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <UserOutlined className="mr-2" />
                        <Text>
                          {ticket.artist.name} - {ticket.artist.genre}
                        </Text>
                      </div>
                      {ticket.feedback && (
                        <>
                          <Divider />
                          <div>
                            <Text strong>Your Feedback</Text>
                            <div className="mt-2">
                              <Rate disabled value={ticket.feedback.rating} />
                              <Text className="block mt-2">
                                {ticket.feedback.comment}
                              </Text>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Spin>
    </div>
  );
};

export default DashboardPage;
