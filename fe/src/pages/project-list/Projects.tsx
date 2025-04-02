import React, { useEffect, useState } from "react";
import Project from "./Project";
import "./project-list.css";
import { observer } from "mobx-react-lite"; // add this import
import { useStore } from "../../mst/StoreContext";

export const Projects: React.FC = observer(() => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState("");
  const [img, setImg] = useState("");

  const store = useStore();
  const projects = store.projects;

  useEffect(() => {
    store.logoutUser();
    store.fetchProjects();
  }, [store]);

  async function AddProject() {
    try {
      if (name && img) {
        store.addProject(name, img);
        setName("");
        setImg("");
        setShowInput(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (!store.projects) {
    return <div>Loading projects...</div>;
  }

  if (store.isAuthenticated) return <p>Loading...</p>;

  return (
    <div className="projects-page">
      <h1 className="title">PROJECTS</h1>

      <i
        onClick={() => setShowInput(!showInput)}
        className="bi bi-plus-circle add-icon"
      ></i>
      {showInput ? (
        <div className="modal-form">
          <form>
            <h3>Add a project</h3>
            <label htmlFor="Project name">Project name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Write the name of project"
            />
            <label htmlFor="Image url">Project logo url</label>
            <input
              onChange={(e) => setImg(e.target.value)}
              type="text"
              placeholder="Add the link for image"
            />
          </form>
          <button onClick={AddProject}>add</button>
        </div>
      ) : (
        <></>
      )}
      {projects.length > 0 ? (
        <div>
          <div className="projects-list-wrapper">
            {projects.length > 0 &&
              projects.map((project) => (
                <Project key={project.name} project={project} />
              ))}
          </div>
        </div>
      ) : (
        <h1 className="no-projects">no projects yet</h1>
      )}
    </div>
  );
});
