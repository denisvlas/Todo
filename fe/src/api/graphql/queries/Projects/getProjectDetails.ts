import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const getProjectDetails = graphql(`
  query getProjectDetails($projectId: String!) {
    tasks_aggregate(where: { project_id: { _eq: $projectId } }) {
      aggregate {
        count
      }
    }
    users_aggregate(where: { project_id: { _eq: $projectId } }) {
      aggregate {
        count
      }
    }
  }
`);
