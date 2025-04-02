import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../../services/services";
import { useStore } from "../../../../mst/StoreContext";

// Registration steps
export type RegistrationStep =
  | "initial"
  | "password"
  | "fingerprint"
  | "complete";

// User state during registration
export interface RegistrationState {
  username: string;
  password: string;
  userId?: string;
  isAuthenticated: boolean;
}

// UI state
export interface UIState {
  message: string;
  error: string;
  isProcessing: boolean;
  currentStep: RegistrationStep;
}

export const useRegistrationState = () => {
  const store = useStore();
  const navigate = useNavigate();
  const project = store.currentProject!;
  const project_id = project?.project_id || "";

  // Registration data state
  const [regState, setRegState] = useState<RegistrationState>({
    username: "",
    password: "",
    userId: undefined,
    isAuthenticated: false,
  });

  // UI state
  const [uiState, setUIState] = useState<UIState>({
    message: "",
    error: "",
    isProcessing: false,
    currentStep: "initial",
  });

  // Update field values
  const updateField = (field: keyof RegistrationState, value: string) => {
    setRegState((prev) => ({ ...prev, [field]: value }));
  };

  // Update UI state with partial updates
  const updateUI = (updates: Partial<UIState>) => {
    setUIState((prev) => ({ ...prev, ...updates }));
  };

  // Set error with optional message clearing
  const setError = (error: string, clearMessage = true) => {
    updateUI({
      error,
      ...(clearMessage ? { message: "" } : {}),
    });
  };

  // Set message with optional error clearing
  const setMessage = (message: string, clearError = true) => {
    updateUI({
      message,
      ...(clearError ? { error: "" } : {}),
    });
  };

  // Move to next registration step
  const advanceStep = (nextStep: RegistrationStep) => {
    updateUI({ currentStep: nextStep });

    // Handle completion
    if (nextStep === "complete" && regState.userId) {
      completeRegistration();
    }
  };

  const completeRegistration = () => {
    const { username, userId } = regState;

    if (!username || !userId) {
      setError("Date utilizator incomplete. Vă rugăm să încercați din nou.");
      return;
    }

    // Update UI first
    setMessage("Înregistrare finalizată cu succes! Redirecționare...");

    // Update store with user data
    if (regState.isAuthenticated) {
      const foundUser = store.findUser(userId);
      if (foundUser) {
        store.setIsAuthenticated(true);
        store.setCurrentUser(foundUser);
      }
    }

    // Navigate after a brief delay
    setTimeout(() => {
      navigate(`/tasks/${project?.name}/${username}/${userId}`);
    }, 1000);
  };

  // Reset the registration flow
  const resetFlow = () => {
    setRegState({
      username: "",
      password: "",
      userId: undefined,
      isAuthenticated: false,
    });

    updateUI({
      message: "",
      error: "",
      isProcessing: false,
      currentStep: "initial",
    });
  };

  // Step 1: Handle password registration
  const handlePasswordRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = regState;

    // Clear previous messages
    updateUI({ error: "", message: "" });

    // Validate inputs
    if (!username || !password) {
      setError("Vă rugăm să completați toate câmpurile");
      return;
    }

    try {
      // Start processing
      updateUI({
        isProcessing: true,
        message: "Se procesează înregistrarea...",
      });

      // Call API
      const data = await authApi.registerWithPassword(
        project_id,
        username,
        password
      );

      // Handle success
      if (data.success && data.user) {
        // Update state with user data
        setRegState((prev) => ({
          ...prev,
          userId: data.user.user_id,
          isAuthenticated: data.user.isAuthenticated,
        }));

        // Update store
        store.addUser(data.user);

        // Show success and move to next step
        setMessage(
          "Cont creat cu succes! Acum puteți adăuga și autentificarea biometrică."
        );
        advanceStep("password");
      } else {
        // API returned success: false
        setError(data.message || "Eroare la înregistrare");
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Handle typed errors
      if ((err as ApiError)?.type) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } else {
        // Generic error
        setError(
          `Eroare la înregistrare: ${
            err instanceof Error ? err.message : "Eroare necunoscută"
          }`
        );
      }
    } finally {
      updateUI({ isProcessing: false });
    }
  };

  // Step 2: Handle fingerprint registration
  const handleFingerprintRegistration = async () => {
    const { username, userId } = regState;

    if (!username || !userId) {
      setError("Date lipsă pentru înregistrarea amprentei");
      return;
    }

    try {
      updateUI({
        isProcessing: true,
        message: "Se inițiază procesul de înregistrare a amprentei...",
      });

      // Get registration options
      const options = await authApi.getRegistrationOptions(
        username,
        project_id
      );
      setMessage("Așteptând autentificarea biometrică...");

      // Start WebAuthn registration
      const registrationResponse = await startRegistration({
        optionsJSON: options,
      });

      setMessage("Procesare răspuns...");

      // Verify with backend
      const result = await authApi.verifyRegistration({
        username,
        response: registrationResponse,
        userId,
        project_id: project_id,
      });

      if (result.success) {
        setMessage(
          "Înregistrare completă! Puteți folosi acum fie parola, fie autentificarea biometrică."
        );
        advanceStep("complete");
      } else {
        setError(result.message || "Eroare la înregistrarea biometrică");
      }
    } catch (error: any) {
      // Special handling for user cancellation
      if (error.name === "NotAllowedError") {
        setError(
          "Ați anulat procesul de înregistrare a amprentei. Puteți încerca din nou."
        );
      } else {
        setError(`Eroare la înregistrarea biometrică: ${error.message}`);
      }
    } finally {
      updateUI({ isProcessing: false });
    }
  };

  // Skip fingerprint registration
  const skipFingerprintRegistration = () => {
    setMessage(
      "Înregistrare completă! Vă puteți autentifica cu parola. Puteți adăuga autentificarea biometrică mai târziu."
    );
    advanceStep("complete");
  };

  return {
    regState,
    uiState,
    updateField,
    setError,
    setMessage,
    handlePasswordRegistration,
    handleFingerprintRegistration,
    skipFingerprintRegistration,
    resetFlow,
  };
};
