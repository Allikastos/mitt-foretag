"use client";

import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";

type AdminRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
};

type ToolbarState = {
  isParagraph: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBold: boolean;
  isItalic: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isLink: boolean;
  wordCount: number;
};

const emptyContent = "<p></p>";

const initialToolbarState: ToolbarState = {
  isParagraph: false,
  isHeading2: false,
  isHeading3: false,
  isBold: false,
  isItalic: false,
  isBulletList: false,
  isOrderedList: false,
  isLink: false,
  wordCount: 0,
};

const panelInputClassName =
  "min-h-11 w-full rounded-[1.1rem] border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition focus:border-[#C6A15B]";

function normalizeHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  if (/^[a-z]+:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function AdminRichTextEditor({
  value,
  onChange,
  onUploadImage,
}: AdminRichTextEditorProps) {
  const uploadInputId = useId();
  const [activePanel, setActivePanel] = useState<"link" | "image" | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[22rem] px-4 py-4 text-[15px] leading-8 text-[#0B0B0C] outline-none sm:min-h-[26rem] sm:px-5 sm:py-5 md:min-h-[28rem]",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        blockquote: false,
        code: false,
        codeBlock: false,
        hardBreak: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder:
          "Skriv artikeln här. Använd rubriker, listor, länkar och bilder för en tydlig struktur.",
      }),
    ],
    content: value.trim() ? value : emptyContent,
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getHTML());
    },
  });

  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) {
          return initialToolbarState;
        }

        const plainText = currentEditor.getText().trim();

        return {
          isParagraph: currentEditor.isActive("paragraph"),
          isHeading2: currentEditor.isActive("heading", { level: 2 }),
          isHeading3: currentEditor.isActive("heading", { level: 3 }),
          isBold: currentEditor.isActive("bold"),
          isItalic: currentEditor.isActive("italic"),
          isBulletList: currentEditor.isActive("bulletList"),
          isOrderedList: currentEditor.isActive("orderedList"),
          isLink: currentEditor.isActive("link"),
          wordCount: plainText ? plainText.split(/\s+/).length : 0,
        };
      },
    }) ?? initialToolbarState;

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = value.trim() ? value : emptyContent;

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  function closePanel() {
    setActivePanel(null);
    setPanelError(null);
  }

  function openLinkPanel() {
    if (!editor) {
      return;
    }

    const href = editor.getAttributes("link").href as string | undefined;
    const selection = editor.state.selection;
    const selectedText = selection.empty
      ? ""
      : editor.state.doc.textBetween(selection.from, selection.to, " ");

    setLinkUrl(href || "https://");
    setLinkText(selectedText);
    setPanelError(null);
    setActivePanel((current) => (current === "link" ? null : "link"));
  }

  function applyLink() {
    if (!editor) {
      return;
    }

    const href = normalizeHref(linkUrl);

    if (!href) {
      setPanelError("Ange en giltig länkadress.");
      return;
    }

    if (editor.state.selection.empty) {
      const label = linkText.trim() || href;

      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
        )
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }

    closePanel();
  }

  function removeLink() {
    if (!editor) {
      return;
    }

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closePanel();
  }

  function openImagePanel() {
    setPanelError(null);
    setActivePanel((current) => (current === "image" ? null : "image"));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !onUploadImage) {
      return;
    }

    setIsUploadingImage(true);
    setPanelError(null);

    try {
      const publicUrl = await onUploadImage(file);
      setImageUrl(publicUrl);
      setImageAlt((current) => current || file.name.replace(/\.[^.]+$/, ""));
    } catch (error) {
      setPanelError(
        error instanceof Error
          ? error.message
          : "Bilden kunde inte laddas upp."
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  function insertImage() {
    if (!editor) {
      return;
    }

    if (!imageUrl.trim()) {
      setPanelError("Lägg till en bild-URL eller ladda upp en bild.");
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl.trim(),
        alt: imageAlt.trim() || undefined,
      })
      .run();

    setImageUrl("");
    setImageAlt("");
    closePanel();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.45rem] border border-black/10 bg-[#FAFAF7] p-2.5 shadow-[0_18px_45px_-42px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <ToolbarGroup>
              <ToolbarButton
                label="P"
                title="Brödtext"
                isActive={toolbarState.isParagraph}
                onClick={() => editor?.chain().focus().setParagraph().run()}
              />
              <ToolbarButton
                label="H2"
                title="Rubrik nivå 2"
                isActive={toolbarState.isHeading2}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
              />
              <ToolbarButton
                label="H3"
                title="Rubrik nivå 3"
                isActive={toolbarState.isHeading3}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
              />
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolbarButton
                label="B"
                title="Fetstil"
                isActive={toolbarState.isBold}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="I"
                title="Kursiv stil"
                isActive={toolbarState.isItalic}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolbarButton
                label="Lista"
                title="Punktlista"
                isActive={toolbarState.isBulletList}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
              <ToolbarButton
                label="1."
                title="Numrerad lista"
                isActive={toolbarState.isOrderedList}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              />
            </ToolbarGroup>

            <ToolbarGroup>
              <ToolbarButton
                label="Länk"
                isActive={toolbarState.isLink || activePanel === "link"}
                onClick={openLinkPanel}
              />
              <ToolbarButton
                label="Bild"
                isActive={activePanel === "image"}
                onClick={openImagePanel}
              />
            </ToolbarGroup>
          </div>

          <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-[#6B6B6B] uppercase">
            {toolbarState.wordCount} ord
          </div>
        </div>
      </div>

      {activePanel === "link" ? (
        <div className="rounded-[1.4rem] border border-black/10 bg-[#FCFCFA] p-4 shadow-[0_18px_50px_-45px_rgba(0,0,0,0.18)] sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0B0B0C]">
                Länkadress
              </span>
              <input
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
                className={panelInputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0B0B0C]">
                Länktext
              </span>
              <input
                type="text"
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Används när inget textstycke är markerat"
                className={panelInputClassName}
              />
            </label>
          </div>

          <p className="mt-3 text-xs leading-5 text-[#6B6B6B]">
            Markera gärna text i editorn först. Om inget är markerat infogas en ny
            länk med texten ovan.
          </p>

          {panelError ? (
            <p className="mt-3 text-sm text-red-700">{panelError}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <SmallActionButton label="Infoga länk" onClick={applyLink} />
            {toolbarState.isLink ? (
              <SmallActionButton
                label="Ta bort länk"
                tone="secondary"
                onClick={removeLink}
              />
            ) : null}
            <SmallActionButton
              label="Avbryt"
              tone="secondary"
              onClick={closePanel}
            />
          </div>
        </div>
      ) : null}

      {activePanel === "image" ? (
        <div className="rounded-[1.4rem] border border-black/10 bg-[#FCFCFA] p-4 shadow-[0_18px_50px_-45px_rgba(0,0,0,0.18)] sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0B0B0C]">
                Bild-URL
              </span>
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                className={panelInputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0B0B0C]">
                Alt-text
              </span>
              <input
                type="text"
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Beskriv vad bilden visar"
                className={panelInputClassName}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <SmallActionButton label="Infoga bild" onClick={insertImage} />
            <label
              htmlFor={uploadInputId}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[1rem] border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#F7F7F5]"
            >
              {isUploadingImage ? "Laddar upp..." : "Ladda upp bild"}
            </label>
            <SmallActionButton
              label="Avbryt"
              tone="secondary"
              onClick={closePanel}
            />
          </div>

          <input
            id={uploadInputId}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="sr-only"
            disabled={isUploadingImage}
          />

          <p className="mt-3 text-xs leading-5 text-[#6B6B6B]">
            Bilder i artikeln kan läggas in via URL eller laddas upp till Supabase
            Storage och infogas direkt här.
          </p>

          {panelError ? (
            <p className="mt-3 text-sm text-red-700">{panelError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.7rem] border border-black/10 bg-white shadow-[0_24px_60px_-54px_rgba(0,0,0,0.18)] transition focus-within:border-[#C6A15B]">
        <div className="flex items-center justify-between border-b border-black/8 bg-[#FCFCFA] px-4 py-3">
          <p className="text-xs tracking-[0.16em] text-[#6B6B6B] uppercase">
            Visual editor
          </p>
          <p className="text-[11px] text-[#8A8A8A]">
            Rubriker, listor, länkar och bilder
          </p>
        </div>
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:outline-none [&_.ProseMirror_a]:font-medium [&_.ProseMirror_a]:text-[#0B0B0C] [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4 [&_.ProseMirror_em]:italic [&_.ProseMirror_h2]:mt-8 [&_.ProseMirror_h2]:text-[1.75rem] [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-[-0.035em] [&_.ProseMirror_h2]:text-[#0B0B0C] [&_.ProseMirror_h3]:mt-7 [&_.ProseMirror_h3]:text-[1.35rem] [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:tracking-[-0.03em] [&_.ProseMirror_h3]:text-[#0B0B0C] [&_.ProseMirror_img]:w-full [&_.ProseMirror_img]:rounded-[1.25rem] [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-black/8 [&_.ProseMirror_img]:bg-[#F7F7F5] [&_.ProseMirror_li]:pl-1 [&_.ProseMirror_ol]:my-5 [&_.ProseMirror_ol]:space-y-2 [&_.ProseMirror_ol>li]:ml-5 [&_.ProseMirror_ol>li]:list-decimal [&_.ProseMirror_p]:my-4 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#8A8A8A] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_strong]:text-[#0B0B0C] [&_.ProseMirror_ul]:my-5 [&_.ProseMirror_ul]:space-y-2 [&_.ProseMirror_ul>li]:ml-5 [&_.ProseMirror_ul>li]:list-disc"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-black/8 bg-[#FCFCFA] px-4 py-3">
        <p className="text-xs leading-5 text-[#6B6B6B]">
          Innehållet sparas som ren HTML från editorn och kan renderas direkt på
          blogg­sidorna.
        </p>
        <p className="text-[11px] font-medium tracking-[0.16em] text-[#6B6B6B] uppercase">
          SEO-vänlig struktur
        </p>
      </div>
    </div>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 rounded-[1.05rem] border border-black/10 bg-white p-1.5">
      {children}
    </div>
  );
}

function ToolbarButton({
  label,
  title,
  isActive,
  onClick,
}: {
  label: string;
  title?: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={isActive}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center rounded-[0.95rem] px-3 py-2 text-[13px] font-medium transition ${
        isActive
          ? "bg-[#0B0B0C] text-white shadow-[0_10px_25px_-20px_rgba(0,0,0,0.45)]"
          : "bg-transparent text-[#0B0B0C] hover:bg-[#F7F7F5]"
      }`}
    >
      {label}
    </button>
  );
}

function SmallActionButton({
  label,
  onClick,
  tone = "primary",
}: {
  label: string;
  onClick: () => void;
  tone?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-[1rem] px-4 py-2.5 text-sm font-medium transition ${
        tone === "primary"
          ? "bg-[#0B0B0C] text-white hover:opacity-90"
          : "border border-black/10 bg-white text-[#0B0B0C] hover:bg-[#F7F7F5]"
      }`}
    >
      {label}
    </button>
  );
}
