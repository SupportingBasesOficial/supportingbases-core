import React, { useState } from "react";
import { runEngine, SBInput, SBOutput, ProjectionConfig } from "supportingbases-core";
import defaultInput from "./defaultInput";
import defaultConfig from "./defaultConfig";
import JsonEditor from "./components/JsonEditor";
import EngineRunner from "./components/EngineRunner";
import OutputPanel from "./components/OutputPanel";

function App() {
  const [inputText, setInputText] = useState(
    JSON.stringify(defaultInput, null, 2)
  );
  const [configText, setConfigText] = useState(
    JSON.stringify(defaultConfig, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<SBOutput | null>(null);
  const [parsedInput, setParsedInput] = useState<SBInput | null>(null);
  const [parsedConfig, setParsedConfig] = useState<ProjectionConfig | null>(
    null
  );
  const [showRaw, setShowRaw] = useState(false);

  const handleRun = () => {
    setError(null);
    setOutput(null);
    let pi: SBInput;
    let pc: ProjectionConfig;
    try {
      pi = JSON.parse(inputText);
    } catch (e) {
      setError("Input JSON parse error: " + (e as Error).message);
      return;
    }
    try {
      pc = JSON.parse(configText);
    } catch (e) {
      setError("Config JSON parse error: " + (e as Error).message);
      return;
    }

    try {
      const out = runEngine(pi, pc);
      setParsedInput(pi);
      setParsedConfig(pc);
      setOutput(out);
    } catch (e) {
      setError("Engine error: " + (e as Error).message);
    }
  };

  return (
    <div className="container">
      <h1>SupportingBases Engineering Lab</h1>
      <div className="columns">
        <div className="left">
          <JsonEditor
            label="SBInput"
            value={inputText}
            onChange={setInputText}
          />
          <JsonEditor
            label="ProjectionConfig"
            value={configText}
            onChange={setConfigText}
          />
          <EngineRunner onRun={handleRun} />
          {error && <div className="error">{error}</div>}
        </div>
        <div className="right">
          <OutputPanel
            output={output}
            input={parsedInput}
            config={parsedConfig}
            showRaw={showRaw}
            toggleRaw={() => setShowRaw((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
