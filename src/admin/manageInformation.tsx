import React from "react";
import { Link, useLoaderData, useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import RichTextEditor from "@/admin/RichTextEditor";
import { logoutUser } from "@/lib/auth";
import {
  createInformationContent,
  deleteInformationContent,
  reorderInformationContent,
  updateInformationContent,
  uploadInformationImage,
  type InformationContent,
} from "@/lib/information-api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type FormState = {
  title: string;
  description: string;
  imagePath: string | null;
};

const EMPTY_FORM: FormState = { title: "", description: "", imagePath: null };

export default function ManageInformation() {
  const { user } = useRouteContext({ from: "/admin" });
  const { items: loadedItems } = useLoaderData({ from: "/admin/manage-information" }) as {
    items: InformationContent[];
  };
  const navigate = useNavigate();
  const router = useRouter();
  const logout = useServerFn(logoutUser);
  const createContent = useServerFn(createInformationContent);
  const saveContent = useServerFn(updateInformationContent);
  const removeContent = useServerFn(deleteInformationContent);
  const reorderContent = useServerFn(reorderInformationContent);
  const uploadImage = useServerFn(uploadInformationImage);

  const [items, setItems] = React.useState(loadedItems);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [actionBusy, setActionBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [newForm, setNewForm] = React.useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState<FormState>(EMPTY_FORM);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setItems(loadedItems);
  }, [loadedItems]);

  const refresh = async () => {
    await router.invalidate({
      filter: (match) => match.routeId === "/admin/manage-information",
    });
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      await navigate({ to: "/about" });
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (file: File, setForm: React.Dispatch<React.SetStateAction<FormState>>) => {
    setError("");
    setUploading(true);
    try {
      const base64Data = await fileToBase64(file);
      const result = await uploadImage({ data: { base64Data, contentType: file.type } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm((prev) => ({ ...prev, imagePath: result.path }));
    } catch {
      setError("Unable to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setActionBusy(true);

    try {
      const result = await createContent({ data: newForm });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewForm(EMPTY_FORM);
      await refresh();
    } catch {
      setError("Unable to add content.");
    } finally {
      setActionBusy(false);
    }
  };

  const startEdit = (item: InformationContent) => {
    setError("");
    setPendingDeleteId(null);
    setEditingId(item.id);
    setEditForm({ title: item.title, description: item.description, imagePath: item.imagePath });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = async (id: number) => {
    setError("");
    setActionBusy(true);

    try {
      const result = await saveContent({ data: { id, ...editForm } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      cancelEdit();
      await refresh();
    } catch {
      setError("Unable to update content.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async (item: InformationContent) => {
    setError("");
    setActionBusy(true);

    try {
      const result = await removeContent({ data: { id: item.id } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((content) => content.id !== item.id));
      if (editingId === item.id) cancelEdit();
      setPendingDeleteId(null);
      await refresh();
    } catch {
      setError("Unable to delete content.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setError("");
    setActionBusy(true);
    setItems(reordered);

    try {
      const result = await reorderContent({ data: { orderedIds: reordered.map((item) => item.id) } });
      if (!result.ok) {
        setError(result.error);
        setItems(items);
        return;
      }
      await refresh();
    } catch {
      setError("Unable to reorder content.");
      setItems(items);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(0,119,200,0.10), transparent 55%), radial-gradient(ellipse 60% 40% at 95% 5%, rgba(10,132,255,0.08), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-4 pt-1">
          <img
            src="/unikl-official.png"
            alt="UniKL Royal College of Medicine Perak"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 disabled:opacity-50"
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </header>

        <section className="flex-1 space-y-8 py-10 sm:py-12">
          <div className="space-y-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              ‹ Back to dashboard
            </Link>
            <div className="space-y-3">
              <h1 className="text-4xl font-light tracking-tight text-neutral-900 sm:text-5xl">
                Manage <span className="font-medium">information</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-neutral-600">
                Add, edit, or remove the guides shown on the public Information page.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 border-y border-neutral-200 py-8">
            <h2 className="text-lg font-medium text-neutral-900">Add content</h2>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Title
              </span>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                placeholder="e.g. UniKL Link"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Description
              </span>
              <RichTextEditor
                value={newForm.description}
                onChange={(html) => setNewForm((prev) => ({ ...prev, description: html }))}
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Picture
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file, setNewForm);
                  e.target.value = "";
                }}
                className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-900 hover:file:bg-neutral-200"
              />
              {uploading ? <p className="text-xs text-neutral-500">Uploading…</p> : null}
              {newForm.imagePath ? (
                <img
                  src={newForm.imagePath}
                  alt="Upload preview"
                  className="mt-2 h-32 w-auto rounded-lg border border-neutral-200 object-contain"
                />
              ) : null}
            </div>

            <button
              type="submit"
              disabled={actionBusy || uploading}
              className="rounded-full bg-[#0077C8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0066AD] disabled:opacity-60"
            >
              {actionBusy ? "Saving…" : "Add content"}
            </button>
          </form>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <div className="py-6">
              <p className="text-base text-neutral-600">No content yet. Add one above.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item, index) => {
                const isEditing = editingId === item.id;
                const isPendingDelete = pendingDeleteId === item.id;
                return (
                  <li key={item.id} className="border-t border-neutral-200 pt-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                        />
                        <RichTextEditor
                          value={editForm.description}
                          onChange={(html) => setEditForm((prev) => ({ ...prev, description: html }))}
                        />
                        <div className="space-y-1.5">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleImageUpload(file, setEditForm);
                              e.target.value = "";
                            }}
                            className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-900 hover:file:bg-neutral-200"
                          />
                          {editForm.imagePath ? (
                            <img
                              src={editForm.imagePath}
                              alt="Upload preview"
                              className="mt-2 h-32 w-auto rounded-lg border border-neutral-200 object-contain"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(item.id)}
                            disabled={actionBusy || uploading}
                            className="rounded-full bg-[#0077C8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0066AD] disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={actionBusy}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isPendingDelete ? (
                      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 px-4 py-4">
                        <p className="text-sm text-neutral-800">Delete “{item.title}”? This cannot be undone.</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={actionBusy}
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                          >
                            {actionBusy ? "Deleting…" : "Confirm delete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingDeleteId(null);
                              setError("");
                            }}
                            disabled={actionBusy}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={actionBusy || index === 0}
                            aria-label={`Move ${item.title} up`}
                            className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={actionBusy || index === items.length - 1}
                            aria-label={`Move ${item.title} down`}
                            className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>

                        {item.imagePath ? (
                          <img
                            src={item.imagePath}
                            alt={item.title}
                            className="h-20 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 shrink-0 rounded-lg bg-gradient-to-br from-[#0077C8]/10 to-[#0077C8]/5" />
                        )}

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                          <div
                            className="prose prose-sm max-w-none text-sm leading-6 text-neutral-600 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                            dangerouslySetInnerHTML={{ __html: item.description }}
                          />
                        </div>

                        <div className="flex shrink-0 items-start gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            disabled={actionBusy}
                            aria-label={`Edit ${item.title}`}
                            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              setPendingDeleteId(item.id);
                            }}
                            disabled={actionBusy}
                            aria-label={`Delete ${item.title}`}
                            className="rounded-full p-2 text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="border-t border-neutral-200/80 pb-6 pt-8">
          <p className="text-right text-xs font-medium text-neutral-400">
            © 2026 Information Technology Department RCMP
          </p>
        </footer>
      </div>
    </main>
  );
}
