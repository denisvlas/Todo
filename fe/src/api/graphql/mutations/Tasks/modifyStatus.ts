import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const modifyStatus = graphql(`
  mutation modifyStatus($taskId: String!, $status: String!) {
    update_tasks(
      where: { task_id: { _eq: $taskId } }
      _set: { status: $status }
    ) {
      affected_rows
      returning {
        task_id
        status
        title
        description
        comment
        user_id
        project_id
      }
    }
  }
`);
