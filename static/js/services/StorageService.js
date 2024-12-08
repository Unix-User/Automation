class StorageService {
    static setDarkMode(isDarkMode) {
        localStorage.setItem('darkMode', isDarkMode);
    }

    static getDarkMode() {
        return localStorage.getItem('darkMode') === 'true';
    }

    static setChatPosition(position) {
        localStorage.setItem('chatPosition', JSON.stringify(position));
    }

    static getChatPosition() {
        const position = localStorage.getItem('chatPosition');
        return position ? JSON.parse(position) : null;
    }
}

export default StorageService; 