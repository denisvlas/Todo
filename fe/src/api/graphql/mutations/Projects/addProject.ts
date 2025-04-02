import { graphql } from "../../../../../generated/tada/todogql-graphql";
export const addProject = graphql(`
  mutation addProject($projectId: String!, $name: String!, $img: String!) {
    insert_projects_one(
      object: { project_id: $projectId, name: $name, img: $img }
    ) {
      project_id
      name
      img
    }
  }
`);
