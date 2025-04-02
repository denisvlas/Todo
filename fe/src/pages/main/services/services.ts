import { modifyStatus } from "./../../../api/graphql/mutations/Tasks/modifyStatus";
import { addTask } from "../../../api/graphql/mutations/Tasks/addTask";
import { getDashboardTasks } from "../../../api/graphql/queries/Tasks/getTasks";
import { client } from "../../../main";
import {
  deleteTask,
  deleteTasks,
} from "../../../api/graphql/mutations/Tasks/deleteTasks";
import { modifyTaskTitle } from "../../../api/graphql/mutations/Tasks/modifyTaskTitle";
import {
  modifyTaskComment,
  modifyTaskDescription,
  deleteTaskComment,
  deleteTaskDescription,
} from "../../../api/graphql/mutations/Tasks/modifyTaskDescription";
import {
  attachUser,
  unAttachUser,
} from "../../../api/graphql/mutations/Tasks/attachUser";
import { getUsers } from "../../../api/graphql/queries/Users/getUsers";

export async function fetchDashboardTasksService(project_id: string) {
  const result = await client
    .query(getDashboardTasks, { projectId: project_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.tasks;
}

export async function fetchProjectUsers(project_id: string) {
  const result = await client
    .query(getUsers, { project_id: project_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.users;
}

export async function addTaskService(
  taskId: string,
  title: string,
  projectId: string
) {
  const result = await client
    .mutation(addTask, { taskId: taskId, title: title, projectId: projectId })
    .toPromise();
  console.log({ taskId: taskId, title: title, projectId: projectId });

  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.insert_tasks_one;
}

export async function modifyStatusService(taskId: string, status: string) {
  const result = await client
    .mutation(modifyStatus, { taskId: taskId, status: status })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks;
}

export async function deleteTasksService(project_id: string) {
  const result = await client
    .mutation(deleteTasks, { project_id: project_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.delete_tasks;
}

export async function deleteTaskService(task_id: string) {
  const result = await client
    .mutation(deleteTask, { task_id: task_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.delete_tasks;
}

export async function modifyTaskTitleService(task_id: string, title: string) {
  const result = await client
    .mutation(modifyTaskTitle, { task_id: task_id, title: title })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function modifyTaskDescriptionService(
  task_id: string,
  description: string
) {
  const result = await client
    .mutation(modifyTaskDescription, {
      task_id: task_id,
      description: description,
    })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function modifyTaskCommentService(
  task_id: string,
  comment: string
) {
  const result = await client
    .mutation(modifyTaskComment, { task_id: task_id, comment: comment })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function deleteTaskCommentService(task_id: string) {
  const result = await client
    .mutation(deleteTaskComment, { task_id: task_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function deleteTaskDescriptionService(task_id: string) {
  const result = await client
    .mutation(deleteTaskDescription, { task_id: task_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function attachUserService(task_id: string, user_id: string) {
  const result = await client
    .mutation(attachUser, { task_id: task_id, user_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}

export async function unAttachUserService(task_id: string) {
  const result = await client
    .mutation(unAttachUser, { task_id: task_id })
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.update_tasks_by_pk;
}
