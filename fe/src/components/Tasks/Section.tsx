import React from "react";
import { TodoStatusType } from "../../models";
import { useDrop } from "react-dnd";
import { SectionHeader } from "./SectionHeader";
import { Task } from "./Task";
import { useStore } from "../../mst/StoreContext";
import { ITask } from "../../mst/models/models/Task.model";
import { observer } from "mobx-react-lite";

interface Props {
  status: TodoStatusType;
}

export const Section: React.FC<Props> = observer(({ status }) => {
  const store = useStore();

  const tasksToMap = store.tasks.filter(
    (task: ITask) => task.status === status
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: ITask) => addItemToSection(item.task_id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  function addItemToSection(id: string) {
    const task = store.findTask(id);
    if (task) {
      task.modifyStatus(status);
    }
  }

  return (
    <div style={{ margin: "4px" }} className="section">
      <div ref={drop} className={`todo-task-wrapper ${isOver ? "onOver" : ""}`}>
        <SectionHeader status={status} count={tasksToMap.length} />
        {tasksToMap.map((item: ITask) => (
          <Task key={item.task_id} item={item} />
        ))}
      </div>
    </div>
  );
});
