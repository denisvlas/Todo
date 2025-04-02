import ReactQuill from "react-quill";
import { ITask } from "../../mst/models/models/Task.model";

interface ContentSectionProps {
  type: "description" | "comment";
  content: string | null | undefined;
  editContent: string | null;
  setEditContent: (value: string | null) => void;
  inputContent: string;
  setInputContent: (value: string) => void;
  saveContent: (
    type: "description" | "comment",
    content: string,
    isEdit: boolean
  ) => void;
  deleteContent: (task_id: string) => void;
  editorRef: React.RefObject<ReactQuill>;
  modules: Record<string, unknown>;
  modal: ITask;
  userRole: string | undefined;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  type,
  content,
  editContent,
  setEditContent,
  inputContent,
  setInputContent,
  saveContent,
  deleteContent,
  editorRef,
  modules,
  modal,
  userRole,
}) => {
  const title = type === "description" ? "Description" : "Comment";

  return (
    <div className="description-section">
      <hr className="hr-modal" />
      <div className="description-section-header">
        <span className="description-title">
          <i className="bi bi-chat-left-text-fill card-description-icon"></i>
          {title}
        </span>
        {content && userRole === "admin" && (
          <div className="card-edit-delete-btn">
            <i
              onClick={() => setEditContent(content)}
              className="bi bi-pen edit-description"
            ></i>
            <i
              onClick={() => deleteContent(modal.task_id)}
              className="bi bi-trash3 edit-description"
            ></i>
          </div>
        )}
      </div>
      {content ? (
        <>
          {editContent !== null ? (
            <div className="input-description">
              <ReactQuill
                ref={editorRef}
                modules={modules}
                className="description-editor"
                value={editContent}
                onChange={setEditContent}
              />
              <div className="save-cancel-btn">
                <button
                  className="description-save-btn"
                  onClick={() => saveContent(type, editContent, true)}
                >
                  save
                </button>
                <button
                  className="description-save-btn"
                  onClick={() => setEditContent(null)}
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="description-text"
              dangerouslySetInnerHTML={{ __html: content as string }}
            />
          )}
        </>
      ) : userRole === "admin" ? (
        <div className="input-description">
          <ReactQuill
            ref={editorRef}
            modules={modules}
            className="description-editor"
            value={inputContent}
            onChange={setInputContent}
            placeholder={`Add more detailed ${title.toLowerCase()} ...`}
          />
          <button
            className="description-save-btn"
            onClick={() => saveContent(type, inputContent, false)}
          >
            save
          </button>
        </div>
      ) : (
        <i className="no-description-title">no {title.toLowerCase()} yet</i>
      )}
    </div>
  );
};