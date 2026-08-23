const apiUrl = import.meta.env.VITE_JARVIS_API_URL || "http://localhost:8000";
const base = apiUrl.replace(/\/$/, "");

// Fire-and-forget: a failed/blocked analytics call must never surface an
// error to the UI or affect rendering.
export const trackPageView = (path, noteSlug) => {
    fetch(`${base}/events/pageview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, note_slug: noteSlug || undefined }),
    }).catch(() => {});
};

export const getNoteViewCount = async (slug) => {
    const response = await fetch(`${base}/notes/${slug}/views`);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    return data.view_count;
};
