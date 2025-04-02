import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const deleteTasks = graphql(`
  mutation deleteTasks($project_id: String!) {
    delete_tasks(where: { project_id: { _eq: $project_id } }){
      affected_rows
    }
  }
`);

export const deleteTask = graphql(`
  mutation deleteTasks($task_id: String!) {
    delete_tasks(where: { task_id: { _eq: $task_id } }) {
      affected_rows
    }
  }
`);
