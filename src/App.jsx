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
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver';
import "@xyflow/react/dist/style.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faTrashAlt,
  faPlusCircle,
  faPlusSquare,
  faChevronDown,
  faChevronUp,
  faArrowAltCircleDown,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "./components/Modal";
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

  const toastTypes = {
    toastDelete: useCallback(() => { toast.error('No node selected to delete.', { autoClose: 1000 }); }, []),
    toastDeleteSuccess: useCallback(() => { toast.success('Node Deleted.', { autoClose: 1000 }); }, []),
    toastSaveError: useCallback(() => { toast.error('Server Save Failed: Unable to save changes.', { autoClose: 1000 }); }, []),
    toastSaveSuccess: useCallback(() => { toast.success('Changes saved successfully!', { autoClose: 1000 }); }, []),
    toastSaveErrorLocal: useCallback(() => { toast.error('Local Save Failed: Unable to save changes locally.', { autoClose: 1000 }); }, []),
    toastSaveLocalSuccess: useCallback(() => { toast.success('Changes saved locally!', { autoClose: 1000 }); }, []),
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
            style: {
              backgroundColor: node.style?.backgroundColor || 'inherit'
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

  const addNode = useCallback(() => {
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
  }, [nodes, setNodes]);

  const addConnectorNode = useCallback(() => {
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
  }, [nodes, setNodes]);

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

  const handleSaveTestCases = useCallback((testCases, label, color) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = { 
            ...node, 
            data: { 
              ...node.data, 
              label, 
              testCases 
            }, 
            style: { 
              ...node.style, 
              backgroundColor: color || '#1C1C1E',
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
  

  // const exportToExcel = useCallback((nodes) => {
  //     console.time('Export to Excel');

  //     const workbook = XLSX.utils.book_new();
  //     const sheetNames = new Set();

  //     nodes
  //         .filter((node) => (node.data.testCases && node.data.testCases.length > 0))
  //         .forEach((node) => {
  //             const nodeLabel = node.data.label || `Sheet${nodes.indexOf(node) + 1}`;
  //             const sanitizedLabel = nodeLabel
  //                 .replace(/[^a-zA-Z0-9_]/g, '_')
  //                 .slice(0, 31);

  //             let sheetName = sanitizedLabel;
  //             let counter = 1;
  //             while (sheetNames.has(sheetName)) {
  //                 sheetName = `${sanitizedLabel}_${counter}`;
  //                 counter++;
  //                 if (sheetName.length > 31) {
  //                     sheetName = sheetName.slice(0, 31);
  //                 }
  //             }
  //             sheetNames.add(sheetName);

  //             const nodeTestCases = node.data.testCases || [];
  //             console.log(`Processing node: ${nodeLabel}`);
  //             console.log('Test Cases:', nodeTestCases);

  //             const worksheetData = nodeTestCases.map((testCase, index) => ({
  //                 'Test Case ID': index + 1,
  //                 'Test Case Name': testCase.content,
  //                 'Test Case Status': testCase.status,
  //                 'Test Case Description': testCase.description || '',
  //             }));

  //             console.time(`Creating sheet for ${sheetName}`);
  //             const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  //             XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  //             console.timeEnd(`Creating sheet for ${sheetName}`);
  //         });

  //     console.timeEnd('Export to Excel');
      
  //     XLSX.writeFile(workbook, 'test_cases.xlsx');
  // }, []);


    const exportToExcel = useCallback(async (nodes) => {
      console.time('Export to Excel');

      const workbook = new ExcelJS.Workbook();
      const sheetNames = new Set();

      const sanitizeSheetName = (name) => {
          const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 31);
          let sheetName = sanitized;
          let counter = 1;
          while (sheetNames.has(sheetName)) {
              sheetName = `${sanitized}_${counter}`;
              counter++;
              if (sheetName.length > 31) {
                  sheetName = sheetName.slice(0, 31);
              }
          }
          sheetNames.add(sheetName);
          return sheetName;
      };

      for (const node of nodes) {
          if (node.data.testCases && node.data.testCases.length > 0) {
              const nodeLabel = node.data.label || `Sheet${nodes.indexOf(node) + 1}`;
              const sheetName = sanitizeSheetName(nodeLabel);

              const nodeTestCases = node.data.testCases || [];
              console.log(`Processing node: ${nodeLabel}`);
              console.log('Test Cases:', nodeTestCases);

              // Prepare worksheet data
              const worksheet = workbook.addWorksheet(sheetName);
              worksheet.addRow(['Test ID', 'Test Case', 'Status']);
              
              nodeTestCases.forEach((testCase, index) => {
                  worksheet.addRow([
                      index + 1,
                      testCase.content,
                      testCase.status,
                      testCase.description || ''
                  ]);
              });

              const autoSizeColumns = () => {
                worksheet.columns.forEach(column => {
                    let maxLength = 0;
                    column.eachCell({ includeEmpty: true }, cell => {
                        const cellLength = cell.value ? cell.value.toString().length : 0;
                        if (cellLength > maxLength) {
                            maxLength = cellLength;
                        }
                    });
                    column.width = maxLength;
                });
            };

            autoSizeColumns();

              console.timeEnd(`Creating sheet for ${sheetName}`);
          }
      }
      console.timeEnd('Export to Excel');

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'test_cases.xlsx');
      console.log('File saved!');
  }, []);

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

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      toastTypes.toastDeleteSuccess();
      setModalOpen(false);
      setSelectedNode(null);
    } else {
      toastTypes.toastDelete();
    }
  }, [selectedNode, setNodes, setEdges, toastTypes]);

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
            toastTypes.toastSaveSuccess()
          }
        })
        .catch((error) => {
          console.error("Failed to save flow data to server:", error);
          try {
            localStorage.setItem("flowData", formattedFlow);
            toastTypes.toastSaveLocalSuccess()
          } catch (localError) {
            console.error("Failed to save flow data to localStorage:", localError);
  
            toastTypes.toastSaveErrorLocal()
          }
        });
    } else {
      toastTypes.toastSaveError()
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
        <Panel position="top-left panel" className="flex flex-col space-y-4">
          <div className="button-container flex space-x-2">
            <button
              className="delete p-2 rounded bg-[#3E3E3E] hover:bg-red-600 size-12"
              onClick={deleteSelectedNode}
            >
              <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white" />
            </button>
            <button
              className="download rounded rounded bg-[#3E3E3E] hover:bg-[#2980B9] size-12"
              onClick={() => exportToExcel(nodes)}
            >
              <FontAwesomeIcon icon={faArrowAltCircleDown} size="lg" color="white" />
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