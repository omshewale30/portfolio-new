
// API wrapper for chat submission
/**
 * Submits a chat message to the backend
 * @param {string} userInput - The user's message text
 * @returns {Promise} - Promise that resolves with the agent's response
 */
export const submitChat = async (user_id, userInput) => {
    const response = await fetch("https://portfolio-backend-16cp.onrender.com/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user_id,
            user_input: userInput,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to send message")
    }

    return await response.json()
}



