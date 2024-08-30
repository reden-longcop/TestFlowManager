import React from "react";
import { Handle } from "@xyflow/react";

const CustomNode = ({ data, selected }) => {
  const { label, testCases } = data;
  const testCaseCount = testCases.length;

  return (
    <div
      className={`text-xs outline rounded relative p-2 text-[#ECF0F1] bg-[#1c1c1e] max-w-[150px] text-center ${selected ? "outline-[#2980B9]" : "outline-[#373737]"}`}
    >
      <div>{label}</div>
      <Handle type="source" position="right" className="handle-style" />
      <Handle type="target" position="left"  className="handle-style"/>
      {testCaseCount > 0 && (
        <div className="absolute top-[-10px] right-[-10px] w-[1.5rem] h-[1.5rem] rounded-full bg-[#E0E0E0] text-slate-700 flex items-center justify-center text-xs">
          {testCaseCount}
        </div>
      )}
    </div>
  );
};

export default CustomNode;
