import React from "react";
import { Handle } from "@xyflow/react";

const CustomNode = ({ data, selected }) => {
  const { label, testCases } = data;
  const testCaseCount = testCases.length;

  return (
    <div
      className={`text-xs rounded relative p-2 bg-[#1E1E1E] border-2 ${
        selected ? "border-emerald-600" : "border-[#373737]"
      } text-white max-w-[150px] text-center`}
    >
      <div>{label}</div>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
      <div className="absolute top-[-10px] right-[-10px] w-[20px] h-[20px] rounded-full bg-[#FF5722] text-white flex items-center justify-center text-xs">
        {testCaseCount}
      </div>
    </div>
  );
};

export default CustomNode;
