import ApiService from './services/ApiService.js';
import StorageService from './services/StorageService.js';
import DragAndResize from './components/DragAndResize.js';
import ChatUI from './components/ChatUI.js';

class ChatManager {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.initializeServices();
        this.initializeEventListeners();
        this.startSessionTimer();
    }
    
    initializeElements() {
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.sessionTime = document.getElementById('session-time');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.clearChatButton = document.getElementById('clear-chat');
        this.exportChatButton = document.getElementById('export-chat');
        this.notificationToggle = document.getElementById('notification-toggle');
    }
    
    initializeState() {
        this.sessionStartTime = new Date();
        this.isDarkMode = StorageService.getDarkMode();
        this.updateDarkMode();
    }

    initializeServices() {
        this.apiService = ApiService;
        this.chatUI = new ChatUI();
        
        const chatContainer = document.querySelector('.chat-container');
        const dragArea = document.querySelector('.chat-drag-area');
        const chatHeader = document.querySelector('.chat-header');
        
        this.dragAndResize = new DragAndResize(
            chatContainer,
            dragArea,
            chatHeader,
            StorageService
        );
    }

    // ... (remaining methods with simplified logic using the new services)
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
}); 