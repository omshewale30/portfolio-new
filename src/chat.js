const apiUrl = import.meta.env.VITE_JARVIS_API_URL || "http://localhost:8000";
const chatUrl = `${apiUrl.replace(/\/$/, "")}/chat`;

export const submitChat = async (userId, userInput, previousResponseId = null) => {
    if (!chatUrl) {
        const error = new Error("Public Jarvis API is not configured.");
        error.code = "configuration_error";
        throw error;
    }

    const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            user_input: userInput,
            previous_response_id: previousResponseId || undefined,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail;
        const error = new Error(
            (typeof detail === "object" && detail?.message) ||
            (typeof detail === "string" && detail) ||
            "Failed to send message",
        );
        error.code = typeof detail === "object" ? detail?.code : undefined;
        error.status = response.status;
        throw error;
    }

    return response.json();
};
