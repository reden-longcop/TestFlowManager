import React, { useState, useEffect, useRef } from 'react';
import './Modal.css'; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faSave, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, nodeId, nodeLabel, testCases: initialTestCases, onSave }) => {
  const [label, setLabel] = useState(nodeLabel);
  const [testCases, setTestCases] = useState(initialTestCases);
  const [selectedTestCases, setSelectedTestCases] = useState([]); // Store selected test cases
  const textareasRef = useRef([]);

  useEffect(() => {
    setLabel(nodeLabel);
    setTestCases(initialTestCases);
    setSelectedTestCases([]);
  }, [nodeLabel, initialTestCases]);

  useEffect(() => {
    const storedTestCases = JSON.parse(localStorage.getItem(`testCases-${nodeId}`));
    const storedLabel = localStorage.getItem(`label-${nodeId}`);
    if (storedTestCases) {
      setTestCases(storedTestCases);
    }
    if (storedLabel) {
      setLabel(storedLabel);
    }

    setTimeout(() => {
      const textareas = document.querySelectorAll(`.modal-content .grow-wrap textarea`);
      textareas.forEach(textarea => {
        textarea.parentNode.dataset.replicatedValue = textarea.value;
      });
    }, 0);
  }, [nodeId, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        addTestCase();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTestCaseChange = (id, newContent) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, content: newContent } : tc
    ));
  };

  const handleStatusChange = (id, newStatus) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, status: newStatus } : tc
    ));
  };

  const addTestCase = () => {
    const newTestCase = { id: Date.now(), content: "", status: "notstarted" }; // Default status
    setTestCases(prevTestCases => {
      const updatedTestCases = [...prevTestCases, newTestCase];
  
      setTimeout(() => {
        textareasRef.current[textareasRef.current.length - 1]?.focus();
      }, 0);
  
      return updatedTestCases;
    });
  };
  
  const deleteSelectedTestCases = () => {
    setTestCases(testCases.filter(tc => !selectedTestCases.includes(tc.id)));
    setSelectedTestCases([]);
  };

  const handleSave = async () => {
    try {
      // Update the local storage
      localStorage.setItem(`testCases-${nodeId}`, JSON.stringify(testCases));
      localStorage.setItem(`label-${nodeId}`, label);

      // Call the onSave callback if provided
      if (onSave) {
        onSave(testCases, label);
      }

      // Save to server or GitHub Pages
      const response = await fetch('https://code-me-n0t.github.io/TestFlowManager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: [], // Update with actual nodes data if needed
          edges: [], // Update with actual edges data if needed
          viewport: { x: 0, y: 0, zoom: 1 }, // Update with actual viewport data if needed
          testCases: testCases, // Add test cases
          label: label // Add label
        }),
      });

      if (response.ok) {
        toast.success('Test case/s saved!', {
          position: 'top-left'
        });
        onClose();
      } else {
        throw new Error('Failed to save data.');
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      toast.error('Failed to save data. Please try again.', {
        position: 'top-left'
      });
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedTestCases((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(tcId => tcId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  useEffect(() => {
    const adjustTextareaHeight = () => {
      textareasRef.current.forEach((textarea) => {
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      });
    };

    adjustTextareaHeight(); // Adjust on load

    // Attach the listener to adjust height when content changes
    textareasRef.current.forEach((textarea, index) => {
      if (textarea) {
        textarea.addEventListener('input', adjustTextareaHeight);
      }
    });

    return () => {
      // Cleanup event listeners when the component is unmounted
      textareasRef.current.forEach((textarea) => {
        if (textarea) {
          textarea.removeEventListener('input', adjustTextareaHeight);
        }
      });
    };
  }, [testCases]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-0 select-none">
  <div className="modal-content bg-[#1E1E1E] flex flex-col max-h-[90vh] w-[800px]">
    <span className="close bg-inherit text-white text-5xl hover:bg-rose-500" onClick={onClose}>&times;</span>
    <input
      type="text"
      className='bg-inherit text-slate-200 font-bold p-1 rounded mb-[10px] w-4/5 text-xl focus:outline-none'
      value={label}
      onChange={(e) => setLabel(e.target.value)}
      placeholder="Node Label"
    />
    <hr className='mb-4 border-gray-600 border-1'/>

    <div className="modal-body overflow-y-auto pb-[10px] divide-y divide-dashed">
      {testCases.map((testCase, index) => (
        <div className='py-2 flex items-center border-gray-600 space-x-5' 
          key={testCase.id} 
          data-replicated-value={testCase.content} 
        >
          <input
            type="checkbox"
            checked={selectedTestCases.includes(testCase.id)}
            onChange={() => handleCheckboxChange(testCase.id)}
            className="ml-1 mr-5  "
          />
          <div className='w-full'>
            <textarea
              ref={el => textareasRef.current[index] = el}
              className='pr-2 bg-inherit overflow-hidden text-sm text-white rounded resize-none w-full focus:outline-none'
              value={testCase.content}
              onChange={(e) => {
                handleTestCaseChange(testCase.id, e.target.value);
                e.target.parentNode.dataset.replicatedValue = e.target.value;
              }}
              rows="1"
              placeholder={`Test case ${testCase.id}`}
            />
          </div>
          <select 
            className={`  mr-2 p-1 cursor-pointer text-lg rounded font-mono space-x-2 focus:outline-none ${
              testCase.status === 'notstarted' ? 'bg-yellow-200' : 
              testCase.status === 'passed' ? 'bg-green-200' : 
              testCase.status === 'failed' ? 'bg-rose-300' : 
              testCase.status === 'blocked' ? 'bg-indigo-200' : 
              testCase.status === 'notapplicable' ? 'bg-gray-300' : 
              'bg-yellow-200'}`
            }
            value={testCase.status}
            id='status'
            onChange={(e) => handleStatusChange(testCase.id, e.target.value)}
          >
            <option className='bg-slate-200' value="notstarted">NOT STARTED</option>
            <option className='bg-slate-200' value="passed">PASSED</option>
            <option className='bg-slate-200' value="failed">FAILED</option>
            <option className='bg-slate-200' value="blocked">BLOCKED</option>
            <option className='bg-slate-200' value="notapplicable">NOT APPLICABLE</option>
          </select>
        </div>
      ))}
    </div>

    <div className="button-container sticky bottom-0 left-0 right-0 bg-inherit space-x-3 z-10">
      <button className='p-2 rounded w-12 bg-[#3e3e3e] hover:bg-emerald-700' onClick={addTestCase}>
        <FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white"/>
      </button>
      <button className='p-2 rounded w-12 bg-[#3e3e3e] hover:bg-emerald-700' onClick={handleSave}>
        <FontAwesomeIcon icon={faSave} size="lg" color="white"/>
      </button>
      <button 
        className={`p-2 rounded w-12 ${selectedTestCases.length > 0 ? 'bg-rose-500 hover:bg-rose-700' : 'bg-[#3e3e3e]'}`}
        onClick={deleteSelectedTestCases}
        disabled={selectedTestCases.length === 0}>
        <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white"/>
      </button>
    </div>
  </div>
  <ToastContainer/>
</div>

  );
};

export default Modal;
