import { v4 as uuidv4 } from "uuid";
import { client } from "../../../main";
import { addProject } from "../../../api/graphql/mutations/Projects/addProject";
import { getProjects } from "../../../api/graphql/queries/Projects/getProjects";


export async function addProjectService(name: string, img: string) {
  try {
    const projectId = uuidv4();
    const result = await client
      .mutation(addProject, { projectId, name: name, img: img })
      .toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.insert_projects_one ?? null;
  } catch (error) {
    console.error("Eroare la adăugarea proiectului:", error);
    return null;
  }
}

export async function fetchProjectsService() {
  const result = await client.query(getProjects, {}).toPromise();
  console.log("result", result);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.projects ?? null;
}

