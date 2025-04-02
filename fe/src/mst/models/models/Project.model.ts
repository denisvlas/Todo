import { Instance, types } from "mobx-state-tree";

export const Project = types
  .model("Project", {
    project_id: types.identifier,
    name: types.string,
    img: types.string,
  })
  
export type IProject = Instance<typeof Project>;
