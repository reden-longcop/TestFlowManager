import React from "react";

const TestCase = React.memo(React.forwardRef(({ testCase, onChange, onStatusChange, onCheckboxChange, isChecked, onClick }, ref) => {
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
  
        <div className={`w-full ${testCase.status === "" ? "" : "border-dashed border-x border-gray-700"}`}>
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
export default TestCase;