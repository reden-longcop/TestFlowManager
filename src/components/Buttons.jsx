import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';

const useToastNotifications = () => {
  const toastDelete = useCallback(() => {
    toast.error('No node selected to delete.', { autoClose: 1000 });
  }, []);

  const toastDeleteSuccess = useCallback(() => {
    toast.success('Node Deleted.', { autoClose: 1000 });
  }, []);

  const toastSaveError = useCallback(() => {
    toast.error('Server Save Failed: Unable to save changes.', { autoClose: 1000 });
  }, []);

  const toastSaveSuccess = useCallback(() => {
    toast.success('Changes saved successfully!', { autoClose: 1000 });
  }, []);

  const toastSaveErrorLocal = useCallback(() => {
    toast.error('Local Save Failed: Unable to save changes locally.', { autoClose: 1000 });
  }, []);

  const toastSaveLocalSuccess = useCallback(() => {
    toast.success('Changes saved locally!', { autoClose: 1000 });
  }, []);

  return {
    toastDelete,
    toastDeleteSuccess,
    toastSaveError,
    toastSaveSuccess,
    toastSaveErrorLocal,
    toastSaveLocalSuccess,
  };
};

const Buttons = (nodes, setNodes, setEdges, selectedNode, setModalOpen, setSelectedNode, rfInstance, calculateTestCaseStats) => {
  const {
    toastDelete,
    toastDeleteSuccess,
    toastSaveError,
    toastSaveSuccess,
  } = useToastNotifications();

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

const exportToExcel = useCallback(async () => {
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
    }, [nodes]);

    const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      toastDeleteSuccess();
      setModalOpen(false);
      setSelectedNode(null);
    } else {
      toastDelete();
    }
    }, [selectedNode, setNodes, setEdges, setModalOpen]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const updatedStats = calculateTestCaseStats(flow.nodes);
      const formattedFlow = JSON.stringify({ ...flow, testCaseStats: updatedStats }, null, 4);

      const saveFlowToServerVersion = (flowData) => {
        const timestamp = new Date().toISOString();
        const newVersion = { timestamp, flowData };

        fetch("http://localhost:3000/flow/saveVersion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVersion),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data) {
              console.log("Version saved to server:", data.message);
            } else {
              toastSaveError();
            }
          })
          .catch((error) => {
            console.error("Failed to save version to server:", error);
            toastSaveError();
          });
      };

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
            toastSaveSuccess();
            saveFlowToServerVersion(formattedFlow);
          } else {
            toastSaveError();
          }
        })
        .catch((error) => {
          console.error("Failed to save flow data to server:", error);
          toastSaveError();
        });
    } else {
      toastSaveError();
    }
  }, [rfInstance, calculateTestCaseStats, toastSaveError, toastSaveSuccess]);

  return {
    addNode,
    addConnectorNode,
    exportToExcel,
    deleteSelectedNode,
    onSave,
  };
};

export default Buttons;