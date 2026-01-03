import { Button, Checkbox, Drawer, Radio } from "antd";
import React from "react";
import { ADVANCE_SEARCH_FILTERS } from "./constants";

type Props = {
  open: boolean;
  onClose: () => void;
};

function AdvanceSearch(props: Props) {
  const { open, onClose } = props;

  const renderInput = (config) => {
    switch (config.type) {
      case "checkbox":
        return (
          <Checkbox.Group>
            {config.options.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group>
            {config.options.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );
      default:
        return null;
    }
  };
  return (
    <div className="bg-white">
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">ADVANCE SEARCH</h2>
            <Button type="text" className="text-primary text-sm">
              CLEAR ALL
            </Button>
          </div>
        }
        placement="right"
        width={380}
        onClose={onClose}
        open={open}
        footer={
          <div className="flex justify-between">
            <Button onClick={onClose}>Close</Button>
            <Button type="primary">Apply</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {ADVANCE_SEARCH_FILTERS.map((section) => (
            <div key={section.key}>
              <h4 className="font-semibold text-primary mb-2">{section.title}</h4>

              {section.type === "checkbox" ? (
                <Checkbox.Group className="flex flex-col gap-3">
                  {section.options.map((option) => (
                    <div key={option.value} className="flex justify-between items-center">
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                      {option.count !== undefined && <span className="text-gray-400 text-sm">{option.count}</span>}
                    </div>
                  ))}
                </Checkbox.Group>
              ) : (
                <Radio.Group className="flex flex-col gap-3">
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
