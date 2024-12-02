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
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Ticket Sales Progress</span>
                <span className="font-medium">
                  <TeamOutlined className="mr-2" />
                  {summary.ticketsSold} of {summary.ticketLimit} (
                  {Number(ticketSalesPercentage).toFixed(2)}%)
                </span>
              </div>
              <Progress
                percent={Number(
                  Number(Math.min(ticketSalesPercentage, 100)).toFixed(2)
                )}
                status={summary.isSoldOut ? "exception" : "active"}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                showInfo={true}
              />
            </div>
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};

export default ConcertSummary;
