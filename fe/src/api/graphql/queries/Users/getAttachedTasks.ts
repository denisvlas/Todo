import { graphql } from '../../../../../generated/tada/todogql-graphql';
export const getAttachedTasks=graphql(`query getAttachedTasks($userId: String!) {
    tasks(where: { user_id: { _eq: $userId } }) {
        task_id
    }
}`)