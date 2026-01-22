import { Button, Card, Table } from "antd";
import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetMyRating } from "@/lib/pages/my-rating/request";
import { IDataRequestGetMyRating, IResponseGetMyRating } from "@/lib/pages/my-rating/type";
import dayjs from "dayjs";

const { Text } = Typography;

const MyRatingPage = () => {
  const [dataRequestGetMyRating, setDataRequestGetMyRating] = useState(baseDataRequestGetMyRating);
  const [data, setData] = useState<IResponseGetMyRating | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // const handleCopy = async () => {
  //   await navigator.clipboard.writeText(projectId);
  // };

  const fetchMyRating = async (req: IDataRequestGetMyRating) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const queryString = buildQueryParams(req);
      const url = `/api/ratings/project-identification${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: IResponseGetMyRating = await response.json();
        setData(result);
        setSuccess("Managers loaded successfully");
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch managers");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMyRating(dataRequestGetMyRating);
  }, []);

  console.log("My Ratings Data:", data);
  const COLUMNS_MY_RATING = [
    {
      title: "Project Identification",
      dataIndex: "project_id",
      key: "project_id",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => <span>{text ? dayjs(text).format("YYYY-MM-DD") : ""}</span>,
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      render: (text: boolean) => <span>{text ? "Yes" : "No"}</span>,
    },
  ];
  return (
    <div className="w-full flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-3xl text-center my-20">
        {/* Title */}
        <h1 className="text-[49px] font-medium mb-10 ">My Ratings</h1>

        {/* Top buttons */}
        <Card className="mb-10 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="large" className="w-full sm:w-1/2 h-12 bg-primary text-white">
              Generate Project Identification
            </Button>

            <Button size="large" className="w-full sm:w-1/2 h-12 border-primary text-primary">
              View Project Identification
            </Button>
          </div>
        </Card>

        {/* Project ID */}
        <div className="mb-10">
          <Table
            dataSource={data?.items}
            columns={COLUMNS_MY_RATING}
            bordered
            pagination={{
              total: data?.total || 0,
              pageSize: dataRequestGetMyRating.limit,
              current: dataRequestGetMyRating.page,
              onChange: (page) => {
                const newDataRequest = {
                  ...dataRequestGetMyRating,
                  page: page,
                };
                setDataRequestGetMyRating(newDataRequest);
                fetchMyRating(newDataRequest);
              },
            }}
          />
        </div>

        {/* Action buttons */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="large" className="w-full sm:w-40 h-11 border-primary text-primary">
            Save
          </Button>

          <Button
            size="large"
            icon={<CopyOutlined />}
            className=" bg-primary text-white w-full sm:w-56 h-11 flex items-center justify-center"
            onClick={handleCopy}
          >
            Copy To Clipboard
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default MyRatingPage;
