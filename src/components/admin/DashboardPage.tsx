import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, Typography, Table, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BankOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie as RechartsPane,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";

const { Title } = Typography;

interface DashboardStats {
  totalConcerts: number;
  upcomingConcerts: number;
  totalArtists: number;
  totalVenues: number;
  totalStaff: number;
  totalStreamingPlatforms: number;
  recentConcerts: Array<{
    concertId: number;
    name: string;
    date: string;
    status: string;
    venue: { name: string };
  }>;
  concertsByMonth: Array<{
    month: string;
    count: number;
  }>;
  concertStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const CARD_STYLES = {
  totalConcerts: {
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  upcomingConcerts: {
    background: "linear-gradient(135deg, #4158D0 0%, #C850C0 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  totalArtists: {
    background: "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  totalVenues: {
    background: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  totalStaff: {
    background: "linear-gradient(135deg, #FEC163 0%, #DE4313 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  streaming: {
    background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
    icon: { color: "rgba(255, 255, 255, 0.8)" },
    text: { color: "#fff" },
  },
  common: {
    height: "160px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  } as const,
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all required data
        const [concertsRes, artistsRes, venuesRes, staffRes, streamingRes] =
          await Promise.all([
            fetch("http://localhost:3000/api/concerts"),
            fetch("http://localhost:3000/api/artists"),
            fetch("http://localhost:3000/api/venues"),
            fetch("http://localhost:3000/api/staff"),
            fetch("http://localhost:3000/api/streaming"),
          ]);

        const [concerts, artists, venues, staff, streamingPlatforms] =
          await Promise.all([
            concertsRes.json(),
            artistsRes.json(),
            venuesRes.json(),
            staffRes.json(),
            streamingRes.json(),
          ]);

        // Process concerts data
        const today = dayjs();
        const upcomingConcerts = concerts.filter((concert: any) =>
          dayjs(concert.date).isAfter(today)
        );

        // Group concerts by month
        const concertsByMonth = concerts.reduce((acc: any, concert: any) => {
          const month = dayjs(concert.date).format("MMMM YYYY");
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        // Calculate status distribution
        const statusDistribution = concerts.reduce((acc: any, concert: any) => {
          acc[concert.status] = (acc[concert.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalConcerts: concerts.length,
          upcomingConcerts: upcomingConcerts.length,
          totalArtists: artists.length,
          totalVenues: venues.length,
          totalStaff: staff.length,
          totalStreamingPlatforms: streamingPlatforms.length,
          recentConcerts: concerts
            .sort((a: any, b: any) => dayjs(b.date).diff(dayjs(a.date)))
            .slice(0, 5),
          concertsByMonth: Object.entries(concertsByMonth).map(
            ([month, count]) => ({
              month,
              count: count as number,
            })
          ),
          concertStatusDistribution: Object.entries(statusDistribution).map(
            ([status, count]) => ({
              status,
              count: count as number,
            })
          ),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const recentConcertsColumns = [
    {
      title: "Concert Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Venue",
      dataIndex: ["venue", "name"],
      key: "venue",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>Dashboard</Title>

      <Spin spinning={loading}>
        {stats && (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.totalConcerts,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.totalConcerts.text}>
                        Total Concerts
                      </span>
                    }
                    value={stats.totalConcerts}
                    prefix={
                      <CalendarOutlined
                        style={CARD_STYLES.totalConcerts.icon}
                      />
                    }
                    valueStyle={{
                      ...CARD_STYLES.totalConcerts.text,
                      fontSize: "28px",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.upcomingConcerts,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.upcomingConcerts.text}>
                        Upcoming Concerts
                      </span>
                    }
                    value={stats.upcomingConcerts}
                    prefix={
                      <CalendarOutlined
                        style={CARD_STYLES.upcomingConcerts.icon}
                      />
                    }
                    valueStyle={CARD_STYLES.upcomingConcerts.text}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.totalArtists,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.totalArtists.text}>
                        Total Artists
                      </span>
                    }
                    value={stats.totalArtists}
                    prefix={
                      <UserOutlined style={CARD_STYLES.totalArtists.icon} />
                    }
                    valueStyle={CARD_STYLES.totalArtists.text}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.totalVenues,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.totalVenues.text}>
                        Total Venues
                      </span>
                    }
                    value={stats.totalVenues}
                    prefix={
                      <BankOutlined style={CARD_STYLES.totalVenues.icon} />
                    }
                    valueStyle={CARD_STYLES.totalVenues.text}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.totalStaff,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.totalStaff.text}>
                        Total Staff
                      </span>
                    }
                    value={stats.totalStaff}
                    prefix={
                      <TeamOutlined style={CARD_STYLES.totalStaff.icon} />
                    }
                    valueStyle={CARD_STYLES.totalStaff.text}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card
                  style={{
                    ...CARD_STYLES.streaming,
                    ...CARD_STYLES.common,
                  }}
                  bodyStyle={{
                    padding: "24px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Statistic
                    title={
                      <span style={CARD_STYLES.streaming.text}>
                        Streaming Platforms
                      </span>
                    }
                    value={stats.totalStreamingPlatforms}
                    prefix={
                      <VideoCameraOutlined style={CARD_STYLES.streaming.icon} />
                    }
                    valueStyle={CARD_STYLES.streaming.text}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Concerts by Month">
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={stats.concertsByMonth}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Number of Concerts"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Concert Status Distribution">
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <RechartsPane
                          data={stats.concertStatusDistribution}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                        >
                          {stats.concertStatusDistribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </RechartsPane>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="Recent Concerts" className="mt-6">
              <Table
                dataSource={stats.recentConcerts}
                columns={recentConcertsColumns}
                pagination={false}
                rowKey="concertId"
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default DashboardPage;
