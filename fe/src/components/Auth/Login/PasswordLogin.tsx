import React, { useState } from "react";
import { authApi } from "../services/services";
import FormInput from "../utils/FormInput";
import MessageDisplay from "../utils/MessageDisplay";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../mst/StoreContext";

interface PasswordLoginProps {
  isRegistering: boolean;
  username: string;
}

const PasswordLogin: React.FC<PasswordLoginProps> = observer(
  ({ isRegistering, username }) => {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const store = useStore();
    const project = store.currentProject!;
    const project_id = project!.project_id;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setMessage("");

      if (!username || !password) {
        setError("Vă rugăm să completați toate câmpurile");
        return;
      }

      try {
        setIsSubmitting(true);
        const apiCall = isRegistering
          ? authApi.registerWithPassword
          : authApi.loginWithPassword;

        const data = await apiCall(project_id, username, password);

        if (data.success && data.user) {
          store.setIsAuthenticated(data.user.isAuthenticated);
          store.addUser(data.user);
          store.setCurrentUser(data.user);
          navigate(
            `/tasks/${store.currentProject?.name}/${store.currentUser?.username}/${store.currentUser?.user_id}`
          );
        } else {
          setError(data.message || "Eroare la înregistrare");
          console.log("message", data.message);
        }
      } catch (err: any) {
        setError(err?.message || "Eroare de conexiune");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="password-auth">
        <div className="reg-form">
          <FormInput
            id="password"
            label="Parolă"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduceți parola"
          />
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Se procesează..."
              : isRegistering
              ? "Înregistrare"
              : "Login"}
          </button>
        </div>

        <MessageDisplay message={message} error={error} />
      </div>
    );
  }
);

export default PasswordLogin;
