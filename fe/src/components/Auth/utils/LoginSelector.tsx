import React, { useEffect, useState } from "react";
import PasswordLogin from "../Login/PasswordLogin";
import FingerprintLogin from "../Login/FingerprintLogin";
import { authApi } from "../services/services";
import MessageDisplay from "./MessageDisplay";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../mst/StoreContext";

const LoginSelector: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authMethods, setAuthMethods] = useState<{
    hasPassword: boolean;
    hasFingerprint: boolean;
  }>({ hasPassword: false, hasFingerprint: false });
  const [selectedMethod, setSelectedMethod] = useState<
    "password" | "fingerprint" | null
  >(null);
  const [checkingMethods, setCheckingMethods] = useState(false);
  const [couldSelect, setCouldSelect] = useState(false);
  const store = useStore();
  const project = store.currentProject!;
  const project_id = project.project_id;
  const checkAuthMethods = async () => {
    if (!username) {
      setError("Introduceți numele de utilizator");
      return;
    }
    console.log("currentProject", store.currentProject);

    try {
      setCheckingMethods(true);
      setError("");
      setMessage("Verificare metode disponibile...");

      const data = await authApi.checkAuthMethods(username, project_id);

      if (data.success) {
        setAuthMethods(data.methods);

        if (!data.methods.hasPassword && !data.methods.hasFingerprint) {
          setError("Utilizator negăsit");
          setSelectedMethod(null);
        } else if (data.methods.hasPassword && !data.methods.hasFingerprint) {
          setSelectedMethod("password");
          setMessage("Disponibilă doar autentificarea cu parolă");
        } else if (!data.methods.hasPassword && data.methods.hasFingerprint) {
          setSelectedMethod("fingerprint");
          setMessage("Disponibilă doar autentificarea cu amprentă");
        } else {
          setMessage("Alegeți metoda de autentificare");
          setCouldSelect(true);
        }
      } else {
        setError(data.error || "Eroare la verificarea metodelor");
      }
    } catch (err) {
      setError("Eroare de conexiune");
      console.error(err);
    } finally {
      setCheckingMethods(false);
    }
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setCouldSelect(false);
    setUsername("");
    setMessage("");
    setError("");
  };

  useEffect(() => {
    if (selectedMethod) {
      setMessage("");
    }
  }, [selectedMethod]);

  return (
    <div className="login-selector">
      {!selectedMethod && !couldSelect ? (
        <div className="username-step">
          <div className="reg-form">
            <div className="input-group">
              <label htmlFor="username">Nume utilizator</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduceți numele de utilizator"
              />
            </div>
            <button onClick={checkAuthMethods} disabled={checkingMethods}>
              {checkingMethods ? "Se verifică..." : "Continuare"}
            </button>
          </div>
          <MessageDisplay error={error} />
        </div>
      ) : (
        <>
          <div className="auth-method-selection">
            <p>
              Utilizator: <strong>{username}</strong>
            </p>

            {authMethods.hasPassword && authMethods.hasFingerprint && (
              <div className="method-buttons">
                <button
                  className={selectedMethod === "password" ? "active" : ""}
                  onClick={() => setSelectedMethod("password")}
                >
                  Autentificare cu parolă
                </button>
                <button
                  className={selectedMethod === "fingerprint" ? "active" : ""}
                  onClick={() => setSelectedMethod("fingerprint")}
                >
                  Autentificare cu amprentă
                </button>
              </div>
            )}

            {selectedMethod === "password" && (
              <PasswordLogin username={username} isRegistering={false} />
            )}
            {selectedMethod === "fingerprint" && (
              <FingerprintLogin username={username} />
            )}
            <i className="bi bi-arrow-left back-btn" onClick={resetForm}></i>
            <MessageDisplay message={message} error={error} />
          </div>
        </>
      )}
    </div>
  );
});

export default LoginSelector;
