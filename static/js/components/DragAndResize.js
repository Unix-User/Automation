class DragAndResize {
    constructor(element, boundary, handle, storageService) {
        this.element = element;
        this.boundary = boundary;
        this.handle = handle;
        this.storageService = storageService;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;

        this.initializeDrag();
        this.initializeResize();
        this.loadSavedPosition();
    }

    initializeDrag() {
        this.handle.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));
        
        this.handle.addEventListener('touchstart', this.dragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('touchend', this.dragEnd.bind(this));
    }

    // ... (rest of drag and resize methods from original ChatManager)
}

export default DragAndResize; 