import { flow, Instance, toGenerator, types } from "mobx-state-tree";
import { TodoStatusType } from "../../../models";
import {
  attachUserService,
  deleteTaskCommentService,
  deleteTaskDescriptionService,
  modifyStatusService,
  modifyTaskCommentService,
  modifyTaskDescriptionService,
  modifyTaskTitleService,
  unAttachUserService,
} from "../../../pages/main/services/services";

export const Task = types
  .model("Task", {
    task_id: types.identifier,
    title: types.string,
    status: types.enumeration("TodoStatusType", [
      TodoStatusType.incompleted,
      TodoStatusType.progress,
      TodoStatusType.done,
    ]),
    description: types.maybeNull(types.string),
    comment: types.maybeNull(types.string),
    user_id: types.maybeNull(types.string),
    project_id: types.maybeNull(types.string),
  })
  .actions((self) => ({
    modifyStatus: flow(function* (status: TodoStatusType) {
      const response = yield* toGenerator(
        modifyStatusService(self.task_id, status)
      );
      if (!response) return;
      self.status = status;
    }),
    modifyTitle: flow(function* (title: string) {
      const response = yield* toGenerator(
        modifyTaskTitleService(self.task_id, title)
      );
      if (!response) return;
      self.title = title;
    }),

    modifyDescription: flow(function* (description: string) {
      const response = yield* toGenerator(
        modifyTaskDescriptionService(self.task_id, description)
      );
      if (!response) return;
      self.description = description;
    }),
    modifyComment: flow(function* (comment: string) {
      const response = yield* toGenerator(
        modifyTaskCommentService(self.task_id, comment)
      );
      if (!response) return;
      self.comment = comment;
    }),
    deleteTaskComment: flow(function* () {
      const response = yield* toGenerator(
        deleteTaskCommentService(self.task_id)
      );
      if (!response) return;
      self.comment = null;
    }),
    deleteTaskDescription: flow(function* () {
      const response = yield* toGenerator(
        deleteTaskDescriptionService(self.task_id)
      );
      if (!response) return;
      self.description = null;
    }),
    attachUser: flow(function* (user_id: string) {
      const response = yield* toGenerator(
        attachUserService(self.task_id, user_id)
      );
      if (!response) return;
      self.user_id = user_id;
    }),

    unAttachUser: flow(function* () {
      const response = yield* toGenerator(unAttachUserService(self.task_id));
      if (!response) return;
      self.user_id = null;
    }),
  }));

export type ITask = Instance<typeof Task>;
