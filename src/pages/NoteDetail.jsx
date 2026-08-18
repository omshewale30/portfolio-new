import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { notes } from "../data/notes";
import { getAnonId } from "../utils/anonId";
import { getReactions, submitReaction, getComments, submitComment } from "../notesApi";
import { getNoteViewCount } from "../analytics";

const COMMENT_MAX_LENGTH = 1000;

const reactionButtonClass = (active) =>
  `flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-all ${
    active
      ? "border-[var(--color-primary)] bg-[rgba(200,168,130,0.12)] text-[var(--color-primary)]"
      : "border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
  }`;

const NoteDetail = () => {
  const { slug } = useParams();
  const note = notes.find((n) => n.slug === slug);

  const [reactions, setReactions] = useState(null);
  const [reactionsError, setReactionsError] = useState(null);

  const [comments, setComments] = useState(null);
  const [commentsError, setCommentsError] = useState(null);

  const [viewCount, setViewCount] = useState(null);

  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!note) return;
    const anonId = getAnonId();

    let cancelled = false;

    getReactions(slug, anonId)
      .then((data) => !cancelled && setReactions(data))
      .catch(() => !cancelled && setReactionsError("Couldn't load reactions."));

    getComments(slug)
      .then((data) => !cancelled && setComments(data.comments))
      .catch(() => !cancelled && setCommentsError("Couldn't load comments."));

    // Decorative metric — failure just hides the label, never shown as an error.
    getNoteViewCount(slug)
      .then((count) => !cancelled && setViewCount(count))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, note]);

  if (!note) return <Navigate to="/notes" replace />;

  const handleReaction = async (reaction) => {
    const anonId = getAnonId();
    const previous = reactions;
    setReactionsError(null);
    try {
      const updated = await submitReaction(slug, anonId, reaction);
      setReactions(updated);
    } catch {
      setReactions(previous);
      setReactionsError("Couldn't submit your reaction. Try again.");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    setIsSubmittingComment(true);
    setSubmitError(null);
    try {
      const anonId = getAnonId();
      const created = await submitComment(slug, anonId, authorName.trim(), body);
      setComments((prev) => [created, ...(prev || [])]);
      setAuthorName("");
      setCommentBody("");
    } catch {
      setSubmitError("Couldn't post your comment. Try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <main className="bg-[var(--color-bg-base)]">
      <div className="section-shell max-w-3xl">
        <Link
          to="/notes"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)] no-underline transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to notes
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
          {note.date}
          {viewCount !== null && (
            <span> · {viewCount} {viewCount === 1 ? "view" : "views"}</span>
          )}
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
          {note.title}
        </h1>

        <div
          className={note.tier === "essay" ? "prose-essay mt-8 text-[var(--color-text-muted)]" : "mt-8 text-base leading-relaxed text-[var(--color-text-muted)]"}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {note.body}
        </div>

        <div className="mt-12 flex items-center gap-3 border-t border-[var(--color-border-muted)] pt-8">
          <button
            type="button"
            onClick={() => handleReaction("like")}
            aria-pressed={reactions?.your_reaction === "like"}
            className={reactionButtonClass(reactions?.your_reaction === "like")}
          >
            <ThumbsUp size={14} aria-hidden="true" />
            Like
            <span className="text-[var(--color-text-meta)]">{reactions?.like_count ?? "–"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleReaction("dislike")}
            aria-pressed={reactions?.your_reaction === "dislike"}
            className={reactionButtonClass(reactions?.your_reaction === "dislike")}
          >
            <ThumbsDown size={14} aria-hidden="true" />
            Dislike
            <span className="text-[var(--color-text-meta)]">{reactions?.dislike_count ?? "–"}</span>
          </button>
          {reactionsError && (
            <span className="font-mono text-xs text-[var(--color-text-meta)]">{reactionsError}</span>
          )}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-[var(--color-text-primary)]">Comments</h2>

          <form onSubmit={handleCommentSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Name (optional)"
              maxLength={60}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            />
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
              placeholder="Share a thought..."
              required
              className="min-h-[100px] resize-y rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--color-text-meta)]">
                {commentBody.length}/{COMMENT_MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={isSubmittingComment || !commentBody.trim()}
                className="btn-primary rounded-xl px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingComment ? "Posting..." : "Post comment"}
              </button>
            </div>
            {submitError && (
              <span className="font-mono text-xs text-[var(--color-text-meta)]">{submitError}</span>
            )}
          </form>

          <div className="mt-8 flex flex-col gap-6">
            {commentsError && (
              <p className="font-mono text-xs text-[var(--color-text-meta)]">{commentsError}</p>
            )}
            {comments?.length === 0 && !commentsError && (
              <p className="font-mono text-xs text-[var(--color-text-meta)]">
                No comments yet — be the first.
              </p>
            )}
            {comments?.map((comment) => (
              <div key={comment.id} className="border-b border-[var(--color-border-muted)] pb-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                    {comment.author_name || "Anonymous"}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-text-meta)]">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p
                  className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default NoteDetail;
