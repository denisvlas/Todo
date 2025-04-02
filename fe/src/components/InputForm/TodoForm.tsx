import React, { useState } from "react";
import { TodoStatusType } from "../../models";
import { observer } from "mobx-react-lite";
import { useStore } from "../../mst/StoreContext";
import { v4 as uuid } from "uuid";
import { Task } from "../../mst/models/models/Task.model";

const TodoForm: React.FC = observer(() => {
  const [input, setInput] = useState("");

  const [warning, setWarning] = useState("");
  const store = useStore();
  const projectId = store.currentProject!.project_id;

  function handleAddTask() {
    if (input.trim() === "") {
      setWarning("Please enter a task");
      return;
    }

    const newTask = Task.create({
      task_id: uuid(),
      title: input,
      status: TodoStatusType.incompleted,
      description: null,
      comment: null,
      project_id: projectId,
      user_id: null,
    });

    // Assuming you have a function to add the task to your store or state
    store.addTask(newTask);
    setInput("");
  }
  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleAddTask();
    }
  }
  return (
    <div className="add-task-section">
      <input
        onClick={() => setWarning("")}
        onKeyPress={handleKeyPress}
        placeholder={`${warning ? warning : "Add a task ..."}`}
        type="text"
        className="input-task"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => handleAddTask()} className="add-task-btn">
        add
      </button>
    </div>
  );
});
export default TodoForm;
