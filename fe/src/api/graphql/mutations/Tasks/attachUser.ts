import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const attachUser = graphql(`
  mutation AttachUser($task_id: String!, $user_id: String!) {
    update_tasks_by_pk(
      pk_columns: { task_id: $task_id }
      _set: { user_id: $user_id }
    ) {
      task_id
    }
  }
`);

export const unAttachUser = graphql(`
  mutation UnAttachUser($task_id: String!) {
    update_tasks_by_pk(
      pk_columns: { task_id: $task_id }
      _set: { user_id: null }
    ) {
      task_id
    }
  }
`);
