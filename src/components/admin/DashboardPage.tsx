import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Typography,
  Table,
  Tag,
  Progress,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BankOutlined,
  DollarOutlined,
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
                <Card>
                  <Statistic
                    title="Total Concerts"
                    value={stats.totalConcerts}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card>
                  <Statistic
                    title="Upcoming Concerts"
                    value={stats.upcomingConcerts}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card>
                  <Statistic
                    title="Total Artists"
                    value={stats.totalArtists}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card>
                  <Statistic
                    title="Total Venues"
                    value={stats.totalVenues}
                    prefix={<BankOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card>
                  <Statistic
                    title="Total Staff"
                    value={stats.totalStaff}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8} xl={4}>
                <Card>
                  <Statistic
                    title="Streaming Platforms"
                    value={stats.totalStreamingPlatforms}
                    prefix={<VideoCameraOutlined />}
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
