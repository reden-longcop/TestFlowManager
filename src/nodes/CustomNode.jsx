import React from "react";
import { Handle } from "@xyflow/react";

const CustomNode = ({ data, selected }) => {
  const { label, testCases, color } = data;
  const testCaseCount = testCases.length;

  return (
    <div
      className={`text-xs outline rounded relative p-2 text-[#ECF0F1] max-w-[150px] text-center ${selected ? "outline-[#2980B9]" : "outline-[#373737]"}`}
    >
      <div>{label}</div>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
      {testCaseCount > 0 && (
        <div className="absolute top-[-10px] right-[-10px] w-[20px] h-[20px] rounded-full bg-[#E0E0E0] text-slate-700 flex items-center justify-center text-xs">
          {testCaseCount}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
