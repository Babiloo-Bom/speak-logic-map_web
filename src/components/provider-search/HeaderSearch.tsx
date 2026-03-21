import { Input, Select, Button } from "antd";
import { SearchOutlined, MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import { IDataRequestGetList } from "@/lib/pages/provider-search/types";

const SORT_OPTIONS = [
  { value: "functions", label: "Functions" },
  { value: "problems", label: "Problems" },
  { value: "provider", label: "Providers" },
  { value: "description", label: "Descriptions" },
  { value: "all", label: "Alls" },
] as const;

interface HeaderSearchProps {
  title?: string;
  imageUrl: string;
  onOpenAdvanceSearch?: () => void;
  dataRequest: IDataRequestGetList;
  setDataRequest: React.Dispatch<React.SetStateAction<IDataRequestGetList>>;
  handleSearch: () => void;
  onSortChange?: (sortBy: string) => void;
}

export default function HeaderSearch({
  title = "Manager Search",
  imageUrl,
  onOpenAdvanceSearch,
  dataRequest,
  setDataRequest,
  handleSearch,
  onSortChange,
}: HeaderSearchProps) {
  return (
    <div>
      <div className="relative w-full h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-10">
        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
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
          placeholder="Sorting By dropdown"
          className="w-full md:w-48"
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={dataRequest.sort_by && SORT_OPTIONS.some((o) => o.value === dataRequest.sort_by) ? dataRequest.sort_by : "all"}
          onChange={(value: string | undefined) => onSortChange?.(String(value ?? "all"))}
          optionRender={(option) => (
            <div className="py-2 border-b border-gray-100 last:border-b-0">
              {option.label}
            </div>
          )}
          dropdownStyle={{ padding: 0 }}
          popupMatchSelectWidth={true}
        />

        <Button
          size="large"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          className="border-primary text-white bg-primary"
          aria-label="Search"
        />
        <Button size="large" icon={<MenuOutlined />} onClick={onOpenAdvanceSearch} className="border-primary text-primary hover:text-primary"></Button>
      </div>
    </div>
  );
}
