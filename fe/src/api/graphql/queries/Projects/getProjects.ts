import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const getProjects = graphql(`
  query getProjects {
    projects {
      project_id
      name
      img
    }
  }
`);
