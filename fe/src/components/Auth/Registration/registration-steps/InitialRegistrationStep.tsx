import React from "react";
import { RegistrationState } from "../hooks/useRegistrationState";
import FormInput from "../../utils/FormInput";

interface InitialRegistrationStepProps {
  regState: RegistrationState;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  updateField: (field: keyof RegistrationState, value: string) => void;
}

const InitialRegistrationStep: React.FC<InitialRegistrationStepProps> = ({
  regState,
  isProcessing,
  onSubmit,
  updateField,
}) => {
  const { username, password } = regState;

  return (
    <form className="reg-form" onSubmit={onSubmit}>
      <FormInput
        id="username"
        label="Nume utilizator"
        type="text"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateField("username", e.target.value)
        }
        placeholder="Alegeți un nume de utilizator"
        disabled={isProcessing}
      />

      <FormInput
        id="password"
        label="Parolă"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateField("password", e.target.value)
        }
        placeholder="Alegeți o parolă sigură"
        disabled={isProcessing}
      />

      <button
        type="submit"
        disabled={isProcessing}
        className={isProcessing ? "button-submitting" : ""}
      >
        {isProcessing ? "Se procesează..." : "Continuare"}
      </button>
    </form>
  );
};

export default InitialRegistrationStep;
