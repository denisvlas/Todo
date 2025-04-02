import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Projects } from "./pages/project-list/Projects";
import NotFound from "./pages/NotFound";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AuthPage from "./pages/authentication/AuthPage";
import { observer } from "mobx-react-lite";
import Main from "./pages/main/Main";

const App = observer(() => {
  return (
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/not-found" element={<NotFound />} />
          <Route
            path="/tasks/:projectName/:username/:userId"
            element={<Main />}
          />
          <Route path="/auth/:projectName" element={<AuthPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </DndProvider>
    </BrowserRouter>
  );
});

export default App;
