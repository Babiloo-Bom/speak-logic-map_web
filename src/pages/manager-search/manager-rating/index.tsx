import { Button, message, Steps, theme } from "antd";
import React, { useState } from "react";
import AboutUser from "./_components/AboutUser/AboutUser";
const ManagerRating = () => {
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);

  const onChange = (value: number) => {
    setCurrentStep(value);
  };

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "About User",
      content: <AboutUser />,
    },
    {
      title: <span className="whitespace-nowrap">About Manager</span>,
      content: "Second-content",
    },
    {
      title: <span className="whitespace-nowrap">About Function and Problem</span>,
      content: "Last-content",
    },
    {
      title: <span className="whitespace-nowrap">About Feedback</span>,
      content: "Last-content",
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
