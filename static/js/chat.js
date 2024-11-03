function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'agent-message'}`;
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = isUser ? 'You' : 'AI Assistant';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(header);
    messageDiv.appendChild(messageContent);
    
    document.getElementById('chatHistory').appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const typingIndicator = document.getElementById('typingIndicator');
    
    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const promptInput = document.getElementById('prompt');
        const submitBtn = this.querySelector('button[type="submit"]');
        const userMessage = promptInput.value.trim();
        
        if (!userMessage) return;
        
        // Add user message
        addMessage(userMessage, true);
        
        // Clear input
        promptInput.value = '';
        
        // Show typing indicator
        typingIndicator.style.display = 'block';
        
        // Disable submit button
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ prompt: userMessage })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add agent responses with proper formatting
            if (data.response_1) {
                addMessage(data.response_1);
            }
            if (data.response_2) {
                addMessage(data.response_2);
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error: Failed to get response from the AI assistants.');
        } finally {
            submitBtn.disabled = false;
            typingIndicator.style.display = 'none';
        }
    });

    // Initial scroll to bottom
    scrollToBottom();
}); 