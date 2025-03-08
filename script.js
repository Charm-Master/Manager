import ky from 'ky';

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const headerStatus = document.querySelector('.status');

    let messageQueue = [];
    let isProcessingQueue = false;

    // Function to display a message in the chat
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(`${sender}-message`);

        // Enable markdown
        let messageText = marked.parse(text);
        // Sanitize the message
        messageText = DOMPurify.sanitize(messageText);

        messageDiv.innerHTML = messageText;
        chatMessages.appendChild(messageDiv);

        // Scroll to the bottom of the chat window
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Simulate typing delay
    function simulateTypingDelay(text) {
        return new Promise(resolve => {
            const delay = text.length * 50; // 50ms per character
            typingIndicator.style.display = 'block'; // Show typing indicator
            headerStatus.textContent = 'Online';
            setTimeout(() => {
                typingIndicator.style.display = 'none'; // Hide typing indicator
                headerStatus.textContent = 'Offline';
                resolve();
            }, delay);
        });
    }

    // Function to add messages to the queue
    function enqueueMessage(messageText) {
        messageQueue.push(messageText);
        if (!isProcessingQueue) {
            processMessageQueue();
        }
    }

    // Function to process the message queue
    async function processMessageQueue() {
        if (messageQueue.length === 0) {
            isProcessingQueue = false;
            return;
        }

        isProcessingQueue = true;
        const allUserMessages = [...messageQueue];
        messageQueue = []; // Clear the queue immediately

        // Display user messages in chat
        allUserMessages.forEach(messageText => {
            displayMessage(messageText, 'user');
        });

        // Simulate AI response to all messages
        await simulateAIResponse(allUserMessages);

        // After processing, check if there are more messages
        processMessageQueue();
    }

    // Handle sending a message
    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            enqueueMessage(messageText);
            messageInput.value = '';
        }
    });

    // Handle pressing Enter key
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
            event.preventDefault(); // Prevent adding a new line in the input field
        }
    });

    // Simulate AI response
    async function simulateAIResponse(userMessages) {
        // Show typing indicator and simulate delay
        await simulateTypingDelay("Thinking...");

        let aiResponse;

        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are Charm Manager, an AI designed to sound like a human. Respond in an informal, realistic way, as if you were approaching another person online, cautious of others like why are you contacting me. Avoid repetition and address all messages in one coherent response."
                    },
                    ...userMessages.map(msg => ({ role: "user", content: msg }))
                ],
            });

            aiResponse = completion.content;
        } catch (error) {
            aiResponse = "Oops, something went wrong on my end. Could you try sending that again?";
        }

        await simulateTypingDelay(aiResponse);
        displayMessage(aiResponse, 'ai');
    }
});