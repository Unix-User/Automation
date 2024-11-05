class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.messageCount = document.getElementById('message-count');
        this.chatHistory = [];
    }

    addMessageToChat(type, content) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messageWrapper.appendChild(messageDiv);
        
        this.chatMessages.appendChild(messageWrapper);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        this.chatHistory.push({
            type,
            content,
            timestamp: new Date().toISOString()
        });
        
        this.updateMessageCount();
        this.updateChatSummary();
    }

    // ... (rest of UI methods from original ChatManager)
}

export default ChatUI; 