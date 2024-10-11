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

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faFileCirclePlus, faSave, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import '../styles/Modal.css';
import { debounce } from "../utils";
import TestCase from "./TestCase";

const COLOR_OPTIONS = {
  DEFAULT: '#1C1C1E',
  SECOND: '#F39F5A',
  THIRD: '#9D3233'
}

const Modal = ({
  isOpen,
  onClose,
  nodeId,
  nodeLabel,
  nodeColor = '#1C1C1E',
  testCases: initialTestCases,
  onSave,
}) => {
  const [label, setLabel] = useState(nodeLabel);
  const [color, setColor] = useState(nodeColor || COLOR_OPTIONS.DEFAULT);
  const [testCases, setTestCases] = useState(initialTestCases);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const textareasRef = useRef([]);
  const [borderColor, setBorderColor] = useState(nodeColor || COLOR_OPTIONS.DEFAULT);
  const [searchTerm, setSearchTerm] = useState("");
  const [shortcutTriggered, setShortcutTriggered] = useState(false);

  useEffect(() => {
    setTestCases(initialTestCases);
  }, [initialTestCases, nodeId]);  

  const toastTypes = {
    toastSave: () => { toast.success('Changes Saved Successfully!', { autoClose: 1000 }); },
    toastSaveError: () => { toast.error('Failed to save data. Please try again.', { autoClose: 1000 }); },
  };
  
  const debouncedSave = useCallback(debounce(async () => {
    try {
      if (!nodeId) {
        throw new Error('Node ID is not defined');
      }
  
      const totalTestCases = testCases.length;
      const passed = testCases.filter((tc) => tc.status === "passed").length;
      const failed = testCases.filter((tc) => tc.status === "failed").length;
      const pending = testCases.filter((tc) => tc.status === "notstarted").length;
      const blocked = testCases.filter((tc) => tc.status === "blocked").length;
      const notApplicable = testCases.filter((tc) => tc.status === "notapplicable").length;
  
      const updatedStats = {
        total: totalTestCases,
        passed,
        failed,
        pending,
        blocked,
        notApplicable,
      };
  
      if (onSave) {
        onSave(testCases, label, color, updatedStats);
      }
  
      toastTypes.toastSave();
  
    } catch (error) {
      console.error("Failed to save data:", error);
      toastTypes.toastSaveError();
    }
  }, 1000), [testCases, label, color, nodeId, onSave, toastTypes]);

  
  
  const adjustTextareasHeight = useCallback(() => {
    requestAnimationFrame(() => {
      const heights = textareasRef.current.map((textarea) => {
        if (textarea) {
          textarea.style.height = 'auto';
          return textarea.scrollHeight;  
        }
        return 0;
      });
  
      textareasRef.current.forEach((textarea, index) => {
        if (textarea) {
          textarea.style.height = `${heights[index]}px`;
        }
      });
    });
  }, []); 
 
  const handleSave = useCallback(() => {
    adjustTextareasHeight();
    debouncedSave();
  }, [adjustTextareasHeight, debouncedSave]);

  const handleColorChange = useCallback((event) => {
    const newColor = event.target.value;

    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      setColor(newColor);
      setBorderColor(newColor);
    } else {
      console.error("Invalid color format. Please use #rrggbb format.");
    }
  }, []);

  const addBoldTestCase = useCallback(() => {
    const newTestCase = { id: Date.now(), content: "", status: "", isBold: true };
    setTestCases((prevTestCases) => [...prevTestCases, newTestCase]);
  }, []);

  const handleTestCaseChange = useCallback((id, newContent) => {
    setTestCases((prevTestCases) =>
      prevTestCases.map((tc) =>
        tc.id === id ? { ...tc, content: newContent } : tc
      )
    );
  }, []);

  const addTestCase = useCallback(() => {
    const newTestCase = { id: Date.now(), content: "", status: "notstarted" };
    setTestCases((prevTestCases) => [...prevTestCases, newTestCase]);
  }, []);

  const handleStatusChange = useCallback((id, newStatus) => {
    setTestCases((prevTestCases) =>
      prevTestCases.map((tc) => (tc.id === id ? { ...tc, status: newStatus } : tc))
    );
  }, []);

  const deleteSelectedTestCases = useCallback(() => {
    setTestCases((prevTestCases) =>
      prevTestCases.filter((tc) => !selectedTestCases.includes(tc.id))
    );
    setSelectedTestCases([]);
  }, [selectedTestCases]);

  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      const allTestCaseIds = testCases.map((tc) => tc.id);
      setSelectedTestCases(allTestCaseIds);
    } else {
      setSelectedTestCases([]);
    }
  }, [testCases]);

  const handleCheckboxChange = useCallback((id) => {
    setSelectedTestCases((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((tcId) => tcId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const filteredTestCases = testCases.filter(tc =>
    tc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToClicked = useCallback((index) => {
    if (textareasRef.current[index]) {
      textareasRef.current[index].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      textareasRef.current[index].focus();
    }
  }, []);

  const handleTestCaseClick = useCallback((index) => {
    if (searchTerm) {
      setSearchTerm("");
      setTimeout(() => { scrollToClicked(index); }, 0);
    }
  }, [searchTerm, scrollToClicked]);

  useEffect(() => {
    if (isOpen) {
      setLabel(nodeLabel);
      setColor(nodeColor || COLOR_OPTIONS.DEFAULT);
      setTestCases(initialTestCases);
      setSelectedTestCases([]);
    }
  }, [nodeLabel, initialTestCases, nodeColor, isOpen]);
  

  useEffect(() => {
    const storedTestCases = JSON.parse(localStorage.getItem(`testCases-${nodeId}`));
    const storedLabel = localStorage.getItem(`label-${nodeId}`);
    const storedColor = localStorage.getItem(`color-${nodeId}`);

    if (storedLabel) {
      setLabel(storedLabel);
    }
    if (storedTestCases) {
      setTestCases(storedTestCases);
    }
    if (storedColor) {
      setColor(storedColor);
      setBorderColor(storedColor);
    }

    setTimeout(() => {
      const textareas = document.querySelectorAll(`.modal-content textarea`);
      textareas.forEach((textarea) => {
        textarea.parentNode.dataset.replicatedValue = textarea.value;
      });
    }, 0);
  }, [nodeId, isOpen]);

  const handleKeyDown = useCallback((event) => {
    if (shortcutTriggered) return;
  
    if (event.ctrlKey && event.key === "Enter") {
      if (searchTerm) {
        setSearchTerm("");
      }
      addTestCase();
      setShortcutTriggered(true);
    } else if (event.altKey && event.key === "Enter") {
      if (searchTerm) {
        setSearchTerm("");
      }
      addBoldTestCase();
      setShortcutTriggered(true);
    } else if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      document.querySelector('.modal-save').focus()
      handleSave();
      setShortcutTriggered(true);
    }
     else if (event.ctrlKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      document.querySelector('.search-input').focus()
      setShortcutTriggered(true);
    }
    setTimeout(() => {
      setShortcutTriggered(false);
    }, 100);
  }, [searchTerm, addTestCase, addBoldTestCase, shortcutTriggered]);
  
  
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      adjustTextareasHeight();
    }
  }, [isOpen, adjustTextareasHeight]);

  useEffect(() => {
    if (textareasRef.current.length > 0) {
      textareasRef.current.forEach((textarea) => {
        if (textarea) textarea.style.height = 'auto';
      });
      textareasRef.current[textareasRef.current.length - 1]?.focus();
    }
  }, [testCases.length]);  

  useEffect(() => {
    const modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      modalElement.style.borderTopColor = borderColor; 
    }
  }, [borderColor]);

  const runPythonScript = useCallback(async (id, status) => {
    try {
      const response = await fetch('http://localhost:3000/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCaseId: id }),
      });
  
      const result = await response.json(); // Read the response as JSON
  
      if (response.ok && result.result != '') {
        toast.success('Python script executed successfully!', { autoClose: 1000 });
        const scriptOutput = result.result;
  
        const passMatch = scriptOutput.match(/(\| PASS \|)/);
        const failMatch = scriptOutput.match(/(\| FAIL \|)/);
        let updatedStatus;

        if (passMatch) {
          updatedStatus = 'passed';
        } else if (failMatch) {
          updatedStatus = 'failed';
        } else {
          updatedStatus = status;
        }
      
        handleStatusChange(id, updatedStatus);

      } else if (result.result == ''){
        toast.error(`Suite 'Testsuites' contains no tests or tasks matching tag ${id}.`, { autoClose: 1000 })
        handleStatusChange(id, 'blocked');
      }else {
        throw new Error('Failed to execute script: ' + result.message);
      }
    } catch (error) {
      console.error('Error running Python script:', error);
      toast.error('Failed to execute Python script.', { autoClose: 1000 });
    }
  }, [handleStatusChange, handleSave]);

  return (
    <>
      {isOpen && (
        <div className="modal-overlay z-0 select-none">
          <div className="modal-content bg-[#1C1C1E] flex flex-col max-h-[90vh] min-w-[70%] border-t-4"
            style={{borderColor: color}}
          >
            <span
              className="close bg-inherit text-white text-5xl hover:bg-rose-500"
              onClick={onClose}
            >
              &times;
            </span>
            <div className="flex items-center">
              <input
                type="text"
                className="bg-inherit text-slate-200 font-bold p-1 rounded mr-5 w-2/3 text-xl focus:outline focus:outline-white"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Node Label"
              />
              <div className="flex items-center w-fit space-x-3 px-2 ml-10">
                <button
                  onClick={() => handleColorChange({ target: { value: COLOR_OPTIONS.DEFAULT } })}
                  className={`w-8 h-8 rounded border-2 ${
                    color === COLOR_OPTIONS.DEFAULT ? ' border-[#FAF9F6]' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: COLOR_OPTIONS.DEFAULT }}
                  aria-label="DEFAULT"
                />
                <button
                  onClick={() => handleColorChange({ target: { value: COLOR_OPTIONS.SECOND } })}
                  className={`w-8 h-8 rounded border-2 ${
                    color === COLOR_OPTIONS.SECOND ? ' border-[#FAF9F6]' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: COLOR_OPTIONS.SECOND }}
                  aria-label="SECOND"
                />
                <button
                  onClick={() => handleColorChange({ target: { value: COLOR_OPTIONS.THIRD } })}
                  className={`w-8 h-8 rounded border-2 ${
                    color === COLOR_OPTIONS.THIRD ? ' border-[#FAF9F6]' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: COLOR_OPTIONS.THIRD }}
                  aria-label="THIRD"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="p-2 rounded flex items-center border-gray-600 cursor-pointer space-x-4 ">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedTestCases.length === testCases.length && testCases.length > 0}
                />
                <span className="text-white">Select All</span>
              </label>
              <input
                type="text"
                className="search-input placeholder:italic p-1 px-3 text-sm text-white rounded border border-gray-600 bg-inherit"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <hr className="mt-2 border-gray-600 border-1" />
            {searchTerm && (
              <label className="text-gray-400 text-xs">
                {filteredTestCases.length} test case{filteredTestCases.length > 1 ? 's' : ''} found
              </label>
            )}
            <header className="test-header flex text-center text-white p-2 divide-x divide-gray-600 border-b border-gray-600">
              <div className="w-[10%]">Test ID</div>
              <div className="w-[60%]">Test Case</div>
              <div className="w-[15%]">Status</div>
              <div className="w-[12%] ml-auto">Automation</div>
            </header>
            
            <div className="modal-body overflow-y-auto pb-[10px] divide-y divide-dashed">
            {filteredTestCases.map((testCase, index) => (
              <TestCase
                key={testCase.id}
                testCase={testCase}
                onChange={(newContent) => handleTestCaseChange(testCase.id, newContent)}
                onStatusChange={(newStatus) => handleStatusChange(testCase.id, newStatus)}
                onCheckboxChange={() => handleCheckboxChange(testCase.id)}
                isChecked={selectedTestCases.includes(testCase.id)}
                ref={(el) => textareasRef.current[testCases.findIndex(tc => tc.id === testCase.id)] = el}
                onClick={() => handleTestCaseClick(testCases.findIndex(tc => tc.id === testCase.id))}
                runAutomation={() => runPythonScript(testCase.id, testCase.status)}
              />
            ))}
            </div>
            

            <div className="button-container sticky bottom-0 left-0 right-0 bg-[#1C1C1E] pt-5 space-x-3 z-10">
              <button
                className="p-2 rounded w-12 bg-[#3e3e3e] hover:bg-[#2980B9]"
                onClick={addTestCase}
              >
                <FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white" />
              </button>
              <button
                className="modal-save p-2 rounded w-12 bg-[#3e3e3e] hover:bg-[#2980B9]"
                onClick={handleSave}
              >
                <FontAwesomeIcon icon={faSave} size="lg" color="white" />
              </button>
              <button
                className={`p-2 rounded w-12 ${
                  selectedTestCases.length > 0 ? 'bg-red-600 hover:bg-red-800' : 'bg-gray-600 cursor-not-allowed'
                }`}
                onClick={deleteSelectedTestCases}
                disabled={selectedTestCases.length === 0}
                style={{ cursor: selectedTestCases.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                <FontAwesomeIcon icon={faTrashAlt} size="lg" color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;