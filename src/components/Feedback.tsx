import { useState, useEffect } from "react";
import {
  Card,
  Rate,
  Input,
  Button,
  List,
  Avatar,
  message,
  Popconfirm,
} from "antd";
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

interface FeedbackItem {
  id: number;
  concertId: number;
  attendeeId: number;
  rating: number;
  comments: string;
  createdDate: string;
  attendeeName: string;
  concertName: string;
}

interface FeedbackProps {
  concertId: number;
  isClientView?: boolean;
}

const Feedback: React.FC<FeedbackProps> = ({
  concertId,
  isClientView = false,
}) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/feedback/concert/${concertId}`
      );
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      message.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [concertId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning("Please provide a rating");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concertId,
          attendeeId: 1, // This should come from auth context
          rating,
          comments: comment.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      message.success("Feedback submitted successfully");
      setRating(0);
      setComment("");
      fetchFeedback();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (feedbackId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/feedback/${feedbackId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete feedback");

      message.success("Feedback deleted successfully");
      fetchFeedback();
    } catch (error) {
      message.error("Failed to delete feedback");
    }
  };

  return (
    <Card title="Concert Feedback" className="mt-4">
      {isClientView && (
        <div className="mb-4">
          <div className="mb-2">
            <Rate value={rating} onChange={setRating} />
          </div>
          <TextArea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about the concert..."
            className="mb-2"
          />
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={rating === 0}
          >
            Submit Feedback
          </Button>
        </div>
      )}

      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={feedbacks}
        renderItem={(item) => (
          <List.Item
            actions={
              !isClientView
                ? [
                    <Popconfirm
                      title="Delete feedback"
                      description="Are you sure you want to delete this feedback?"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button icon={<DeleteOutlined />} danger type="text" />
                    </Popconfirm>,
                  ]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <div className="flex items-center gap-2">
                  <span>{item.attendeeName}</span>
                  <Rate disabled value={item.rating} />
                </div>
              }
              description={
                <div>
                  <p>{item.comments}</p>
                  <small className="text-gray-500">
                    {dayjs(item.createdDate).format("MMM D, YYYY HH:mm")}
                  </small>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Feedback;
