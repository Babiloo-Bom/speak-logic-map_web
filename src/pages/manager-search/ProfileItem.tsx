import { Button, Skeleton } from "antd";
import Image from "next/image";
import { ManagerItem } from "./types";

interface Props {
  data?: ManagerItem;
}

export default function ProfileItem({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton.Avatar active size={56} shape="circle" />

        <div className="flex-1">
          <Skeleton active loading={!data} title={{ width: "60%" }} paragraph={false}>
            <h3 className="font-semibold text-gray-800">{data?.name}</h3>
          </Skeleton>

          <Skeleton active loading={!data} title={{ width: "40%" }} paragraph={false}>
            <div className="text-yellow-400 text-sm">{"★".repeat(data?.rating || 0)}</div>
          </Skeleton>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2 text-sm">
        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">Function Provided:</span> <span className="text-blue-600">{data?.function}</span>
          </p>
        </Skeleton>

        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">Expertise:</span> <span className="text-blue-600">{data?.expertise}</span>
          </p>
        </Skeleton>

        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">The Given Set Applicable:</span>{" "}
            <span className="text-blue-600">{data?.is_given_set ? "Yes" : "No"}</span>
          </p>
        </Skeleton>
      </div>

      {/* Button */}
      <div className="mt-auto pt-4">
        <Button loading={!data} block size="large" className="bg-primary text-white">
          More Details
        </Button>
      </div>
    </div>
  );
}
