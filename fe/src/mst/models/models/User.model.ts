import { Instance, types } from "mobx-state-tree";

export const User = types.model("User", {
  user_id: types.identifier,
  username: types.string,
  role: types.maybe(types.enumeration(["user", "admin"])),
  project_id: types.maybe(types.string),
});

export type IUser = Instance<typeof User>;
