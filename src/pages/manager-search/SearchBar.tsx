import { Input, Select, Button } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import Image from "next/image";

interface SearchHeroProps {
  title?: string;
  imageUrl: string;
}

export default function SearchBar({ title = "Manager Search", imageUrl }: SearchHeroProps) {
  return (
    <div>
      <div className="relative w-full h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-10">
        <Image src={imageUrl} alt={title} fill priority className="object-cover" />

        {/* overlay */}
        {/* <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold">{title}</h1>
        </div> */}
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <Input size="large" placeholder="Search for anything..." prefix={<SearchOutlined />} className="md:flex-1" />

        <Select
          size="large"
          defaultValue="Sort By"
          className="w-full md:w-40"
          options={[
            { value: "rating", label: "Rating" },
            { value: "newest", label: "Newest" },
          ]}
        />

        <Button size="large" icon={<FilterOutlined />} className="border-blue-600 text-blue-600">
          Filter
        </Button>
      </div>
    </div>
  );
}
