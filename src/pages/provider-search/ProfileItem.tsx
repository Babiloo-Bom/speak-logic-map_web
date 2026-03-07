import { useState } from "react";
import { Button, Skeleton } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { ProviderItem } from "@/lib/pages/provider-search/types";
import ShowMapModal from "./ShowMapModal";

const DESC_MAX_LENGTH = 120;

interface Props {
  data?: ProviderItem;
}

export default function ProfileItem({ data }: Props) {
  const [showMapOpen, setShowMapOpen] = useState(false);

  const handleShowMap = () => {
    if (data?.id) {
      setShowMapOpen(true);
    }
  };

  const handleCloseMap = () => setShowMapOpen(false);

  const displayUrl = data?.url || data?.website_url || "";
  const functionLabel = data?.function || data?.functions?.[0]?.name || "";
  const problemLabel = data?.problems?.[0]?.name || "";
  const givenSetApplicable = data?.is_applicable ?? data?.is_given_set ?? false;
  const description = data?.description || "";
  const truncatedDesc =
    description.length > DESC_MAX_LENGTH
      ? `${description.slice(0, DESC_MAX_LENGTH).trim()}...`
      : description;

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-[#CCCCCC] border-solid shadow-sm p-5 flex flex-col">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton.Button active block className="mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#CCCCCC] border-solid shadow-sm p-5 flex flex-col">
      {/* URL (blue link) */}
      {displayUrl && (
        <a
          href={displayUrl.startsWith("http") ? displayUrl : `https://${displayUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm mb-2 block break-all"
        >
          {displayUrl}
        </a>
      )}

      {/* Description + See More */}
      {description && (
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {truncatedDesc}
          {description.length > DESC_MAX_LENGTH && (
            <button
              type="button"
              onClick={handleShowMap}
              className="text-blue-600 hover:underline ml-1 font-medium"
            >
              See More
            </button>
          )}
        </p>
      )}

      {/* Function Provided (value green) */}
      <p className="text-sm mb-1.5">
        <span className="text-gray-600">Function Provided</span>{" "}
        <span className="text-green-600 font-medium">{functionLabel || "—"}</span>
      </p>

      {/* Problem Solved (value red) */}
      <p className="text-sm mb-1.5">
        <span className="text-gray-600">Problem Solved</span>{" "}
        <span className="text-red-600 font-medium">{problemLabel || "—"}</span>
      </p>

      {/* The Given Set Applicable (checkmark) */}
      <p className="text-sm mb-4 flex items-center gap-2">
        <span className="text-gray-600">The Given Set Applicable</span>
        {givenSetApplicable ? (
          <CheckOutlined className="text-green-600" />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </p>

      {/* Show Map button */}
      <div className="mt-auto pt-2">
        <Button
          block
          size="large"
          className="bg-[#324899] text-white hover:!bg-[#324899]/90 border-0"
          onClick={handleShowMap}
          disabled={!data?.id}
        >
          Show Map
        </Button>
      </div>

      <ShowMapModal
        open={showMapOpen}
        onClose={handleCloseMap}
        provider={data}
      />
    </div>
  );
}
