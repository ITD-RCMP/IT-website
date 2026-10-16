import React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const buttons = [
    {
      label: "Bold",
      icon: Bold,
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-t-xl border border-b-0 border-neutral-200 bg-neutral-50 p-1.5">
      {buttons.map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={`rounded-lg p-1.5 transition ${
            active ? "bg-[#0077C8] text-white" : "text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none px-4 py-3 text-sm leading-6 text-neutral-800 outline-none min-h-[140px] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div>
      <EditorToolbar editor={editor} />
      <div className="rounded-b-xl border border-neutral-200 bg-white focus-within:border-[#0077C8] focus-within:ring-2 focus-within:ring-[#0077C8]/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
