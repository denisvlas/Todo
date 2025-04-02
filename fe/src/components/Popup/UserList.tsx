import { observer } from "mobx-react-lite";
import { useStore } from "../../mst/StoreContext";
import { useEffect } from "react";

interface Props {
  setShowMembers: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserList: React.FC<Props> = observer(({ setShowMembers }) => {
  const store = useStore();
  const modal = store.findTask(store.popUp!)!;
  const users = store.users;

  function userAction(type: "attach" | "unattach", userId?: string) {
    if (type === "attach" && userId) {
      modal.attachUser(userId);
    } else {
      modal.unAttachUser();
    }
    setShowMembers(false);
  }

  useEffect(() => {
    store.fetchUsers(modal.project_id!);
  }, [store, modal.project_id]);

  return (
    <div className="users">
      {users.length > 0 ? (
        <div className="users">
          <p onClick={() => userAction("unattach")} className="user-null">
            ------null------
          </p>
          {users.map((user) => {
            return (
              user.role !== "admin" && (
                <p
                  onClick={() => userAction("attach", user.user_id)}
                  key={user.user_id}
                  className="user"
                >
                  {user.username}
                </p>
              )
            );
          })}
        </div>
      ) : (
        <p className="user">no users</p>
      )}
    </div>
  );
});
