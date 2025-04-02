import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const modifyTaskTitle = graphql(`
  mutation ModifyTaskTitle($task_id: String!, $title: String!) {
    update_tasks_by_pk(
      pk_columns: { task_id: $task_id }
      _set: { title: $title }
    ) {
      task_id
    }
  }
`);
