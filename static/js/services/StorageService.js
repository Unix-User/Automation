class StorageService {
    savePosition(x, y) {
        localStorage.setItem('chatPosition', JSON.stringify({ x, y }));
    }

    loadPosition() {
        const position = localStorage.getItem('chatPosition');
        return position ? JSON.parse(position) : null;
    }

    saveDarkMode(isDarkMode) {
        localStorage.setItem('darkMode', isDarkMode);
    }

    getDarkMode() {
        return localStorage.getItem('darkMode') === 'true';
    }
}

export default new StorageService(); 