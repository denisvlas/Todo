import { observer } from "mobx-react-lite";
import { useQuery } from "urql";
import { getProjectDetails } from "../../api/graphql/queries/Projects/getProjectDetails";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../mst/StoreContext";
import { Instance } from "mobx-state-tree";
import { Project as ProjectModel } from "../../mst/models/models/Project.model";


interface Props {
  project: Instance<typeof ProjectModel>;
}

const Project: React.FC<Props> = observer(({ project }) => {
  const [projectDetailsResult] = useQuery({
    query: getProjectDetails,
    variables: { projectId: project.project_id },
  });

  const { data: projectDetailsData } = projectDetailsResult;
  const tasksLen = projectDetailsData?.tasks_aggregate.aggregate?.count || 0;
  const userLen = projectDetailsData?.users_aggregate.aggregate?.count || 0;
  const navigate = useNavigate();
  const store = useStore();

  const handleJoin = () => {
    store.setCurrentProject(project);
    navigate(`/auth/${project.name}`);
  };

  return (
    <div className="project-link" key={project.project_id}>
      <div className="project-header">
        <img className="project-img" src={project.img!} alt="" />
        {project.name}
      </div>
      <i className="bi bi-list-task tasks-length">
        tasks in project: {tasksLen}
      </i>
      <i className="bi bi-people members-length">
        members in project: {userLen}
      </i>
      <div className="join-project" onClick={handleJoin}>
        <span>Join</span>
      </div>
    </div>
  );
});

export default Project;
