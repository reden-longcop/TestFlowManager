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
import { faFloppyDisk, faPlus, faTrashAlt, faCircle, faPlusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import Modal from "./nodes/Modal";

import { v4 as uuidv4 } from 'uuid';

const flowKey = 'example-flow';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const clickTimeoutRef = useRef(null); // Ref to store timeout ID

  useEffect(() => {
    const restoreFlow = async () => {
      try {
        // Attempt to retrieve data from local storage
        const savedFlow = localStorage.getItem('flowData');
        if (savedFlow) {
          const flow = JSON.parse(savedFlow);
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
        } else {
          // If local storage is empty, fetch from API
          const response = await fetch('/api/flow');
          const flow = await response.json();
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
      } catch (error) {
        console.error('Failed to load flow data:', error);
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
      id: uuidv4(),
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

  const addConnectorNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const lastNodePosition = lastNode ? lastNode.position : { x: 0, y: 0 };
  
    const newConnectorNode = {
      id: uuidv4(),
      position: {
        x: lastNodePosition.x + 100,
        y: lastNodePosition.y + 100,
      },
      type: 'connectorNode',
      data: { label: `${nodes.length + 1}` },
      sourcePosition: 'right',
      targetPosition: 'left',
      style: { 
        borderRadius: '50%', 
        width: '50px', 
        height: '50px',
        display: 'flex',         
        justifyContent: 'center', 
        alignItems: 'center',     
        backgroundColor: '#059669',  
        textAlign: 'center',    
      },
    };
  
    setNodes((nds) => [...nds, newConnectorNode]);
  };

  const handleNodeClick = (event, node) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setSelectedNode(node);
      setModalOpen(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setSelectedNode(node);
        clickTimeoutRef.current = null;
      }, 200);
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
      
      try {
        localStorage.setItem('flowData', JSON.stringify(flow));
        toast.success("Changes saved successfully!", {
          position: 'top-left',
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Failed to save flow data:', error);
        toast.error("Failed to save changes. Please try again.", {
          position: 'top-left',
          autoClose: 5000,
        });
      }
    } else {
      toast.error("Failed to save changes. React Flow instance is not initialized.", {
        position: 'top-left',
        autoClose: 5000,
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
            <FontAwesomeIcon icon={faPlusSquare} size="lg" color="white" />
          </button>
          <button className="connector p-2 rounded bg-[#3E3E3E] hover:bg-emerald-600 size-12" onClick={addConnectorNode}>
            <FontAwesomeIcon icon={faPlusCircle} size="lg" color="white" />
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
