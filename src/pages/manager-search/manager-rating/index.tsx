import { Steps } from "antd";
import React, { useState } from "react";

const ManagerRating = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const onChange = (value: number) => {
    console.log("onChange:", value);
    setCurrentStep(value);
  };
  const description = "This is a description.";

  return (
    <div className="mx-12 mt-6">
      <div className="w-full flex items-center justify-center text-4xl font-semibold mb-8">Manager Rating</div>

      <Steps
        current={currentStep}
        onChange={onChange}
        items={[
          {
            title: "About User",
            description,
          },
          {
            title: "About Manager",
            description,
          },
          {
            title: "About Function And Problem",
            description,
          },
          {
            title: "About Feedback",
            description,
          },
        ]}
      />
    </div>
  );
};

export default ManagerRating;
