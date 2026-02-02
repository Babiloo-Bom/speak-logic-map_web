import { Card, Avatar, Rate, Tag, Button } from "antd";
import React from "react";
import Image from "next/image";
import { ProviderWithRelations } from "@/types/provider";

type Props = {
  providerData: ProviderWithRelations | null;
  nextStep: () => void;
};

const AboutProvider = (props: Props) => {
  const { providerData, nextStep } = props;

  if (!providerData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Provider information not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
      {/* Provider Header */}
      <div className="flex flex-col items-center mb-6">
        {providerData.image_url ? (
          <Image
            src={providerData.image_url}
            alt={providerData.name || "Provider"}
            width={120}
            height={120}
            className="rounded-full object-cover !w-[120px] !h-[120px] border-4 border-white shadow-lg"
          />
        ) : (
          <Avatar size={120} className="border-4 border-white shadow-lg">
            {providerData.name?.charAt(0)?.toUpperCase() || "P"}
          </Avatar>
        )}
        <h2 className="mt-4 text-2xl font-semibold">{providerData.name}</h2>
        {providerData.status && (
          <Tag
            color={
              providerData.status === "active"
                ? "green"
                : providerData.status === "pending"
                ? "orange"
                : providerData.status === "suspended"
                ? "red"
                : "default"
            }
            className="mt-2"
          >
            {providerData.status.toUpperCase()}
          </Tag>
        )}
      </div>

      {/* Provider Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-500 text-lg mb-2">Description</p>
          <p className="text-gray-800 font-medium leading-relaxed">
            {providerData.description || "No description available"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-lg mb-2">Current Rating</p>
          <div className="flex items-center gap-2">
            <Rate disabled value={providerData.rating || 0} allowHalf />
            <span className="font-medium text-lg">
              {providerData.rating ? providerData.rating.toFixed(1) : "0.0"}
            </span>
          </div>

          <p className="text-gray-500 text-lg mt-4 mb-2">The Given Set Applicable</p>
          <p className="font-medium text-lg text-primary">
            {providerData.is_applicable ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Functions & Problems Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {providerData.functions && providerData.functions.length > 0 && (
          <div>
            <p className="text-gray-500 text-lg mb-2">Functions Provided</p>
            <div className="flex flex-wrap gap-2">
              {providerData.functions.slice(0, 3).map((func) => (
                <Tag key={func.id} color="blue">
                  {func.name}
                </Tag>
              ))}
              {providerData.functions.length > 3 && (
                <Tag color="default">+{providerData.functions.length - 3} more</Tag>
              )}
            </div>
          </div>
        )}

        {providerData.problems && providerData.problems.length > 0 && (
          <div>
            <p className="text-gray-500 text-lg mb-2">Problems Solved</p>
            <div className="flex flex-wrap gap-2">
              {providerData.problems.slice(0, 3).map((problem) => (
                <Tag key={problem.id} color="purple">
                  {problem.name}
                </Tag>
              ))}
              {providerData.problems.length > 3 && (
                <Tag color="default">+{providerData.problems.length - 3} more</Tag>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          className="bg-primary hover:bg-primary px-8 py-2"
          onClick={nextStep}
        >
          Continue to Rating
        </Button>
      </div>
    </div>
  );
};

export default AboutProvider;

