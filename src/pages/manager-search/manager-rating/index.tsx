import { Button, message, Steps, theme } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";
import AboutUser from "./_components/AboutUser/AboutUser";
import { baseDataRequestRating } from "./request";
import AboutManager from "./_components/AboutManager/AboutManager";
import AboutFunction from "./_components/AboutFunction/AboutFunction";
import AboutFeedback from "./_components/AboutFeedback/AboutFeedback";
import { IDataRequestRating } from "./type";
import { getAuthToken } from "@/utils/constants";
import dayjs from "dayjs";

const ManagerRating = () => {
  const router = useRouter();
  const { managerId } = router.query;
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);
  const [dataRequestRating, setDataRequestRating] = useState(baseDataRequestRating);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRatingManager = async (req: IDataRequestRating) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }
      const newRequest = {
        ...req,
        function_execution_date: req.function_execution_date ? dayjs(req.function_execution_date).format("YYYY-MM-DD") : "",
      };

      const url = `/api/managers/${managerId}/rating`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        router.push("/manager-search");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch managers");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Fetch error:", error);
    }
  };

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    fetchRatingManager(dataRequestRating);
  };

  const steps = [
    {
      title: "About User",
      content: <AboutUser dataRequestRating={dataRequestRating} setDataRequestRating={setDataRequestRating} nextStep={next} />,
    },
    {
      title: <span className="whitespace-nowrap">About Manager</span>,
      content: <AboutManager dataRequestRating={dataRequestRating} setDataRequestRating={setDataRequestRating} nextStep={next} prevStep={prev} />,
    },
    {
      title: <span className="whitespace-nowrap">About Function and Problem</span>,
      content: <AboutFunction dataRequestRating={dataRequestRating} setDataRequestRating={setDataRequestRating} nextStep={next} prevStep={prev} />,
    },
    {
      title: <span className="whitespace-nowrap">About Feedback</span>,
      content: <AboutFeedback dataRequestRating={dataRequestRating} setDataRequestRating={setDataRequestRating} handleSubmit={handleSubmit} prevStep={prev} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    // backgroundColor: token.colorFillAlter,
    // borderRadius: token.borderRadiusLG,
    // border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  return (
    <div className="mx-12 mt-6">
      <div className="w-full flex items-center justify-center text-4xl font-semibold mb-8">Manager Rating</div>

      <Steps current={currentStep} labelPlacement="vertical" items={items} className="manager-steps" />

      <div style={contentStyle}>{steps[currentStep].content}</div>
      {/* <div style={{ marginTop: 24 }}>
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success("Processing complete!")}>
            Done
          </Button>
        )}
        {currentStep > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div> */}
    </div>
  );
};

export default ManagerRating;
