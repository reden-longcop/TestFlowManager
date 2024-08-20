import React from "react";
import { Handle } from "@xyflow/react";

const CustomNode = ({ data, selected }) => {
  const { label, testCases } = data;
  const testCaseCount = testCases.length;

  return (
    <div
      className={`text-xs rounded relative p-2 bg-[#1E1E1E] border-2 ${
        selected ? "border-[#2980B9]" : "border-[#373737]"
      } text-[#ECF0F1] max-w-[150px] text-center`}
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
