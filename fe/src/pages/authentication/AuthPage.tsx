import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import "../../components/Auth/auth.css";
import { useStore } from "../../mst/StoreContext";
import MessageDisplay from "../../components/Auth/utils/MessageDisplay";
import RegistrationFlow from "../../components/Auth/Registration/RegistrationFlow";
import LoginSelector from "../../components/Auth/utils/LoginSelector";
const AuthPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const store = useStore();
  const currentProject = store.currentProject!;

  if (!currentProject) {
    return (
      <div className="error-container">
        <MessageDisplay error={"Project not found"} />
        <button onClick={() => navigate("/projects")}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-container">
        <header className="auth-header">
          <h2>{isRegistering ? "Registration" : "Login"}</h2>
          <img
            className="project-img-reg"
            src={currentProject.img!}
            alt={currentProject?.name}
          />
        </header>

        {isRegistering ? <RegistrationFlow /> : <LoginSelector />}

        <div className="mode-selector">
          <button
            className={!isRegistering ? "active" : ""}
            onClick={() => setIsRegistering(false)}
          >
            Autentificare
          </button>
          <button
            className={isRegistering ? "active" : ""}
            onClick={() => setIsRegistering(true)}
          >
            Înregistrare
          </button>
        </div>
      </div>
    </div>
  );
});

export default AuthPage;
