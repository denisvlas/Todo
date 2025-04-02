import React from "react";

interface CompletionStepProps {
  onReset: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onReset }) => {
  return (
    <div className="registration-complete">
      <p>Înregistrare finalizată cu succes!</p>
      <button onClick={onReset}>Înregistrează alt cont</button>
    </div>
  );
};

export default CompletionStep;