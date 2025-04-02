import { graphql } from "../../../../../generated/tada/todogql-graphql";


export const getUsers = graphql(`
  query getUser($project_id: String!) {
    users(where: { project_id: { _eq: $project_id } }) {
      username
      user_id
    }
  }
`);
