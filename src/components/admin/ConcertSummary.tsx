import { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Progress, Spin, message } from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  TagOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

interface ConcertSummaryInterface {
  name: string;
  date: string;
  time: string;
  currentPrice: number;
  ticketLimit: number;
  ticketsSold: number;
  sponsorCount: number;
  totalRevenue: number;
  isSoldOut: boolean;
}

interface ConcertSummaryProps {
  concertId: number;
  isClientView?: boolean;
}

const ConcertSummary: React.FC<ConcertSummaryProps> = ({
  concertId,
  isClientView = false,
}) => {
  const [summary, setSummary] = useState<ConcertSummaryInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/concerts/${concertId}/summary`
        );
        if (!response.ok) throw new Error("Failed to fetch summary");
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        message.error("Failed to load concert summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [concertId]);

  if (!summary) return null;

  const ticketSalesPercentage =
    (summary.ticketsSold / summary.ticketLimit) * 100;

  return (
    <Card title="Concert Summary" className="mb-4">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Current Ticket Price"
              value={summary.currentPrice}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Col>

          {!isClientView && (
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Revenue"
                value={summary.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
          )}

          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Sponsors"
              value={summary.sponsorCount}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Tickets Sold"
              value={summary.ticketsSold}
              prefix={<TagOutlined />}
              suffix={`/ ${summary.ticketLimit}`}
              valueStyle={{ color: summary.isSoldOut ? "#cf1322" : "#1890ff" }}
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col span={24}>
            <div>
              <div className="flex justify-between mb-2">
                <span>Ticket Sales Progress</span>
                <span>
                  <TeamOutlined className="mr-2" />
                  {ticketSalesPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                percent={ticketSalesPercentage}
                status={summary.isSoldOut ? "exception" : "active"}
                showInfo={false}
              />
            </div>
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};

export default ConcertSummary;
