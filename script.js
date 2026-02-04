document.addEventListener('DOMContentLoaded', () => {
    // --- START OF CONFIGURATION ---

    // WARNING: Do not share this file publicly with your API key included.
    // Your API key is visible in this code and could be stolen. if you do share it, hide or remove the API key first.
    const API_KEY = "ai api key here";

    // The AI model to use. You can change this to any model your API key has access to.
    const AI_MODEL = "model name here";

    // The system prompt that guides the AI's behavior.
    const SYSTEM_PROMPT = "You're vortex a personal assistant and helper you should be helpful, concise, and engaging in your responses.";
    
    //the api of your ai provider
    const API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"; //you can change this to your ai provider endpoint if you're not using openrouter

    // --- END OF CONFIGURATION ---

    const chatContainer = document.getElementById('chat-container');
    const inputForm = document.getElementById('input-form');
    const messageInput = document.getElementById('message-input');

    // Store conversation history
    let conversationHistory = [{
        role: "system",
        content: SYSTEM_PROMPT
    }];

    inputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = messageInput.value.trim();
        if (!userInput) return;

        addMessage(userInput, 'user');
        conversationHistory.push({ role: "user", content: userInput });
        messageInput.value = '';

        await getAiResponse();
    });

    function addMessage(content, role, isThinking = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

        if (role === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.textContent = content;
        } else {
            messageDiv.classList.add('bot-message');
            const botAvatar = document.createElement('div');
            botAvatar.classList.add('bot-avatar');
            messageDiv.appendChild(botAvatar);

            const messageContent = document.createElement('span');

            if (isThinking) {
                messageDiv.id = 'thinking-bubble';
                messageDiv.classList.add('thinking');
                messageContent.textContent = '...';
            } else {
                messageContent.textContent = content;
            }
            messageDiv.appendChild(messageContent);
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function getAiResponse() {
        addMessage('', 'bot', true);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            conversationHistory.push({ role: "assistant", content: botResponse });

            const thinkingBubble = document.getElementById('thinking-bubble');
            if (thinkingBubble) {
                thinkingBubble.remove();
            }
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error("Failed to fetch AI response:", error);
            const thinkingBubble = document.getElementById('thinking-bubble');
            if (thinkingBubble) {
                thinkingBubble.remove();
            }
            addMessage("Sorry, I ran into an error. Please check the console for details.", 'bot');
        }
    }
});
