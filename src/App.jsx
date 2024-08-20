/*
 * This file is part of Test Flow Manager.
 *
 * Test Flow Manager is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Test Flow Manager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Test Flow Manager. If not, see <http://www.gnu.org/licenses/>.
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
  MarkerType,
} from "@xyflow/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@xyflow/react/dist/style.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faTrashAlt,
  faPlusCircle,
  faPlusSquare,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

// import { initialNodes, nodeTypes } from "./nodes";
// import { initialEdges, edgeTypes } from "./edges";

import Modal from "./Modal";
import CustomNode from "./nodes/CustomNode";
import ConnectorNode from "./nodes/ConnectorNode";

import CustomEdge from "./edges/CustomEdge";

import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();
  
  const nodeTypes = {
    customNode: CustomNode,
    connector: ConnectorNode,
  };

  const edgeTypes = {
    customEdge: CustomEdge,
  }

  const [testCaseStats, setTestCaseStats] = useState({
    total: 0,
    notstarted: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notapplicable: 0,
  });
  const [showDetails, setShowDetails] = useState(false);
  

  const clickTimeoutRef = useRef(null);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    const restoreFlow = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        console.log(import.meta.env.VITE_API_URL);
  
        if (response.ok) {
          const flow = await response.json();
          const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
  
          const validatedNodes = (flow.nodes || []).map((node) => ({
            ...node,
            position: {
              x: typeof node.position?.x === "number" ? node.position.x : 0,
              y: typeof node.position?.y === "number" ? node.position.y : 0,
            },
          }));
  
          const edgesWithDefaultStyle = (flow.edges || []).map((edge) => ({
            ...edge,
          }));
  
          setNodes(validatedNodes);
          setEdges(edgesWithDefaultStyle);
          setViewport({ x, y, zoom });
  
          // Calculate and set the test case stats
          if (flow.nodes) {
            setTestCaseStats(calculateTestCaseStats(flow.nodes));
          }
  
          if (rfInstance) {
            rfInstance.fitView();
          }
        } else {
          console.warn("Failed to load flow data: Check the flow.json");
        }
      } catch (error) {
        console.error("Failed to load flow data:", error);
      }
    };
  
    restoreFlow();
  }, [setNodes, setEdges, setViewport, setTestCaseStats, rfInstance]);  

  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            type: "customEdge",
            // style: { stroke: "red", strokeWidth: 4 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const addNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const lastNodePosition = lastNode ? lastNode.position : { x: 0, y: 0 };

    const newNode = {
      id: uuidv4(),
      position: {
        x: lastNodePosition.x + 100,
        y: lastNodePosition.y + 100,
      },
      data: { label: `Test Scenario ${nodes.length + 1}`, testCases: [] },
      sourcePosition: "right",
      targetPosition: "left",
      type: "customNode",
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const addConnectorNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const lastNodePosition = lastNode ? lastNode.position : { x: 0, y: 0 };

    const newConnectorNode = {
      id: uuidv4(),
      position: {
        x: lastNodePosition.x + 100,
        y: lastNodePosition.y + 100,
      },
      type: "connector",
      data: { label: `${nodes.length + 1}` },
      sourcePosition: "right",
      targetPosition: "left",
    };

    setNodes((nds) => [...nds, newConnectorNode]);
  };

  const handleNodeClick = (event, node) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setModalOpen(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
      }, 200);
    }
  
    // Update the selected node state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, selected: true } : { ...n, selected: false }
      )
    );
    setSelectedNode(node);
  };
  

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNode(null);
  };

  const handleSaveTestCases = (testCases, label) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = { ...node, data: { ...node.data, label, testCases } };
          return updatedNode;
        }
        return node;
      });
  
      const updatedStats = calculateTestCaseStats(updatedNodes);
      setTestCaseStats(updatedStats);
  
      return updatedNodes;
    });
  };
  
  
  const calculateTestCaseStats = (nodes) => {
    const stats = {
      total: 0,
      notstarted: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      notapplicable: 0,
    };
  
    nodes.forEach((node) => {
      if (node.data && node.data.testCases) {
        stats.total += node.data.testCases.length;
        node.data.testCases.forEach((testCase) => {
          if (testCase.status === "notstarted") {
            stats.notstarted += 1;
          } else if (testCase.status === "passed") {
            stats.passed += 1;
          } else if (testCase.status === "failed") {
            stats.failed += 1;
          } else if (testCase.status === "blocked") {
            stats.blocked += 1;
          } else if (testCase.status === "notapplicable") {
            stats.notapplicable += 1;
          }
        });
      }
    });
  
    return stats;
  };  

  const updateTestCaseStats = (testCases) => {
    const total = testCases.length;
    const notstarted = testCases.filter((tc) => tc.status === "notstarted").length;
    const passed = testCases.filter((tc) => tc.status === "passed").length;
    const failed = testCases.filter((tc) => tc.status === "failed").length;
    const blocked = testCases.filter((tc) => tc.status === "blocked").length;
    const notapplicable = testCases.filter((tc) => tc.status === "notapplicable").length;
    
    setTestCaseStats({ total, notstarted, passed, failed, blocked, notapplicable });
  };
   

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );

      setModalOpen(false);
      setSelectedNode(null);
    } else {
      toast.error("No node selected to delete.", {
        position: "top-left",
      });
    }
  };

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const updatedStats = calculateTestCaseStats(flow.nodes);
      const formattedFlow = JSON.stringify({ ...flow, testCaseStats: updatedStats }, null, 4);
  
      fetch("http://localhost:3000/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formattedFlow,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            toast.success("Changes saved successfully!", {
              position: "top-left",
              autoClose: 3000,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to save flow data to server:", error);
          try {
            localStorage.setItem("flowData", formattedFlow);
            toast.success("Changes saved locally!", {
              position: "top-left",
              autoClose: 3000,
            });
          } catch (localError) {
            console.error("Failed to save flow data to localStorage:", localError);
            toast.error("Failed to save changes. Please try again.", {
              position: "top-left",
              autoClose: 5000,
            });
          }
        });
    } else {
      toast.error("Failed to save changes. React Flow instance is not initialized.", {
        position: "top-left",
        autoClose: 5000,
      });
    }
  }, [rfInstance]);  
  
  return (
    <div style={{ height: "100vh", width: "100%" }}>
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
        onNodeClick={handleNodeClick}
        
      >
        <Background />
        <MiniMap />
        <Controls />
        <Panel position="top-right panel" className="flex flex-col space-y-4">
  <div className="button-container flex space-x-4">
    <button
      className="delete p-2 rounded bg-[#3E3E3E] hover:bg-red-600 size-12"
      onClick={deleteSelectedNode}
    >
      <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white" />
    </button>
    <button
      className="add p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12"
      onClick={addNode}
    >
      <FontAwesomeIcon icon={faPlusSquare} size="lg" color="white" />
    </button>
    <button
      className="connector p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12"
      onClick={addConnectorNode}
    >
      <FontAwesomeIcon icon={faPlusCircle} size="lg" color="white" />
    </button>
    <button
      className="save p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12"
      onClick={onSave}
    >
      <FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />
    </button>
    </div>
      <div className="relative">
          <div className="flex justify-between items-center text-sm p-2 bg-[#2d2d2d] opacity-70 rounded text-white">
            <p>Total Count: {testCaseStats.total}</p>
            <button
              className="dropdown-button p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 flex items-center"
              onClick={toggleDetails}
            >
              <FontAwesomeIcon icon={faChevronDown} size="lg" color="white" />
            </button>
          </div>

          {showDetails && (
            <div className="dropdown-menu mt-2 bg-[#2d2d2d] p-2 opacity-70 rounded text-white">
              <p>Not Started: {testCaseStats.notstarted}</p>
              <p>Passed: {testCaseStats.passed}</p>
              <p>Failed: {testCaseStats.failed}</p>
              <p>Blocked: {testCaseStats.blocked}</p>
              <p>Not Applicable: {testCaseStats.notapplicable}</p>
            </div>
          )}
      </div>
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
