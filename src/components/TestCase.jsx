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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { faCirclePlay, faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const TestCase = React.memo(React.forwardRef(({ testCase, onChange, onStatusChange, onCheckboxChange, isChecked, onClick }, ref) => {
  const [isCopied, setIsCopied] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(testCase.id).then(() => {
      setIsCopied(true);
      toast.success("Test case ID copied!", {autoClose: 1000 });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy ID.", {autoClose: 1000 });
    });
  };

  const runPythonScript = async () => {
    try {
      const response = await fetch('http://localhost:3000/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testCaseId: testCase.id }),
      });
  
      const result = await response.json(); // Read the response as JSON
  
      if (response.ok && result.result != '') {
        toast.success('Python script executed successfully!', { autoClose: 1000 });
        const scriptOutput = result.result;

        console.log(`Script Result: ${scriptOutput}`)
        console.log(`Error?: ${result.Error}`)
  
        const passMatch = scriptOutput.match(/(\| PASS \|)/);
        const failMatch = scriptOutput.match(/(\| FAIL \|)/);
        let updatedStatus;

        if (passMatch) {
          updatedStatus = 'passed';
        } else if (failMatch) {
          updatedStatus = 'failed';
        } else {
          updatedStatus = testCase.status;
        }
  
        onStatusChange(updatedStatus);
      } else if (result.result == ''){
        toast.error(`[ ERROR ] Suite 'Testsuites' contains no tests or tasks matching tag ${testCase.id}.`, { autoClose: 1000 })
      }else {
        throw new Error('Failed to execute script: ' + result.message);
      }
    } catch (error) {
      console.error('Error running Python script:', error);
      toast.error('Failed to execute Python script.', { autoClose: 1000 });
    }
  };
  

    return (
      <div
        className={`py-2 flex items-center border-gray-600 space-x-5 overflow-x-hidden mr-3`}
        key={testCase.id}
        data-replicated-value={testCase.content}
        onClick={onClick}
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

        {testCase.status !== "" && (
          <label className="test-id-con truncate w-[7%] p-1 hover:bg-gray-800 rounded-lg">
            <div
              className="cursor-pointer text-gray-600 flex items-center group"
              onClick={handleCopyId}
            >
              <FontAwesomeIcon
                icon={faCopy}
                className="ease-in mr-1 text-gray-400 text-gray-600 invisible group-hover:visible transition-opacity duration-200"
              />
              <p className="ease-in">{testCase.id}</p>
            </div>
          </label>
        )}
  
        <div className={`w-[80%] ${testCase.status === "" ? "" : ""}`}>
          <textarea
            ref={ref}
            className={`px-3 bg-inherit rounded overflow-hidden resize-none w-full flex items-center 
              ${testCase.status === "" ? 'text-gray-400 pl-2' : 'text-[#FAF9F6] pl-6'}  
              ${testCase.isBold ? "bold-textarea focus:outline-none" : "text-sm"}
            `}
            value={testCase.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Test case ${testCase.id}`}
            rows={testCase.status === "" ? 1 : ""}
          />
        </div>

        <div className="status-con w-[20%] flex items-center justify-center">
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

        <div className="automate-con w-[15%] flex items-center justify-center">
          {testCase.status != "" && (
            <button
              className="automate p-2 rounded w-12 bg-[#3e3e3e] hover:bg-[#2980B9] "
              onClick={runPythonScript}
            >
              <FontAwesomeIcon icon={faCirclePlay} size="lg" color="white" />
            </button>
          )}
        </div>
      </div>
    );
}));

export default TestCase;