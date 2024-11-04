class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.clearButton = document.getElementById('clear-chat');
        this.themeButton = document.getElementById('toggle-theme');
        this.charCounter = document.querySelector('.char-counter');
        
        this.messageHistory = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        // Inicializar eventos
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.messageInput.addEventListener('input', () => this.handleInput());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.clearButton.addEventListener('click', () => this.clearChat());
        this.themeButton.addEventListener('click', () => this.toggleTheme());
        
        // Carregar histórico do localStorage
        this.loadHistory();
        
        // Configurar auto-resize do textarea
        this.setupTextareaResize();
        
        // Verificar tema inicial
        this.checkInitialTheme();
    }

    handleInput() {
        const text = this.messageInput.value;
        const length = text.length;
        this.charCounter.textContent = `${length}/1000`;
        this.sendButton.disabled = text.trim().length === 0;
        this.adjustTextareaHeight();
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendButton.disabled) {
                this.chatForm.requestSubmit();
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isProcessing) return;

        const message = this.sanitizeInput(this.messageInput.value.trim());
        if (!message) return;

        this.isProcessing = true;
        this.sendButton.disabled = true;

        try {
            this.addMessage(message, 'user');
            this.clearInput();
            this.showTypingIndicator();

            const response = await this.sendMessage(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.hideTypingIndicator();
            this.addErrorMessage();
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">${type === 'user' ? 'Você' : 'Bot'} • ${timestamp}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Salvar no histórico
        this.messageHistory.push({ content, type, timestamp });
        this.saveHistory();
    }

    formatMessage(content) {
        // Escapar caracteres HTML primeiro
        content = content.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

        // Converter URLs em links clicáveis
        content = content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Formatar código inline
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Formatar blocos de código
        content = content.replace(
            /```(\w+)?\n([\s\S]+?)\n```/g,
            (_, lang, code) => `
                <pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>
            `
        );

        // Converter quebras de linha em <br>
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    async sendMessage(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        return await response.text();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = this.chatMessages.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addErrorMessage() {
        this.addMessage(
            'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
            'bot'
        );
    }

    clearChat() {
        if (confirm('Tem certeza que deseja limpar o histórico do chat?')) {
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <h3>Bem-vindo ao Chat!</h3>
                    <p>Comece uma nova conversa digitando sua mensagem abaixo.</p>
                </div>
            `;
            this.messageHistory = [];
            localStorage.removeItem('chatHistory');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    }

    checkInitialTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    setupTextareaResize() {
        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
    }

    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        
        // Definir altura mínima e máxima
        const minHeight = 20;
        const maxHeight = 150;
        
        // Calcular nova altura
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
        
        textarea.style.height = `${newHeight}px`;
        
        // Ajustar padding do container se necessário
        const container = textarea.closest('.chat-input-container');
        if (container) {
            const defaultPadding = 16;
            const extraPadding = Math.max(0, (newHeight - minHeight) / 2);
            container.style.paddingTop = `${defaultPadding + extraPadding}px`;
            container.style.paddingBottom = `${defaultPadding + extraPadding}px`;
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    loadHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            this.messageHistory = JSON.parse(savedHistory);
            this.messageHistory.forEach(msg => this.addMessage(msg.content, msg.type));
        }
    }

    saveHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messageHistory));
    }

    sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }

    clearInput() {
        this.messageInput.value = '';
        this.messageInput.style.height = '20px';
        this.handleInput();
        const container = this.messageInput.closest('.chat-input-container');
        if (container) {
            container.style.paddingTop = '16px';
            container.style.paddingBottom = '16px';
        }
    }
}

// Inicializar o chat quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
}); 