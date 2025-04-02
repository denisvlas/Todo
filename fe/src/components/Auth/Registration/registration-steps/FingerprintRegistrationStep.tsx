import React from "react";

interface FingerprintRegistrationStepProps {
  isProcessing: boolean;
  onRegisterFingerprint: () => Promise<void>;
  onSkipFingerprint: () => void;
}

const FingerprintRegistrationStep: React.FC<FingerprintRegistrationStepProps> = ({
  isProcessing,
  onRegisterFingerprint,
  onSkipFingerprint
}) => {
  return (
    <div className="fingerprint-step">
      <p>
        Doriți să adăugați și autentificarea biometrică (amprentă/FaceID)?
      </p>
      <div className="button-group">
        <button
          onClick={onRegisterFingerprint}
          disabled={isProcessing}
          className={isProcessing ? "button-submitting" : ""}
        >
          {isProcessing
            ? "Se procesează..."
            : "Adaugă autentificare biometrică"}
        </button>
        <button
          onClick={onSkipFingerprint}
          disabled={isProcessing}
        >
          Doar parolă
        </button>
      </div>
    </div>
  );
};

export default FingerprintRegistrationStep;