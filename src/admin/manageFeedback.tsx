import React from "react";
import { Link, useLoaderData, useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2 } from "lucide-react";
import { logoutUser } from "@/lib/auth";
import {
  createFeedbackQuestion,
  deleteFeedbackQuestion,
  updateFeedbackQuestion,
  type FeedbackQuestion,
} from "@/lib/feedback-api";

type EditState = {
  question: string;
  sortOrder: string;
};

export default function ManageFeedback() {
  const { user } = useRouteContext({ from: "/admin" });
  const { questions: loadedQuestions } = useLoaderData({ from: "/admin/manage-feedback" }) as {
    questions: FeedbackQuestion[];
  };
  const navigate = useNavigate();
  const router = useRouter();
  const logout = useServerFn(logoutUser);
  const createQuestion = useServerFn(createFeedbackQuestion);
  const saveQuestion = useServerFn(updateFeedbackQuestion);
  const removeQuestion = useServerFn(deleteFeedbackQuestion);

  const [questions, setQuestions] = React.useState(loadedQuestions);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [newQuestion, setNewQuestion] = React.useState("");
  const [newSortOrder, setNewSortOrder] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null);
  const [editState, setEditState] = React.useState<EditState>({ question: "", sortOrder: "" });
  const [actionBusy, setActionBusy] = React.useState(false);

  React.useEffect(() => {
    setQuestions(loadedQuestions);
  }, [loadedQuestions]);

  const nextSortOrder = React.useMemo(() => {
    if (questions.length === 0) return 1;
    return Math.max(...questions.map((item) => item.sortOrder)) + 1;
  }, [questions]);

  const refresh = async () => {
    await router.invalidate({
      filter: (match) => match.routeId === "/admin/manage-feedback",
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setActionBusy(true);

    try {
      const result = await createQuestion({
        data: {
          question: newQuestion,
          sortOrder: newSortOrder ? Number(newSortOrder) : undefined,
        },
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNewQuestion("");
      setNewSortOrder("");
      await refresh();
    } catch {
      setError("Unable to add question.");
    } finally {
      setActionBusy(false);
    }
  };

  const startEdit = (item: FeedbackQuestion) => {
    setError("");
    setPendingDeleteId(null);
    setEditingId(item.id);
    setEditState({
      question: item.question,
      sortOrder: String(item.sortOrder),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ question: "", sortOrder: "" });
  };

  const handleUpdate = async (id: number) => {
    setError("");
    setActionBusy(true);

    try {
      const result = await saveQuestion({
        data: {
          id,
          question: editState.question,
          sortOrder: Number(editState.sortOrder),
        },
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      cancelEdit();
      await refresh();
    } catch {
      setError("Unable to update question.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async (item: FeedbackQuestion) => {
    setError("");
    setActionBusy(true);

    try {
      const result = await removeQuestion({ data: { id: item.id } });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setQuestions((current) => current.filter((question) => question.id !== item.id));
      if (editingId === item.id) cancelEdit();
      setPendingDeleteId(null);
      await refresh();
    } catch {
      setError("Unable to delete question.");
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
          <div className="space-y-4 animate-[manageIn_0.6s_ease-out_both]">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              ‹ Back to dashboard
            </Link>
            <div className="space-y-3">
              <h1 className="text-4xl font-light tracking-tight text-neutral-900 sm:text-5xl">
                Manage <span className="font-medium">questions</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-neutral-600">
                Add, Edit, or Remove feedback form questions.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="animate-[manageIn_0.6s_ease-out_0.08s_both] space-y-4 border-y border-neutral-200 py-8"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-neutral-900">Add question</h2>
              <p className="text-sm text-neutral-500">
                Leave order blank to place it at the end.
              </p>
            </div>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
              required
              placeholder="Enter a new feedback question…"
              className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
            />
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Order
                </span>
                <input
                  type="number"
                  min={1}
                  max={255}
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(e.target.value)}
                  placeholder={String(nextSortOrder)}
                  className="w-24 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                />
              </label>
              <button
                type="submit"
                disabled={actionBusy}
                className="rounded-full bg-[#0077C8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0066AD] disabled:opacity-60"
              >
                {actionBusy ? "Saving…" : "Add question"}
              </button>
            </div>
          </form>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {questions.length === 0 ? (
            <div className="animate-[manageIn_0.6s_ease-out_0.1s_both] py-6">
              <p className="text-base text-neutral-600">No questions yet. Add one above.</p>
            </div>
          ) : (
            <ul className="space-y-4 animate-[manageIn_0.6s_ease-out_0.1s_both]">
              {questions.map((item) => {
                const isEditing = editingId === item.id;
                const isPendingDelete = pendingDeleteId === item.id;
                return (
                  <li key={item.id} className="border-t border-neutral-200 pt-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="space-y-1.5">
                            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                              Order
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={255}
                              value={editState.sortOrder}
                              onChange={(e) =>
                                setEditState((prev) => ({ ...prev, sortOrder: e.target.value }))
                              }
                              className="w-24 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                            />
                          </label>
                        </div>
                        <textarea
                          value={editState.question}
                          onChange={(e) =>
                            setEditState((prev) => ({ ...prev, question: e.target.value }))
                          }
                          rows={3}
                          className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(item.id)}
                            disabled={actionBusy}
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
                        <p className="text-sm text-neutral-800">
                          Delete question {item.sortOrder}? This cannot be undone.
                        </p>
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
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="font-mono text-xs font-medium text-[#0077C8] tabular-nums">
                            Q{String(item.sortOrder).padStart(2, "0")}
                          </p>
                          <p className="text-sm leading-6 text-neutral-800">{item.question}</p>
                          {item.responseCount > 0 ? (
                            <p className="text-xs text-neutral-500">
                              {item.responseCount} response{item.responseCount === 1 ? "" : "s"} — cannot delete
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-start gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            disabled={actionBusy}
                            aria-label={`Edit question ${item.sortOrder}`}
                            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.responseCount > 0) {
                                setError(
                                  "Cannot delete a question that already has responses.",
                                );
                                return;
                              }
                              setError("");
                              setPendingDeleteId(item.id);
                            }}
                            disabled={actionBusy || item.responseCount > 0}
                            aria-label={`Delete question ${item.sortOrder}`}
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

      <style>{`
        @keyframes manageIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
