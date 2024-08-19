import { Handle } from "@xyflow/react";

const ConnectorNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "2px",
        borderRadius: "50%",
        background: "#ccc",
        textAlign: "center",
      }}
    >
      <div>{data.label}</div>
      <Handle type="source" position="right" style={{ borderRadius: "50%" }} />
      <Handle type="target" position="left" style={{ borderRadius: "50%" }} />
    </div>
  );
};

const nodeTypes = {
  default: DefaultNode,
  connectorNode: ConnectorNode,
  // other node types...
};
