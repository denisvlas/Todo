import { graphql } from "../../../../../generated/tada/todogql-graphql";

export const modifyTaskDescription = graphql(
    `mutation ModifyTaskDescription($task_id: String!, $description: String!) {
        update_tasks_by_pk(
            pk_columns: { task_id: $task_id },
            _set: { description: $description }
        ) {
            task_id
            description
        }
    }`
);

export const modifyTaskComment = graphql(
    `mutation ModifyTaskComment($task_id: String!, $comment: String!) {
        update_tasks_by_pk(
            pk_columns: { task_id: $task_id },
            _set: { comment: $comment }
        ) {
            task_id
            comment
        }
    }`
);

export const deleteTaskDescription = graphql(
    `mutation DeleteTaskDescription($task_id: String!) {
        update_tasks_by_pk(
            pk_columns: { task_id: $task_id },
            _set: { description: "" }
        ) {
            task_id
            description
        }
    }`
)
export const deleteTaskComment = graphql(
    `mutation DeleteTaskComment($task_id: String!) {
        update_tasks_by_pk(
            pk_columns: { task_id: $task_id },
            _set: { comment: "" }
        ) {
            task_id
            comment
        }
    }`
)