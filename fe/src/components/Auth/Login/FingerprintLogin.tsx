import React, { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/services";
import MessageDisplay from "../utils/MessageDisplay";
import { useStore } from "../../../mst/StoreContext";

const FingerprintLogin: React.FC<{
  username: string;
}> = ({ username }) => {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const store = useStore();
  const project = store.currentProject!;
  const handleLogin = async () => {
    try {
      // 1. Get challenge from server
      const options = await authApi.getAuthenticationOptions(
        username,
        project.project_id
      );
      console.log("proj id", project.project_id);

      // 2. Start WebAuthn authentication
      const authResponse = await startAuthentication({ optionsJSON: options });

      // 3. Verify with backend
      const result = await authApi.verifyAuthentication({
        username,
        response: authResponse,
        project_id: project.project_id,
      });

      if (result.user.user_id && result.user.user_id) {
        const userId = result.user.user_id;
        const projectName = project.name;
        store.addUser(result.user);
        store.setCurrentUser(result.user);
        navigate(`/tasks/${projectName}/${username}/${userId}`);
      }

      if (result.success) {
        setMessage("Autentificare reușită!");
      } else {
        setError(result.error || "Eroare la autentificare");
      }
    } catch (error) {
      setError("Eroare la autentificare");
      console.error(error);
    }
  };

  return (
    <>
      <button onClick={handleLogin}>Autentificare</button>
      <MessageDisplay message={message} error={error} />
    </>
  );
};

export default FingerprintLogin;
