import {
  cast,
  flow,
  Instance,
  SnapshotIn,
  toGenerator,
  types,
} from "mobx-state-tree";
import { persist } from "mobx-persist";
import { IUser, User } from "./User.model";
import { ITask, Task } from "./Task.model";
import { IProject, Project } from "./Project.model";
import {
  addProjectService,
  fetchProjectsService,
} from "../../../pages/project-list/services/services";
import {
  addTaskService,
  deleteTaskService,
  deleteTasksService,
  fetchDashboardTasksService,
  fetchProjectUsers,
} from "../../../pages/main/services/services";
import { TodoStatusType } from "../../../models";

export const Root$ = types
  .model("RootStore", {
    users: types.array(User),
    tasks: types.array(Task),
    projects: types.array(Project),
    currentProject: types.maybe(types.reference(Project)),
    currentUser: types.maybe(types.reference(User)),
    isAuthenticated: types.optional(types.boolean, false),
  })
  .volatile(() => ({
    popUp: null as string | null,
  }))

  .actions((self) => ({
    addUser(user: IUser) {
      const newUser = {
        ...user,
        role: user.role || "user",
        project_id: self.currentProject!.project_id, // Default project_id
      };
      const isExistingUser = self.users.find(
        (u) => u.user_id === newUser.user_id
      );
      if (isExistingUser) {
        console.log("User already exists:", newUser.username);
        return;
      } else {
        self.users.push(newUser);
      }
      console.log("users", self.users);
    },
    findTask(task_id: string) {
      return self.tasks.find((task) => task.task_id === task_id);
    },
    findUser(user_id: string) {
      return self.users.find((user) => user.user_id === user_id);
    },
    findProjectById(project_id: string) {
      return self.projects.find((project) => project.project_id === project_id);
    },
    findProjectByName(name: string) {
      return self.projects.find((project) => project.name === name);
    },

    setPopuop(task_id: string) {
      self.popUp = task_id;
    },
    closePopuop() {
      self.popUp = null;
    },

    setCurrentProject(project: IProject) {
      self.currentProject = project;
    },

    setCurrentUser(user: IUser) {
      const userInstance = self.users.find((u) => u.user_id === user.user_id);
      if (!userInstance) return;
      self.currentUser = userInstance;
    },

    setIsAuthenticated(isAuthenticated: boolean) {
      self.isAuthenticated = isAuthenticated;
    },

    logoutUser() {
      self.currentUser = undefined;
      self.currentProject = undefined;
      self.isAuthenticated = false;
      self.tasks.clear();
      self.users.clear();
    },
  }))
  .actions((self) => ({
    fetchProjects: flow(function* () {
      const response = yield* toGenerator(fetchProjectsService());
      console.log("fetchProjects response", response);
      if (!response) {
        return;
      }
      self.projects = cast(response);
    }),
    fetchDashboardTasks: flow(function* (project_id: string) {
      const response = yield* toGenerator(
        fetchDashboardTasksService(project_id)
      );
      if (!response) return;
      const tasksSnapshot = response.map((task) => ({
        ...task,
        status: task.status as TodoStatusType,
      }));

      self.tasks = cast(tasksSnapshot);
    }),

    addProject: flow(function* (name, img) {
      const response = yield* toGenerator(addProjectService(name, img));
      if (!response) return;
      self.projects.push(response);
    }),

    addTask: flow(function* (task: ITask) {
      const response = yield* toGenerator(
        addTaskService(task.task_id, task.title, task.project_id!)
      );
      if (!response) return;
      self.tasks.push({ ...response, status: task.status as TodoStatusType });
    }),

    deleteTasks: flow(function* () {
      const response = yield* toGenerator(
        deleteTasksService(self.currentProject!.project_id)
      );
      if (!response) return;
      self.tasks = cast([]);
    }),

    deleteOneTask: flow(function* (taskId: string) {
      const response = yield* toGenerator(deleteTaskService(taskId));
      console.log("deleteOneTask response", response);

      if (!response) return;
      self.tasks.replace(self.tasks.filter((task) => task.task_id !== taskId));
    }),

    fetchUsers: flow(function* (project_id: string) {
      const response = yield* toGenerator(fetchProjectUsers(project_id));
      if (!response) return;

      for (const user of response) {
        self.addUser({
          ...user,
          project_id: project_id,
        } as IUser);
      }
    }),
  }));

const PersistedRootStore = persist({
  name: "RootStore",
  storage: localStorage,
  jsonify: true,
  blacklist: ["popUp"],
})(Root$);

export type IRootStore = Instance<typeof Root$>;
export type RootStoreSnapshot = SnapshotIn<typeof Root$>;
export const RootStore = PersistedRootStore;
