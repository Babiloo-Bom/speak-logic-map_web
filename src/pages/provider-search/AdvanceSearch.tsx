import { Button, Checkbox, Drawer, Radio } from "antd";
import React from "react";
import { ADVANCE_SEARCH_FILTERS } from "./constants";
import { IDataRequestGetList } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  dataRequest: IDataRequestGetList;
  setDataRequest: React.Dispatch<React.SetStateAction<IDataRequestGetList>>;
  handleSearch: () => void;
  handleClearAllFormSearch: () => void;
};

function AdvanceSearch(props: Props) {
  const { open, onClose, dataRequest, setDataRequest, handleSearch, handleClearAllFormSearch } = props;

  return (
    <div className="bg-white">
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">ADVANCE SEARCH</h2>
            <Button type="text" className="text-primary text-sm" onClick={() => handleClearAllFormSearch()}>
              CLEAR ALL
            </Button>
          </div>
        }
        placement="right"
        width={380}
        onClose={onClose}
        open={open}
        footer={
          <div className="flex items-center justify-between border-t border-blue-500/40">
            {/* CLOSE */}
            <Button type="text" onClick={onClose} className="w-1/2 h-12 text-gray-700 font-medium rounded-none hover:bg-transparent">
              CLOSE
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-blue-500/40" />

            <Button type="text" onClick={handleSearch} className="w-1/2 h-12 text-primary font-semibold rounded-none hover:bg-transparent">
              APPLY
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {ADVANCE_SEARCH_FILTERS.map((section) => (
            <div key={section.key}>
              <h4 className="font-semibold text-primary mb-2">{section.title}</h4>

              {section.type === "checkbox" ? (
                <Checkbox.Group
                  className="flex flex-col gap-3"
                  value={(dataRequest[section.key as keyof IDataRequestGetList] as unknown as any[]) || []}
                  onChange={(values) => setDataRequest({ ...dataRequest, [section.key]: values })}
                >
                  {section.options.map((option) => (
                    <div key={option.value} className="flex justify-between items-center">
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                      {option.count !== undefined && <span className="text-gray-400 text-sm">{option.count}</span>}
                    </div>
                  ))}
                </Checkbox.Group>
              ) : (
                <Radio.Group
                  className="flex flex-col gap-3"
                  value={dataRequest[section.key as keyof IDataRequestGetList] as unknown}
                  onChange={(e) => setDataRequest({ ...dataRequest, [section.key]: e.target.value })}
                >
                  {section.options.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export default AdvanceSearch;
