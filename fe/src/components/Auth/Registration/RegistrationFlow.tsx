import React from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import MessageDisplay from "../utils/MessageDisplay";
import { useRegistrationState } from "./hooks/useRegistrationState";
import InitialRegistrationStep from "./registration-steps/InitialRegistrationStep";
import FingerprintRegistrationStep from "./registration-steps/FingerprintRegistrationStep";
import CompletionStep from "./registration-steps/CompletionStep";
import { useStore } from "../../../mst/StoreContext";

const RegistrationFlow: React.FC = observer(() => {
  const navigate = useNavigate();
  const store = useStore();
  const project = store.currentProject!;

  const {
    regState,
    uiState,
    handlePasswordRegistration,
    handleFingerprintRegistration,
    skipFingerprintRegistration,
    resetFlow,
    updateField,
  } = useRegistrationState();

  // Check if project exists
  if (!project) {
    return (
      <div className="error-container">
        <MessageDisplay error="Proiectul nu a fost găsit." />
        <button onClick={() => navigate("/projects")}>
          Înapoi la proiecte
        </button>
      </div>
    );
  }

  // Render the current step based on state
  const renderCurrentStep = () => {
    const { currentStep, isProcessing } = uiState;

    switch (currentStep) {
      case "initial":
        return (
          <InitialRegistrationStep
            regState={regState}
            isProcessing={isProcessing}
            onSubmit={handlePasswordRegistration}
            updateField={updateField}
          />
        );
      case "password":
        return (
          <FingerprintRegistrationStep
            isProcessing={isProcessing}
            onRegisterFingerprint={handleFingerprintRegistration}
            onSkipFingerprint={skipFingerprintRegistration}
          />
        );
      case "complete":
        return <CompletionStep onReset={resetFlow} />;
      default:
        return <p>Eroare: Pas necunoscut.</p>;
    }
  };

  return (
    <div className="registration-flow">
      {renderCurrentStep()}
      <MessageDisplay message={uiState.message} error={uiState.error} />
    </div>
  );
});

export default RegistrationFlow;
