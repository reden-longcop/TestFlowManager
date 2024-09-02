import { Handle } from "@xyflow/react";

const ConnectorNode = ({ data, selected }) => {
  const { label } = data;
  const handleBorderColor = selected ? '#2980B9' : '#373737';
  const handleBG = selected ? '#373737' : '#2980B9';

  const handleStyling = {
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
    <div className="text-[#ECF0F1] text-xs rounded-full w-[50px] h-[50px] flex justify-center items-center bg-[#34495E]"
      style={nodeStyling}
    >
      <div>{label}</div>
      <Handle type="source" position="right" style={handleStyling}  />
      <Handle type="target" position="left"  style={handleStyling}/>
    </div>
  );
};

export default ConnectorNode;