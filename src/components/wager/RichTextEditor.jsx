import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .ql-container {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 12px 12px;
          color: white;
          min-height: 120px;
        }
        .rich-text-editor .ql-toolbar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px 12px 0 0;
        }
        .rich-text-editor .ql-stroke {
          stroke: var(--text-muted);
        }
        .rich-text-editor .ql-fill {
          fill: var(--text-muted);
        }
        .rich-text-editor .ql-picker-label {
          color: var(--text-muted);
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--text-muted);
          font-style: normal;
        }
        .rich-text-editor .ql-editor {
          font-size: 14px;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--accent);
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: var(--accent);
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}