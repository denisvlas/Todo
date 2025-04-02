import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { ITask } from "../../mst/models/models/Task.model";
import { useStore } from "../../mst/StoreContext";
import { observer } from "mobx-react-lite";

interface Props {
  item: ITask;
}

export const Task: React.FC<Props> = observer(({ item }) => {
  const store = useStore();
  const users = store.users;
  const currentUser = store.currentUser!;
  const userId = currentUser?.user_id;
  const userRole = currentUser?.role;
  const task = store.findTask(item.task_id)!;
  // Funcție pentru ștergere folosind acțiunea din store
  async function deleteTodo(taskId: string) {
    try {
      // Aici se poate adăuga apelul API de ștergere dacă este cazul
      store.deleteOneTask(taskId);
    } catch (e) {
      console.log(e);
    }
  }

  // Folosim id ca string, conform modelului MST
  const [edit, setEdit] = useState<null | string>(null);
  const [inputValue, setInputValue] = useState("");
  const [showMore, setShowMore] = useState<boolean>(false);

  function saveValue() {
    // Creăm un obiect task actualizat bazat pe datele curente
    task.modifyTitle(inputValue);
    setInputValue("");
    setEdit(null);
    setShowMore(false);
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { task_id: item.task_id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  function cancelEdit() {
    setEdit(null);
  }

  const attachedUser = users.find((user: any) => user.user_id === item.user_id);

  return (
    <div
      ref={
        userRole === "admin" ||
        (attachedUser && userId && attachedUser.user_id === userId)
          ? drag
          : null
      }
      onMouseLeave={() => setShowMore(false)}
      className={`${
        item.status === "todo"
          ? "to-do"
          : item.status === "progress"
          ? "progress"
          : item.status === "done" && "done"
      } ${isDragging && "dragging"} ${
        attachedUser && userId && attachedUser.user_id === userId
          ? "my-task"
          : userRole === "admin" && "grab"
      } todo-item`}
    >
      <div className="todo-task">
        {edit === item.task_id ? (
          <div className="edit-form">
            <div>
              <input
                placeholder="I have to..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="edit-btn">
              <button className="apply-task-btn" onClick={() => saveValue()}>
                apply
              </button>
              <button className="apply-task-btn" onClick={cancelEdit}>
                exit
              </button>
            </div>
          </div>
        ) : (
          <div className="todo-task">
            <div
              onClick={() => store.setPopuop(item.task_id)}
              className="todo-task-click"
            >
              <p className="item-title">{item.title}</p>
              {attachedUser && userId ? (
                <p
                  className={`${
                    attachedUser.user_id === userId
                      ? "my-item-indicator"
                      : "not-my-item-indicator"
                  } item-attached`}
                >
                  <i className="bi bi-pin-angle"></i> {attachedUser.username}
                </p>
              ) : null}
            </div>
            {userRole === "admin" && (
              <i
                onClick={() => setShowMore(!showMore)}
                className="bi bi-three-dots-vertical show-more-btn"
              ></i>
            )}
            {showMore && (
              <div
                onMouseEnter={() => setShowMore(true)}
                onMouseLeave={() => setShowMore(false)}
                className="more-btn"
              >
                <span onClick={() => deleteTodo(item.task_id)}>delete</span>
                <span onClick={() => setEdit(item.task_id)}>edit</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
