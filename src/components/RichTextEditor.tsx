import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ font: ["sans-serif", "serif", "monospace"] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: ["#000000", "#1e40af", "#15803d", "#d97706", "#dc2626", "#7c3aed", "#db2777"] }],
    [{ align: ["", "center", "right", "justify"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const formats = [
  "font", "size", "bold", "italic", "underline", "strike",
  "color", "align", "list", "bullet",
];

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  return (
    <div className="rich-editor bg-background rounded-xl border border-border overflow-hidden">
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
};

export default RichTextEditor;
