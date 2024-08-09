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


import React, { useState, useEffect, useRef } from 'react';
import './Modal.css'; // Import your CSS for styling
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faSave, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, nodeId, nodeLabel, testCases: initialTestCases, onSave }) => {
  const [label, setLabel] = useState(nodeLabel);
  const [testCases, setTestCases] = useState(initialTestCases);
  const [selectedTestCases, setSelectedTestCases] = useState([]); // Store selected test cases
  const textareasRef = useRef([]); // Ref to store textarea elements

  useEffect(() => {
    setLabel(nodeLabel);
    setTestCases(initialTestCases);
    setSelectedTestCases([]); // Reset selected test cases when modal opens
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

  // useEffect(() => {
  //   // Focus the most recently added textarea
  //   if (textareasRef.current.length > 0) {
  //     textareasRef.current[textareasRef.current.length - 1]?.focus();
  //   }
  // }, [testCases]);

  const handleTestCaseChange = (id, newContent) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, content: newContent } : tc
    ));
  };

  const addTestCase = () => {
    const newTestCase = { id: Date.now(), content: "" };
    setTestCases(prevTestCases => {
      const updatedTestCases = [...prevTestCases, newTestCase];
  
      // Focus the newly added textarea after updating the state
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

  const handleSave = () => {
    onSave(testCases, label);
    localStorage.setItem(`testCases-${nodeId}`, JSON.stringify(testCases));
    localStorage.setItem(`label-${nodeId}`, label);
    toast.success('Test case/s saved!', {
      position: 'top-left'
    });
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-0">
      <div className="modal-content bg-[#1E1E1E]">
        <span className="close bg-inherit text-white text-5xl hover:text-rose-500" onClick={onClose}>&times;</span>
        <input
          type="text"
          className='bg-inherit text-white p-1 rounded'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Node Label"
          style={{ width: '90%', marginBottom: '10px', fontSize: '18px' }}
        />
        <hr className='mb-4 border-gray-600 border-1'/>
        {testCases.map((testCase, index) => (
          <div className='flex items-center border-b-2 border-gray-600' key={testCase.id} data-replicated-value={testCase.content} style={{ marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={selectedTestCases.includes(testCase.id)}
              onChange={() => handleCheckboxChange(testCase.id)}
              className="mr-2"
            />
            <div className='grow-wrap w-full'>
            <textarea
              ref={el => textareasRef.current[index] = el}
              className='bg-inherit text-white rounded w-full resize-none focus:outline-none'
              value={testCase.content}
              onChange={(e) => {
                handleTestCaseChange(testCase.id, e.target.value);
                e.target.parentNode.dataset.replicatedValue = e.target.value;
              }}
              rows="1"
              placeholder={`Test case ${testCase.id}`}
              style={{ overflow: 'hidden', fontSize: '13px'}}
            />

            </div>
          </div>
        ))}
        <div className="button-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className='p-2 rounded w-12 bg-[#3e3e3e] hover:bg-emerald-700' onClick={addTestCase}>
            <FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white"/>
          </button>
          <button className='p-2 rounded w-12 bg-[#3e3e3e] hover:bg-emerald-700' onClick={handleSave}>
            <FontAwesomeIcon icon={faSave} size="lg" color="white"/>
          </button>
          <button 
            className={`p-2 rounded w-12 ${selectedTestCases.length > 0 ? 'bg-[#3e3e3e] hover:bg-rose-700' : 'bg-gray-500 cursor-not-allowed'}`}
            onClick={deleteSelectedTestCases}
            disabled={selectedTestCases.length === 0}
          >
            <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;