import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";
import "./index.css";
import logo from "./assets/workflow.png";

const MyComponent = React.lazy(() => import("./App"));
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <React.Suspense
        fallback={
          <div className="flex justify-center items-center h-[100vh] bg-[#1e1e1e]">
            <img src={logo} alt="Loading..." />
          </div>
        }>
        <MyComponent />
      </React.Suspense>
    </ReactFlowProvider>
  </React.StrictMode>
);
