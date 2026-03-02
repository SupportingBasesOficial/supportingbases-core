import React from "react";

interface Props {
  onRun: () => void;
}

const EngineRunner: React.FC<Props> = ({ onRun }) => {
  return <button onClick={onRun}>Run Engine</button>;
};

export default EngineRunner;
