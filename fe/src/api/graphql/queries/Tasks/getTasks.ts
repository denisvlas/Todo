import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const getDashboardTasks = graphql(`
  query getDashboardTasks($projectId: String!) {
    tasks(where: { project_id: { _eq: $projectId } }) {
      task_id
      title
      status
      description
      comment
      user_id
      project_id
      
    }
  }
`);

export const getTask = graphql(`
  query getTask($taskId: String!) {
    tasks(where: { task_id: { _eq: $taskId } }) {
      task_id
      title
      status
      description
      comment
      user_id
      project_id
    }
  }
`);
