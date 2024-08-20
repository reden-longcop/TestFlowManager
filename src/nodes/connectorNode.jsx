import { Handle } from "@xyflow/react";

const ConnectorNode = ({ data }) => {
  return (
    <div
      style= {{
        color: 'white',
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#059669",
        textAlign: "center",
      }}
    >
      <div>{data.label}</div>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default ConnectorNode;