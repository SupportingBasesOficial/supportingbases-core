import React from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const JsonEditor: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <div className="json-editor">
      <label>{label}</label>
      <textarea
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default JsonEditor;
