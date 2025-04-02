import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../mst/StoreContext";
import { DndProvider } from "react-dnd";
import { ProgressBar } from "../../components/Tasks/ProgressBar";
import TodoForm from "../../components/InputForm/TodoForm";
import Footer from "../../components/InputForm/Footer";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ListTask } from "../../components/Tasks/ListTask";
import PopUp from "../../components/Popup/PopUp";

const Main = observer(() => {
  const [showAside, setShowAside] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const store = useStore();

  const currentUser = store.currentUser!;
  const currentProject = store.currentProject!;
  const userRole = currentUser?.role;

  function exit() {
    navigate("/projects");
  }

  // Handle scroll effect
  useEffect(() => {
    if (!currentUser || !currentProject) return;
    store.fetchDashboardTasks(currentProject.project_id);

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [store, currentProject, currentUser]);

  // Loading state or NotFound if data isn't available
  useEffect(() => {
    if (!currentUser || !currentProject) {
      console.log(currentUser, currentProject);
      navigate("/projects");
    }
  }, [currentUser, currentProject, navigate]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header className={`${scrolled && "header-scroll"} app-header`}>
          <div className="project-info">
            <img className="main-img" src={currentProject?.img} alt="" />
            <h1>{currentProject?.name}</h1>
          </div>

          <div
            onClick={() => setShowAside(!showAside)}
            className="user-info-btn"
          >
            <i className="bi bi-person user-icon"></i>
            <h3 className="hello-user">{currentUser?.username}</h3>
          </div>
          {showAside && (
            <div className="user-aside">
              <div onClick={exit} className="exit-section">
                <i className="bi bi-box-arrow-left exit-icon"></i>
                <p>exit</p>
              </div>
            </div>
          )}
        </header>
        <div className="main">
          {store.popUp && <PopUp />}
          {userRole === "admin" && <TodoForm />}

          {userRole === "admin" && <Footer />}
          <ProgressBar />
          <ListTask />
        </div>
      </div>
    </DndProvider>
  );
});

export default Main;
