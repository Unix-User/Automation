class ChatManager {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.initializeEventListeners();
        this.startSessionTimer();
        this.initializeDragAndDrop();
    }
    
    initializeElements() {
        this.messageInput = document.getElementById('message-input');
        this.chatMessages = document.getElementById('chat-messages');
        this.sendButton = document.getElementById('send-button');
        this.messageCount = document.getElementById('message-count');
        this.sessionTime = document.getElementById('session-time');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.clearChatButton = document.getElementById('clear-chat');
        this.exportChatButton = document.getElementById('export-chat');
        this.notificationToggle = document.getElementById('notification-toggle');
    }
    
    initializeState() {
        this.chatHistory = [];
        this.sessionStartTime = new Date();
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.updateDarkMode();
    }
    
    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
        this.clearChatButton.addEventListener('click', () => this.clearChat());
        this.exportChatButton.addEventListener('click', () => this.exportChat());
    }
    
    startSessionTimer() {
        setInterval(() => {
            const duration = new Date() - this.sessionStartTime;
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            this.sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessageToChat('user', message);
        this.messageInput.value = '';
        
        try {
            const response = await this.sendMessageToServer(message);
            this.addMessageToChat('assistant', response.response);
            if (this.notificationToggle.checked) {
                this.playNotificationSound();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessageToChat('error', 'Erro ao enviar mensagem. Tente novamente.');
        }
    }
    
    async sendMessageToServer(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return response.json();
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
    
    updateMessageCount() {
        this.messageCount.textContent = this.chatHistory.length;
    }
    
    updateChatSummary() {
        const summary = document.getElementById('chat-summary');
        summary.innerHTML = '';
        
        const lastMessages = this.chatHistory.slice(-3);
        lastMessages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'summary-item';
            div.textContent = msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '');
            summary.appendChild(div);
        });
    }
    
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.updateDarkMode();
    }
    
    updateDarkMode() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        this.darkModeToggle.checked = this.isDarkMode;
    }
    
    clearChat() {
        if (confirm('Tem certeza que deseja limpar o histórico do chat?')) {
            this.chatMessages.innerHTML = '';
            this.chatHistory = [];
            this.updateMessageCount();
            this.updateChatSummary();
        }
    }
    
    exportChat() {
        const exportData = {
            timestamp: new Date().toISOString(),
            messages: this.chatHistory
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    playNotificationSound() {
        const audio = new Audio('/static/sounds/notification.mp3');
        audio.play().catch(e => console.log('Error playing notification sound:', e));
    }
    
    initializeDragAndDrop() {
        const chatHeader = document.querySelector('.chat-header');
        const chatContainer = document.querySelector('.chat-container');
        const dragArea = document.querySelector('.chat-drag-area');
        
        this.initializeResize(chatContainer, dragArea);
        this.initializeDrag(chatHeader, chatContainer, dragArea);
    }

    initializeDrag(handle, element, boundary) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            if (e.target.closest('.chat-actions')) return;

            const event = e.type === 'mousedown' ? e : e.touches[0];
            
            const boundaryRect = boundary.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            xOffset = elementRect.left - boundaryRect.left;
            yOffset = elementRect.top - boundaryRect.top;
            
            initialX = event.clientX - xOffset;
            initialY = event.clientY - yOffset;

            if (e.target === handle || handle.contains(e.target)) {
                isDragging = true;
                element.classList.add('dragging');
                
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
            }
        };

        const dragEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('dragging');
            
            this.checkSnapPosition(element, boundary);
            
            this.savePosition(xOffset, yOffset);
        };

        const drag = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            const event = e.type === 'mousemove' ? e : e.touches[0];
            
            currentX = event.clientX - initialX;
            currentY = event.clientY - initialY;

            const boundaryRect = boundary.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            const maxX = boundaryRect.width - elementRect.width;
            const maxY = boundaryRect.height - elementRect.height;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            xOffset = currentX;
            yOffset = currentY;

            this.setElementPosition(element, currentX, currentY);
        };

        handle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        handle.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        const savedPosition = this.loadPosition();
        if (savedPosition) {
            this.setElementPosition(element, savedPosition.x, savedPosition.y);
        }
    }

    checkSnapPosition(element, boundary) {
        const threshold = 50; // pixels da borda para ativar o snap
        const elementRect = element.getBoundingClientRect();
        const boundaryRect = boundary.getBoundingClientRect();
        
        const leftDistance = elementRect.left - boundaryRect.left;
        const rightDistance = boundaryRect.right - elementRect.right;
        const topDistance = elementRect.top - boundaryRect.top;
        const bottomDistance = boundaryRect.bottom - elementRect.bottom;

        // Snap horizontal
        if (leftDistance < threshold) {
            element.style.transform = `translate(0px, ${elementRect.top - boundaryRect.top}px)`;
            element.classList.add('snap-left');
            setTimeout(() => element.classList.remove('snap-left'), 300);
        } else if (rightDistance < threshold) {
            const x = boundaryRect.width - elementRect.width;
            element.style.transform = `translate(${x}px, ${elementRect.top - boundaryRect.top}px)`;
            element.classList.add('snap-right');
            setTimeout(() => element.classList.remove('snap-right'), 300);
        }

        // Snap vertical
        if (topDistance < threshold) {
            element.style.transform = `translate(${elementRect.left - boundaryRect.left}px, 0px)`;
        } else if (bottomDistance < threshold) {
            const y = boundaryRect.height - elementRect.height;
            element.style.transform = `translate(${elementRect.left - boundaryRect.left}px, ${y}px)`;
        }
    }

    savePosition(x, y) {
        localStorage.setItem('chatPosition', JSON.stringify({ x, y }));
    }

    loadPosition() {
        const position = localStorage.getItem('chatPosition');
        return position ? JSON.parse(position) : null;
    }

    setElementPosition(element, x, y) {
        element.style.transform = `translate(${x}px, ${y}px)`;
    }

    initializeResize(element, boundary) {
        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            element.appendChild(handle);
            return handle;
        });

        handles.forEach(handle => {
            handle.addEventListener('mousedown', this.initializeResizeHandle.bind(this, handle, element, boundary));
        });
    }

    initializeResizeHandle(handle, element, boundary, e) {
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;
        const handleClass = handle.className;

        const resize = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (handleClass.includes('right')) {
                newWidth = startWidth + deltaX;
            } else if (handleClass.includes('left')) {
                newWidth = startWidth - deltaX;
            }

            if (handleClass.includes('bottom')) {
                newHeight = startHeight + deltaY;
            } else if (handleClass.includes('top')) {
                newHeight = startHeight - deltaY;
            }

            newWidth = Math.min(Math.max(320, newWidth), window.innerWidth * 0.9);
            newHeight = Math.min(Math.max(400, newHeight), window.innerHeight * 0.9);

            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    initializeSnapPositions(element) {
        const threshold = 50; // pixels from edge to trigger snap

        const checkSnap = () => {
            const rect = element.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            
            if (rect.left < threshold) {
                element.classList.add('snap-left');
                setTimeout(() => element.classList.remove('snap-left'), 300);
            } else if (rect.right > windowWidth - threshold) {
                element.classList.add('snap-right');
                setTimeout(() => element.classList.remove('snap-right'), 300);
            }
        };

        element.addEventListener('transitionend', checkSnap);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
}); 