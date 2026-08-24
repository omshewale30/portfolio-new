import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Link as LinkIcon, ThumbsDown, ThumbsUp } from "lucide-react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import { notes } from "../data/notes";
import { getAnonId } from "../utils/anonId";
import { getReactions, submitReaction, getComments, submitComment } from "../notesApi";
import { getNoteViewCount } from "../analytics";
import { notePageTitle, usePageMetadata } from "../utils/seo";

const COMMENT_MAX_LENGTH = 1000;

const reactionButtonClass = (active) =>
  `note-interactive note-reaction-button flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-all disabled:cursor-wait disabled:opacity-60 ${
    active
      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
      : "border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
  }`;

const MarkdownHeading = ({ level, node, children, headings }) => {
  const sourceLine = node?.position?.start?.line;
  const heading = headings.find((item) => item.line === sourceLine);
  const Tag = `h${level}`;

  return (
    <Tag id={heading?.id} className="prose-heading" aria-label={heading?.text}>
      {children}
      {heading?.id ? (
        <a
          href={`#${heading.id}`}
          className="heading-anchor note-interactive"
          aria-label={`Link to ${heading.text}`}
        >
          <LinkIcon size={16} aria-hidden="true" />
        </a>
      ) : null}
    </Tag>
  );
};

MarkdownHeading.propTypes = {
  level: PropTypes.number.isRequired,
  node: PropTypes.shape({
    position: PropTypes.shape({
      start: PropTypes.shape({ line: PropTypes.number }),
    }),
  }),
  children: PropTypes.node.isRequired,
  headings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      line: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const MarkdownImage = ({ src, alt, title }) => (
  <img src={src} alt={alt || ""} title={title} loading="lazy" decoding="async" />
);

MarkdownImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  title: PropTypes.string,
};

const NoteDetail = () => {
  const { slug } = useParams();
  const note = notes.find((item) => item.slug === slug);
  const noteIndex = note ? notes.indexOf(note) : -1;
  const newerNote = noteIndex > 0 ? notes[noteIndex - 1] : null;
  const olderNote = noteIndex >= 0 && noteIndex < notes.length - 1 ? notes[noteIndex + 1] : null;

  const [reactions, setReactions] = useState(null);
  const [reactionsError, setReactionsError] = useState(null);
  const [reactionStatus, setReactionStatus] = useState("");
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentsError, setCommentsError] = useState(null);
  const [viewCount, setViewCount] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

  const articleRef = useRef(null);
  const commentStatusRef = useRef(null);

  usePageMetadata({
    title: note ? notePageTitle(note.title) : "Notes — Om Shewale",
    description: note?.excerpt || "Essays and working notes on building and evaluating AI systems.",
    path: note ? `/notes/${note.slug}` : "/notes",
    image: note?.image,
    type: note ? "article" : "website",
    publishedAt: note?.publishedAt,
    tags: note?.tags,
  });

  const markdownComponents = useMemo(() => {
    const headings = note?.headings || [];

    return {
      h1: (props) => <MarkdownHeading {...props} level={2} headings={headings} />,
      h2: (props) => <MarkdownHeading {...props} level={2} headings={headings} />,
      h3: (props) => <MarkdownHeading {...props} level={3} headings={headings} />,
      h4: (props) => <MarkdownHeading {...props} level={4} headings={headings} />,
      img: MarkdownImage,
    };
  }, [note?.headings]);

  useEffect(() => {
    if (!note) return;
    const anonId = getAnonId();
    let cancelled = false;

    setReactions(null);
    setComments(null);
    setReactionsError(null);
    setCommentsError(null);

    getReactions(slug, anonId)
      .then((data) => !cancelled && setReactions(data))
      .catch(() => !cancelled && setReactionsError("Couldn't load reactions."));

    getComments(slug)
      .then((data) => !cancelled && setComments(data.comments))
      .catch(() => !cancelled && setCommentsError("Couldn't load comments."));

    getNoteViewCount(slug)
      .then((count) => !cancelled && setViewCount(count))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, note]);

  useEffect(() => {
    if (note?.tier !== "essay") return;

    let frameId = null;
    const updateProgress = () => {
      frameId = null;
      const article = articleRef.current;
      if (!article) return;

      const start = article.offsetTop;
      const finish = Math.max(start + article.offsetHeight - window.innerHeight, start + 1);
      const progress = ((window.scrollY - start) / (finish - start)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };
    const handleScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [note?.tier, slug]);

  if (!note) return <Navigate to="/notes" replace />;

  const handleReaction = async (reaction) => {
    if (!reactions || isSubmittingReaction) return;

    const anonId = getAnonId();
    const previous = reactions;
    setIsSubmittingReaction(true);
    setReactionsError(null);
    setReactionStatus("");

    try {
      const updated = await submitReaction(slug, anonId, reaction);
      setReactions(updated);
      setReactionStatus("Reaction saved.");
    } catch {
      setReactions(previous);
      setReactionsError("Couldn't submit your reaction. Try again.");
    } finally {
      setIsSubmittingReaction(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    setIsSubmittingComment(true);
    setSubmitError(null);
    setSubmitStatus("");

    try {
      const anonId = getAnonId();
      const created = await submitComment(slug, anonId, authorName.trim(), body);
      setComments((previous) => [created, ...(previous || [])]);
      setAuthorName("");
      setCommentBody("");
      setSubmitStatus("Comment posted.");
      window.requestAnimationFrame(() => commentStatusRef.current?.focus());
    } catch {
      setSubmitError("Couldn't post your comment. Try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const tocHeadings = note.headings.filter((heading) => heading.level === 2 || heading.level === 3);
  const showTableOfContents = note.tier === "essay" && (note.wordCount >= 1200 || tocHeadings.length >= 4);
  const commentDescription = submitError ? "comment-counter comment-error" : "comment-counter";

  return (
    <main className="bg-[var(--color-bg-base)]">
      {note.tier === "essay" ? (
        <progress
          className="note-reading-progress"
          aria-label="Reading progress"
          max="100"
          value={readingProgress}
        />
      ) : null}

      <div className="section-shell note-shell">
        <Link to="/notes" className="note-back-link note-interactive">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to notes
        </Link>

        <article ref={articleRef} aria-labelledby="note-title">
          <header>
            <p className="note-meta-line">
              <time dateTime={note.publishedAt}>{note.date}</time>
              <span aria-hidden="true"> · </span>
              <span>{note.readingMinutes} min read</span>
              {viewCount !== null ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>{viewCount} {viewCount === 1 ? "view" : "views"}</span>
                </>
              ) : null}
            </p>
            <h1 id="note-title" className="note-title font-display text-[var(--color-text-primary)]">
              {note.title}
            </h1>
            {note.tags.length ? (
              <ul className="note-tag-list" aria-label="Topics">
                {note.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            ) : null}
          </header>

          {showTableOfContents ? (
            <details className="note-toc">
              <summary className="note-interactive">On this page</summary>
              <nav aria-label="On this page">
                <ol>
                  {tocHeadings.map((heading) => (
                    <li key={`${heading.line}-${heading.id}`} data-level={heading.level}>
                      <a className="note-interactive" href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          ) : null}

          <div className={`prose-content mt-8 ${note.tier === "essay" ? "prose-essay" : "prose-note"}`}>
            <ReactMarkdown components={markdownComponents}>{note.body}</ReactMarkdown>
          </div>

          <section className="note-reaction-section" aria-labelledby="reaction-heading">
            <h2 id="reaction-heading" className="font-display text-xl text-[var(--color-text-primary)]">
              Was this useful?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">A quick reaction helps shape future notes.</p>
            <div className="note-reactions" aria-busy={isSubmittingReaction || reactions === null}>
              <button
                type="button"
                onClick={() => handleReaction("like")}
                disabled={!reactions || isSubmittingReaction}
                aria-pressed={reactions?.your_reaction === "like"}
                className={reactionButtonClass(reactions?.your_reaction === "like")}
              >
                <ThumbsUp size={14} aria-hidden="true" />
                Like
                <span className="text-[var(--color-text-meta)]">{reactions?.like_count ?? "…"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleReaction("dislike")}
                disabled={!reactions || isSubmittingReaction}
                aria-pressed={reactions?.your_reaction === "dislike"}
                className={reactionButtonClass(reactions?.your_reaction === "dislike")}
              >
                <ThumbsDown size={14} aria-hidden="true" />
                Dislike
                <span className="text-[var(--color-text-meta)]">{reactions?.dislike_count ?? "…"}</span>
              </button>
            </div>
            <div className="note-status-row" aria-live="polite" aria-atomic="true">
              {reactionStatus ? <p>{reactionStatus}</p> : null}
              {reactionsError ? <p role="alert">{reactionsError}</p> : null}
            </div>
          </section>
        </article>

        <section className="mt-12" aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="font-display text-2xl text-[var(--color-text-primary)]">Comments</h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-text-muted)]">
            Share a question, counterpoint, or useful example.
          </p>

          <form onSubmit={handleCommentSubmit} className="note-comment-form mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="comment-name" className="note-form-label">
                Name <span>(optional)</span>
              </label>
              <input
                id="comment-name"
                type="text"
                autoComplete="name"
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder="How should your name appear?"
                maxLength={60}
                className="note-comment-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="comment-body" className="note-form-label">Comment</label>
              <textarea
                id="comment-body"
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value.slice(0, COMMENT_MAX_LENGTH))}
                placeholder="Share a thought…"
                required
                maxLength={COMMENT_MAX_LENGTH}
                aria-invalid={Boolean(submitError)}
                aria-describedby={commentDescription}
                className="note-comment-field min-h-[120px] resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span id="comment-counter" className="font-mono text-xs text-[var(--color-text-meta)]">
                {commentBody.length}/{COMMENT_MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={isSubmittingComment || !commentBody.trim()}
                className="btn-primary note-interactive min-h-11 rounded-xl px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingComment ? "Posting…" : "Post comment"}
              </button>
            </div>
            {submitError ? (
              <p id="comment-error" role="alert" className="note-form-message">{submitError}</p>
            ) : null}
            {submitStatus ? (
              <p ref={commentStatusRef} tabIndex="-1" role="status" className="note-form-message">
                {submitStatus}
              </p>
            ) : null}
          </form>

          <div className="mt-8 flex flex-col gap-6" aria-live="polite">
            {commentsError ? <p role="alert" className="note-form-message">{commentsError}</p> : null}
            {comments?.length === 0 && !commentsError ? (
              <p className="font-mono text-xs text-[var(--color-text-meta)]">No comments yet — be the first.</p>
            ) : null}
            {comments?.map((comment) => (
              <article key={comment.id} className="border-b border-[var(--color-border-muted)] pb-6">
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                    {comment.author_name || "Anonymous"}
                  </span>
                  <time dateTime={comment.created_at} className="font-mono text-xs text-[var(--color-text-meta)]">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </header>
                <p className="note-comment-body mt-2" style={{ whiteSpace: "pre-wrap" }}>{comment.body}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="note-continuation" aria-label="Continue reading">
          <Link to="/notes" className="note-interactive note-continuation-link">
            <ArrowLeft size={15} aria-hidden="true" /> All notes
          </Link>
          {olderNote ? (
            <Link to={`/notes/${olderNote.slug}`} className="note-interactive note-continuation-link">
              Older note <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : null}
          {newerNote ? (
            <Link to={`/notes/${newerNote.slug}`} className="note-interactive note-continuation-link">
              Newer note <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
};

export default NoteDetail;
