import { Input, Select, Button } from "antd";
import { SearchOutlined, FilterOutlined, MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import { IDataRequestGetList } from "@/lib/pages/provider-search/types";

interface HeaderSearchProps {
  title?: string;
  imageUrl: string;
  onOpenAdvanceSearch?: () => void;
  dataRequest: IDataRequestGetList;
  setDataRequest: React.Dispatch<React.SetStateAction<IDataRequestGetList>>;
  handleSearch: (newDataRequest?: IDataRequestGetList) => void;
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
          placeholder="Sort By"
          className="w-full md:w-48"
          value={dataRequest.sort_by && dataRequest.sort_order ? `${dataRequest.sort_by}_${dataRequest.sort_order}` : undefined}
          onChange={(value) => {
            if (value) {
              const [sortBy, sortOrder] = value.split("_");
              const newDataRequest = { ...dataRequest, sort_by: sortBy, sort_order: sortOrder, page: 1 };
              setDataRequest(newDataRequest);
              handleSearch(newDataRequest);
            }
          }}
          options={[
            { value: "rating_desc", label: "⭐ Rating: High to Low" },
            { value: "rating_asc", label: "⭐ Rating: Low to High" },
            { value: "name_asc", label: "🔤 Name: A-Z" },
            { value: "name_desc", label: "🔤 Name: Z-A" },
            { value: "created_at_desc", label: "🆕 Newest First" },
            { value: "created_at_asc", label: "🕐 Oldest First" },
            ...(dataRequest.near_city || dataRequest.city_id || dataRequest.radius
              ? [{ value: "distance_asc", label: "📍 Distance: Nearest" }]
              : []),
          ]}
        />

        <Button size="large" icon={<SearchOutlined />} onClick={handleSearch} className="border-primary text-white bg-primary"></Button>
        <Button size="large" icon={<MenuOutlined />} onClick={onOpenAdvanceSearch} className="border-primary text-primary hover:text-primary"></Button>
      </div>
    </div>
  );
}
