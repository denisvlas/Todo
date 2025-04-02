import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { observer } from "mobx-react-lite";
import { useStore } from "../../mst/StoreContext";
import { UserList } from "./UserList";
import { ContentSection } from "./ContentSection";

const PopUp: React.FC = observer(() => {
  const [inputDescription, setInputDescription] = useState<string>("");
  const [inputComment, setInputComment] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string | null>(null);
  const [editComment, setEditComment] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const store = useStore();
  const modal = store.findTask(store.popUp!)!;
  const userRole = store.currentUser?.role;

  const descriptionEditorRef = useRef<ReactQuill>(null);
  const commentEditorRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
      [{ color: [] }],
    ],
  };

  const saveContent = (
    type: "description" | "comment",
    content: string,
    isEdit: boolean
  ) => {
    if (!content.trim()) return;

    if (type === "description") {
      modal.modifyDescription(content);
      {
        void (isEdit ? setEditDescription(null) : setInputDescription(""));
      }
    } else {
      modal.modifyComment(content);
      {
        void (isEdit ? setEditComment(null) : setInputComment(""));
      }
    }
  };

  const deleteContent =
    (type: "description" | "comment") => (task_id: string) => {
      if (!task_id) return;
      {
        void (type === "description"
          ? modal.deleteTaskDescription()
          : modal.deleteTaskComment());
      }
    };
  const attachedUser = store.findUser(modal.user_id!)?.username || "";
  return (
    <>
      {modal && (
        <div className="popup-background">
          <div className={`${modal.status} pop-container`}>
            <div className="pop-header">
              <div className="card-details">
                <span className="card-title">
                  <i className="bi bi-card-text card-icon"></i>
                  {modal.title}
                </span>
                <span className="card-status">in list {modal.status}</span>
              </div>

              <i
                onClick={() => store.closePopuop()}
                className="bi bi-x-lg close-modal"
              ></i>
            </div>

            <div className="edit-section">
              <div className="popup-inputs">
                <ContentSection
                  type="description"
                  content={modal.description}
                  editContent={editDescription}
                  setEditContent={setEditDescription}
                  inputContent={inputDescription}
                  setInputContent={setInputDescription}
                  saveContent={saveContent}
                  deleteContent={deleteContent("description")}
                  editorRef={descriptionEditorRef}
                  modules={modules}
                  modal={modal}
                  userRole={userRole}
                />

                <ContentSection
                  type="comment"
                  content={modal.comment}
                  editContent={editComment}
                  setEditContent={setEditComment}
                  inputContent={inputComment}
                  setInputContent={setInputComment}
                  saveContent={saveContent}
                  deleteContent={deleteContent("comment")}
                  editorRef={commentEditorRef}
                  modules={modules}
                  modal={modal}
                  userRole={userRole}
                />
              </div>
              <div className="aside-popup">
                {modal.user_id ? (
                  <span className="user-attached">
                    <i className="bi bi-pin"></i>&nbsp;attached to&nbsp;
                    <u>{attachedUser}</u>
                  </span>
                ) : (
                  <></>
                )}
                {userRole === "admin" && (
                  <div className="aside-user-section">
                    <div
                      onClick={() => setShowMembers(!showMembers)}
                      className="popup-members"
                    >
                      <i className="bi bi-people"></i>Members
                    </div>
                    {showMembers ? (
                      <UserList setShowMembers={setShowMembers} />
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default PopUp;
