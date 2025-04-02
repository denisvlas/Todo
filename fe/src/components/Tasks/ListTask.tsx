import { TodoStatusType } from "../../models";
import { Section } from "./Section";
import { observer } from "mobx-react-lite";

export const ListTask: React.FC = observer(() => {
  const statuses: TodoStatusType[] = [
    TodoStatusType.incompleted,
    TodoStatusType.progress,
    TodoStatusType.done,
  ];

  return (
    <div className="task-list">
      <div className="statuses">
        {statuses.map((status, index) => (
          <Section key={index} status={status} />
        ))}
      </div>
    </div>
  );
});
