import React from "react";
import { TodoStatusType } from "../../models";
import { observer } from "mobx-react-lite";
import { useStore } from "../../mst/StoreContext";

export const ProgressBar: React.FC = observer(() => {
  const store = useStore();
  const todo = store.tasks.filter(
    (task) => task.project_id === store.currentProject!.project_id
  );
  const doneLen = todo.filter((item) => item.status === TodoStatusType.done);
  const progres = doneLen.length
    ? `${((doneLen.length / todo.length) * 100).toFixed()}%`
    : "0%";

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: progres }}></div>
      {doneLen.length > 0 ? (
        <span className="ppp" style={{ margin: 10 }}>
          progress: {progres}
        </span>
      ) : (
        <></>
      )}
    </div>
  );
});
