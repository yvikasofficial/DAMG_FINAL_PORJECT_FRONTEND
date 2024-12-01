import { useState, useEffect } from "react";
import { Card, List, Tag, Button, message, Spin } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Ticket {
  id: number;
  price: number;
  purchaseDate: string;
  status: string;
  concert: {
    name: string;
    date: string;
    time: string;
    venue: {
      name: string;
      location: string;
    };
  };
}

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const response = await fetch(
        `http://localhost:3000/api/tickets/attendee/${userData.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      message.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancelTicket = async (ticketId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tickets/${ticketId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to cancel ticket");

      message.success("Ticket cancelled successfully");
      fetchTickets();
    } catch (error) {
      message.error("Failed to cancel ticket");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={tickets}
          renderItem={(ticket) => (
            <List.Item>
              <Card
                title={ticket.concert.name}
                extra={
                  <Tag color={ticket.status === "ACTIVE" ? "green" : "red"}>
                    {ticket.status}
                  </Tag>
                }
                actions={[
                  <Button
                    danger
                    onClick={() => handleCancelTicket(ticket.id)}
                    disabled={ticket.status !== "ACTIVE"}
                  >
                    Cancel Ticket
                  </Button>,
                ]}
              >
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <CalendarOutlined />
                    {dayjs(ticket.concert.date).format("MMMM D, YYYY")}
                  </p>
                  <p className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    {ticket.concert.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <EnvironmentOutlined />
                    {ticket.concert.venue.name} ({ticket.concert.venue.location}
                    )
                  </p>
                  <p className="font-semibold">
                    Price: ${ticket.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Purchased:{" "}
                    {dayjs(ticket.purchaseDate).format("MMM D, YYYY HH:mm")}
                  </p>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default TicketsPage;
