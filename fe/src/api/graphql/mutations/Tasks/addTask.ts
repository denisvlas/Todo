import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const addTask = graphql(`
  mutation addTask($taskId: String!, $title: String!, $projectId: String!) {
    insert_tasks_one(
      object: {
        task_id: $taskId
        title: $title
        project_id: $projectId
        status: "todo"
      }
    ) {
      task_id
      title
      status
      project_id
      description
      comment
      user_id
    }
  }
`);
