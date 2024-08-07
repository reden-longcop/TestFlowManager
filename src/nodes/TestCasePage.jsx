import { useParams } from 'react-router-dom';
import { useState } from 'react';

export default function TestCasePage() {
  const { nodeId } = useParams();
  const [testCase, setTestCase] = useState("");
  const { nodes } = useNodeContext();

  // Find the node with the corresponding ID
  const node = nodes.find(node => node.id === nodeId);
  const nodeLabel = node ? node.data.label : "Unknown Node";

  const handleSave = () => {
    alert(`Test case for ${nodeLabel} saved: ${testCase}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Test Case for {nodeLabel}</h1>
      <textarea
        value={testCase}
        onChange={(e) => setTestCase(e.target.value)}
      />
      <br />
      <button onClick={handleSave}>Save Test Case</button>
    </div>
  );
}