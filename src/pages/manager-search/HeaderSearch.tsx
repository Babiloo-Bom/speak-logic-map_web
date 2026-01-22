import { Input, Select, Button } from "antd";
import { SearchOutlined, FilterOutlined, MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import { IDataRequestGetList } from "@/lib/pages/manager-search/types";

interface HeaderSearchProps {
  title?: string;
  imageUrl: string;
  onOpenAdvanceSearch?: () => void;
  dataRequest: IDataRequestGetList;
  setDataRequest: React.Dispatch<React.SetStateAction<IDataRequestGetList>>;
  handleSearch: () => void;
}

export default function HeaderSearch({
  title = "Manager Search",
  imageUrl,
  onOpenAdvanceSearch,
  dataRequest,
  setDataRequest,
  handleSearch,
}: HeaderSearchProps) {
  return (
    <div>
      <div className="relative w-full h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-10">
        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />

        {/* overlay */}
        {/* <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold">{title}</h1>
        </div> */}
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          size="large"
          placeholder="Search for anything..."
          value={dataRequest.q}
          onChange={(e) => setDataRequest({ ...dataRequest, q: e.target.value })}
          prefix={<SearchOutlined />}
          className="md:flex-1"
          onPressEnter={() => handleSearch()}
        />

        <Select
          size="large"
          defaultValue="Sort By"
          className="w-full md:w-40"
          options={[
            { value: "rating", label: "Rating" },
            { value: "newest", label: "Newest" },
          ]}
        />

        <Button size="large" icon={<SearchOutlined />} className="border-primary text-white bg-primary"></Button>
        <Button size="large" icon={<MenuOutlined />} onClick={onOpenAdvanceSearch} className="border-primary text-primary hover:text-primary"></Button>
      </div>
    </div>
  );
}
