import React from 'react';
import { getBezierPath } from '@xyflow/react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className='stroke-[#BDC3C7] stroke-[2] fill-none'
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text x={labelX} y={labelY} style={{ fontSize: 12}} textAnchor="middle">
          {data.label}
        </text>
      )}
    </>
  );
};

export default CustomEdge;