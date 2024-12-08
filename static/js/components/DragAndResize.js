class DragAndResize {
    constructor(element, boundary, options = {}) {
        this.element = element;
        this.boundary = boundary;
        this.options = {
            onPositionChange: () => {},
            ...options
        };
        
        this.initializeDragAndDrop();
    }

    initializeDragAndDrop() {
        const chatHeader = this.element.querySelector('.chat-header');
        this.initializeResize();
        this.initializeDrag(chatHeader);
    }

    // ... (mover os métodos de drag e resize do ChatManager para cá)
}

export default DragAndResize; 