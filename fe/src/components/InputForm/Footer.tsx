import { observer } from "mobx-react-lite";
import { TodoStatusType } from "../../models";
import { useStore } from "../../mst/StoreContext";

const Footer: React.FC = observer(() => {
  const store = useStore();
  const tasks = store.tasks;
  const completed = tasks.filter(
    (task) => task.status === TodoStatusType.done
  ).length;
  const clear = () => {
    console.log("clear");
    store.deleteTasks();
  };
  return (
    <div>
      {tasks.length >= 1 && (
        <div className="footer">
          <span className="counter">
            |{tasks.length} tasks | completed {completed} |
          </span>
          <button className="clear-all" onClick={() => clear()}>
            clear all
          </button>
        </div>
      )}
    </div>
  );
});

export default Footer;
