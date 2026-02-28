import { Button, Rate, Skeleton } from "antd";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProviderItem } from "@/lib/pages/provider-search/types";
import DEFAULT_AVATAR from "@/assets/images/user.jpg";

interface Props {
  data?: ProviderItem;
}

export default function ProfileItem({ data }: Props) {
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string | StaticImageData>(DEFAULT_AVATAR);

  useEffect(() => {
    if (data?.image_url) {
      setAvatarSrc(data.image_url);
    } else {
      setAvatarSrc(DEFAULT_AVATAR);
    }
  }, [data?.image_url]);

  const handleViewDetails = () => {
    if (data?.id) {
      router.push(`/provider-search/provider-detail?providerId=${data.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#CCCCCC] border-solid shadow-sm p-5 flex flex-col">
      {/* Header */}
      <div className="flex gap-4">
        {!data ? (
          <Skeleton.Avatar active size={56} shape="circle" />
        ) : (
          <Image
            src={avatarSrc}
            alt={data?.name || "avatar"}
            width={65}
            height={65}
            className="rounded-full object-cover !w-[65px] !h-[65px]"
            onError={() => setAvatarSrc(DEFAULT_AVATAR)}
          />
        )}

        <div className="flex-1">
          <Skeleton active loading={!data} title={{ width: "60%" }} paragraph={false}>
            <h3 className="font-semibold text-gray-800">{data?.name}</h3>
          </Skeleton>

          <Skeleton active loading={!data} title={{ width: "40%" }} paragraph={false}>
            <Rate disabled value={data?.rating || 0} allowHalf={true} />
            {/* <div className="text-yellow-400 text-sm">{"★".repeat(data?.rating || 0)}</div> */}
          </Skeleton>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2 text-sm">
        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">Function Provided:</span> <span className="text-primary">{data?.function}</span>
          </p>
        </Skeleton>

        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">Expertise:</span> <span className="text-primary">{data?.expertise}</span>
          </p>
        </Skeleton>

        <Skeleton active loading={!data} paragraph={{ rows: 1 }}>
          <p>
            <span className="font-medium text-gray-700">The Given Set Applicable:</span>{" "}
            <span className="text-primary">{data?.is_given_set ? "Yes" : "No"}</span>
          </p>
        </Skeleton>
      </div>

      {/* Button */}
      <div className="mt-auto pt-4">
        <Button
          loading={!data}
          block
          size="large"
          className="bg-primary text-white hover:text-primary"
          onClick={handleViewDetails}
          disabled={!data?.id}
        >
          More Details
        </Button>
      </div>
    </div>
  );
}
