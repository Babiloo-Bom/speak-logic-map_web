import { Pagination } from "antd";
import ProfileItem from "./ProfileItem";
import { ManagerItem } from "@/lib/pages/manager-search/types";

interface Props {
  data?: ManagerItem[];
  placeholderCount?: number;
}

export default function ProfileList({ data, placeholderCount = 6 }: Props) {
  const list = data ?? Array.from({ length: placeholderCount });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((item, index) => (
        <ProfileItem key={item ? item.id : index} data={item} />
      ))}
    </div>
  );
}
