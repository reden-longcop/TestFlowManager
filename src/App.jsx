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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// icons and toasts
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faTrashAlt,
  faPlusCircle,
  faPlusSquare,
  faChevronDown,
  faArrowAltCircleUp,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// components
import Modal from "./components/Modal";
import VersionHistoryModal from "./components/VersionHistory";
import Buttons from "./components/Buttons";

// nodes and edges
import CustomNode from "./nodes/CustomNode";
import ConnectorNode from "./nodes/ConnectorNode";
import CustomEdge from "./edges/CustomEdge";


export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();
  const [isVersionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const handleVersionHistoryOpen = useCallback(() => setVersionHistoryOpen(true), []);
  const handleVersionHistoryClose = useCallback(() => setVersionHistoryOpen(false), []);
  
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

  const toggleDetails = useCallback(() => { setShowDetails(prev => !prev); }, []);

  const calculateTestCaseStats = useCallback((nodes) => {
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
        node.data.testCases.forEach((testCase) => {
          if (stats[testCase.status] !== undefined) {
            stats[testCase.status] += 1;
          }
        });
      }
    });

    stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
    return stats;
  }, []);

  const {
    addNode,
    addConnectorNode,
    exportToExcel,
    deleteSelectedNode,
    onSave,
  } = Buttons(nodes, setNodes, setEdges, selectedNode, setModalOpen, setSelectedNode, rfInstance, calculateTestCaseStats);

  useEffect(() => {
    const restoreFlow = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
  
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
            type: "customEdge"
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleSaveTestCases = useCallback((testCases, label, color) => {
    setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
        if (node.id === selectedNode.id) {
            const updatedNode = { 
            ...node, 
            data: { 
                ...node.data, 
                label, 
                testCases,
                color: color
            }, 
            style: { 
                ...node.style, 
                backgroundColor: color,
            },
            type: 'customNode',
            };
            return updatedNode;
        }
        return node;
        });
    
        const updatedStats = calculateTestCaseStats(updatedNodes);
        setTestCaseStats(updatedStats);
    
        return updatedNodes;
    });
    }, [selectedNode, setNodes, setTestCaseStats]);

  const handleNodeClick = useCallback((event, node) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setModalOpen(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
      }, 200);
    }
  
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, selected: true } : { ...n, selected: false }
      )
    );
    setSelectedNode(node);
  }, [setNodes]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedNode(null);
  }, []);

  const handleSelectVersion = useCallback((flowData) => {
    try {
        const parsedFlow = typeof flowData === 'string' ? JSON.parse(flowData) : flowData;
        
        const updatedNodes = parsedFlow.nodes || [];
        const updatedEdges = parsedFlow.edges || [];
        const viewport = parsedFlow.viewport || { x: 0, y: 0, zoom: 1 }

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setViewport(viewport);

        const selectedNodeId = selectedNode?.id;
        if (selectedNodeId) {
            const updatedSelectedNode = updatedNodes.find(node => node.id === selectedNodeId);
            setSelectedNode(updatedSelectedNode || null);
        } else {
            setSelectedNode(null);
        }

        const updatedStats = calculateTestCaseStats(updatedNodes);
        setTestCaseStats(updatedStats);

        handleVersionHistoryClose();
    } catch (error) {
        console.error("Error selecting version:", error);
    }
  }, [selectedNode, setNodes, setEdges, setViewport, calculateTestCaseStats, handleVersionHistoryClose]);
  
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
        <Panel position="top-left panel" className="flex flex-col space-y-4">
          <div className="button-container flex space-x-2">
            <button
              className="delete p-2 rounded bg-[#3E3E3E] hover:bg-red-600 size-12"
              onClick={deleteSelectedNode}
            >
              <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white" />
            </button>
            <button
              className="version-history p-2 rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={handleVersionHistoryOpen}
            >
              <FontAwesomeIcon icon={faHistory} size="lg" color="white" />
            </button>
            <button
              className="download rounded rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={exportToExcel}
            >
              <FontAwesomeIcon icon={faArrowAltCircleUp} size="lg" color="white" />
            </button>
            <button
              className="add p-2 rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={addNode}
            >
              <FontAwesomeIcon icon={faPlusSquare} size="lg" color="white" />
            </button>
            <button
              className="connector p-2 rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={addConnectorNode}
            >
              <FontAwesomeIcon icon={faPlusCircle} size="lg" color="white" />
            </button>
            <button
              className="save p-2 rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={onSave}
            >
              <FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />
            </button>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center text-sm p-2 bg-[#2d2d2d] opacity-70 rounded text-white">
              <p>Total Test Count: {testCaseStats.total}</p>
              <button
                className="dropdown-button p-2 rounded bg-[#3E3E3E] hover:bg-[#2980B9] flex items-center"
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
      <ToastContainer />
      <VersionHistoryModal 
        isOpen={isVersionHistoryOpen}
        onClose={handleVersionHistoryClose}
        onSelectVersion={handleSelectVersion}
      />
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        nodeId={selectedNode?.id}
        nodeLabel={selectedNode?.data?.label || ""}
        testCases={selectedNode?.data?.testCases || []}
        onSave={handleSaveTestCases}
        borderColor={selectedNode?.data?.color || '#1C1C1E'}
      />
    </div>
  );
}