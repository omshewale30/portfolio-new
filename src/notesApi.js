const apiUrl = import.meta.env.VITE_JARVIS_API_URL || "http://localhost:8000";
const base = apiUrl.replace(/\/$/, "");

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail;
        const error = new Error(
            (typeof detail === "object" && detail?.message) ||
            (typeof detail === "string" && detail) ||
            "Request failed",
        );
        error.code = typeof detail === "object" ? detail?.code : undefined;
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const getReactions = async (slug, anonId) => {
    const url = new URL(`${base}/notes/${slug}/reactions`);
    if (anonId) url.searchParams.set("anon_id", anonId);
    return handleResponse(await fetch(url));
};

export const submitReaction = async (slug, anonId, reaction) => {
    const response = await fetch(`${base}/notes/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anon_id: anonId, reaction }),
    });
    return handleResponse(response);
};

export const getComments = async (slug) => {
    return handleResponse(await fetch(`${base}/notes/${slug}/comments`));
};

export const submitComment = async (slug, anonId, authorName, body) => {
    const response = await fetch(`${base}/notes/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            anon_id: anonId,
            author_name: authorName || undefined,
            body,
        }),
    });
    return handleResponse(response);
};
