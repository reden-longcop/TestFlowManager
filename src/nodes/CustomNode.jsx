import React from "react";
import { Handle } from "@xyflow/react";

const CustomNode = ({ data, selected }) => {
  const { label, testCases, color } = data;
  const testCaseCount = testCases.length;
  const handleBorderColor = selected ? '#2980B9' : '#373737';
  const handleBG = selected ? '#373737' : '#2980B9';

  const styling = {
    background: handleBG,
    width: '13px',
    height: '13px',
    border: '3px solid',
    borderColor: handleBorderColor,
  }

  const nodeStyling = {
    outline: `3px solid ${handleBorderColor}`,
  }

  return (
    <div
      className={`text-xs outline rounded relative p-2 text-[#ECF0F1] max-w-[150px] text-center`}
      style={nodeStyling}
    >
      <div>{label}</div>
      <Handle type="source" position="right" style={styling}/>
      <Handle type="target" position="left"  style={styling}/>
      {testCaseCount > 0 && (
        <div className="absolute top-[-10px] right-[-10px] w-[1.5rem] h-[1.5rem] rounded-full bg-[#E0E0E0] text-slate-700 flex items-center justify-center text-xs">
          {testCaseCount}
        </div>
      )}
    </div>
  );
};

export default CustomNode;