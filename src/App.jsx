/*
 * This file is part of Test Case Manager.
 *
 * Test Case Manager is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Test Case Manager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Test Case Manager. If not, see <https://www.gnu.org/licenses/>.
*/

import { useCallback, useState, useEffect, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@xyflow/react/dist/style.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFloppyDisk, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import Modal from "./nodes/Modal";

const flowKey = 'example-flow';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const clickTimeoutRef = useRef(null); // Ref to store timeout ID

  useEffect(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
        setNodes(flow.nodes || []);
        
        const edgesWithDefaultStyle = (flow.edges || []).map(edge => ({
          ...edge,
          style: edge.style || { stroke: 'white', strokeWidth: 2 },
        }));
        
        setEdges(edgesWithDefaultStyle);
        setViewport({ x, y, zoom });
  
        if (rfInstance) {
          rfInstance.fitView();
        }
      }
    };
    restoreFlow();
  }, [setNodes, setEdges, setViewport, rfInstance]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ 
      ...connection, 
      animated: true,
      style: {stroke: 'white', strokeWidth: 2 },
    }, 
    eds
  )),
    [setEdges]
  );

  const addNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const lastNodePosition = lastNode ? lastNode.position : { x: 0, y: 0 };

    const newNode = {
      id: `node_${nodes.length + 1}`,
      position: {
        x: lastNodePosition.x + 100,
        y: lastNodePosition.y + 100,
      },
      data: { label: `Test Scenario ${nodes.length + 1}`, testCases: [] },
      sourcePosition: 'right',
      targetPosition: 'left',
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (event, node) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // If timeout is cleared, it's a double-click
      setSelectedNode(node);
      setModalOpen(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setSelectedNode(node);
        clickTimeoutRef.current = null;
        // Single click logic here (e.g., highlighting node)
      }, 200); // Adjust delay as needed
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNode(null);
  };

  const handleSaveTestCases = (testCases, label) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label, testCases } }
          : node
      )
    );
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      // Remove the selected node and its edges
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));

      // Close the modal and clear the selected node
      setModalOpen(false);
      setSelectedNode(null);
    } else {
      toast.error("No node selected to delete.", {
        position: 'top-left'
      });
    }
  };

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
      toast.success("Changes saved successfully!", {
        position: 'top-left'
      });
    }
  }, [rfInstance]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        onNodeClick={handleNodeClick}
      >
        <Background />
        <MiniMap />
        <Controls />
        <Panel position="top-right panel" className="flex space-x-4">
          <button className="delete p-2 rounded bg-[#3E3E3E] hover:bg-red-600 size-12" onClick={deleteSelectedNode}>
            <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white" />
          </button>
          <button className="add p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12" onClick={addNode}>
            <FontAwesomeIcon icon={faPlus} size="lg" color="white" />
          </button>
          <button className="save p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12" onClick={onSave}>
            <FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />
          </button>
        </Panel>
      </ReactFlow>
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        nodeId={selectedNode?.id}
        nodeLabel={selectedNode?.data?.label || ""}
        testCases={selectedNode?.data?.testCases || []}
        onSave={handleSaveTestCases}
      />
      <ToastContainer />
    </div>
  );
}
