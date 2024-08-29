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
import { faFileCirclePlus, faSave, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import '../components/Modal.css';
import { debounce } from "../utils";

const COLOR_OPTIONS = {
  DEFAULT: '#1C1C1E',
  SECOND: '#F39F5A',
  THIRD: '#9D3233'
}

const TestCase = React.memo(React.forwardRef(({ testCase, onChange, onStatusChange, onCheckboxChange, isChecked }, ref) => {
  return (
    <div
      className={`py-2 flex items-center border-gray-600 space-x-5 overflow-x-hidden`}
      key={testCase.id}
      data-replicated-value={testCase.content}
    >
      <label className="container flex w-1">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheckboxChange}
          className="checkbox peer"
        />
        <span className="checkmark rounded border border-gray-500 hover:border-gray-50 peer-checked:bg-sky-700 peer-checked:border-none"></span>
      </label>

      <div className={`w-full ${testCase.status === "" ? "" : "border-dashed border-x border-gray-700"}`}>
        <textarea
          ref={ref}
          className={`px-3 bg-inherit rounded overflow-hidden resize-none w-full flex items-center ${testCase.status === "" ? 'text-gray-400 pl-2' : 'text-[#FAF9F6] pl-6'}  ${testCase.isBold ? "bold-textarea focus:outline-none" : "text-sm"}`}
          value={testCase.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Test case ${testCase.id}`}
          rows={testCase.status === "" ? 1 : ""}
        />
      </div>
      {testCase.status !== "" && (
        <select
          className={`p-1 cursor-pointer text-sm rounded focus:outline-none ${
            testCase.status === "notstarted" ? "bg-yellow-200"
            : testCase.status === "passed" ? "bg-green-200"
            : testCase.status === "failed" ? "bg-rose-300"
            : testCase.status === "blocked" ? "bg-indigo-200"
            : testCase.status === "notapplicable" ? "bg-gray-300"
            : "bg-yellow-200"
          }`}
          value={testCase.status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option className="bg-slate-200" value="notstarted">NOT STARTED</option>
          <option className="bg-slate-200" value="passed">PASSED</option>
          <option className="bg-slate-200" value="failed">FAILED</option>
          <option className="bg-slate-200" value="blocked">BLOCKED</option>
          <option className="bg-slate-200" value="notapplicable">NOT APPLICABLE</option>
        </select>
      )}
    </div>
  );
}));

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
      const notApplicable = testCases.filter((tc) => tc.status === "notapplicable").length;

      const updatedStats = {
        total: totalTestCases,
        passed,
        failed,
        pending,
        notApplicable,
      };

      localStorage.setItem(`testCases-${nodeId}`, JSON.stringify(testCases));
      localStorage.setItem(`label-${nodeId}`, label);
      localStorage.setItem(`color-${nodeId}`, color);
      localStorage.setItem(`testCaseStats-${nodeId}`, JSON.stringify(updatedStats));

      setBorderColor(color);

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
          textarea.style.height = 'auto';  // Reset the height
          return textarea.scrollHeight;    // Read the new scrollHeight
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

  useEffect(() => {
    setLabel(nodeLabel);
    setColor(nodeColor || COLOR_OPTIONS.DEFAULT);
    setTestCases(initialTestCases);
    setSelectedTestCases([]);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "Enter") {
        addTestCase();
      }
      if (event.altKey && event.key === "Enter") {
        addBoldTestCase();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addTestCase, addBoldTestCase, handleSave]);

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

  return (
    <>
      {isOpen && (
        <div className="modal-overlay z-0 select-none">
          <div className="modal-content bg-[#1C1C1E] flex flex-col max-h-[90vh] min-w-[800px] border-t-4"
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
            <label className="p-2 rounded flex items-center border-gray-600 cursor-pointer w-fit space-x-4 ">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedTestCases.length === testCases.length && testCases.length > 0}
              />
              <span className="text-white">Select All</span>
            </label>
            <hr className="mb-4 mt-2 border-gray-600 border-1" />
            <div className="modal-body overflow-y-auto pb-[10px] divide-y divide-dashed">
              {testCases.map((testCase, index) => (
                <TestCase
                  key={testCase.id}
                  testCase={testCase}
                  onChange={(newContent) => handleTestCaseChange(testCase.id, newContent)}
                  onStatusChange={(newStatus) => handleStatusChange(testCase.id, newStatus)}
                  onCheckboxChange={() => handleCheckboxChange(testCase.id)}
                  isChecked={selectedTestCases.includes(testCase.id)}
                  ref={(el) => (textareasRef.current[index] = el)}
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
                className="p-2 rounded w-12 bg-[#3e3e3e] hover:bg-[#2980B9]"
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
