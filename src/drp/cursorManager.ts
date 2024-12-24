import { PerfectCursor } from 'perfect-cursors';
import { getEmojiForNodeId } from '../utils/emojiMapper';

export class CursorManager {
    cursors: Map<string, { element: HTMLDivElement; perfectCursor: PerfectCursor }> = new Map();

    hasCursor(nodeId: string): boolean {
        return this.cursors.has(nodeId);
    }

    createCursor(userId: string) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor';

        // Create and add the GIF image
        const cursorImg = document.createElement('img');
        cursorImg.src = getEmojiForNodeId(userId);
        cursorImg.style.width = '32px';
        cursorImg.style.height = '32px';
        cursorImg.style.position = 'absolute';
        cursorImg.style.transform = 'translate(-50%, -50%)';
        cursorImg.style.pointerEvents = 'none';
        cursorImg.style.borderRadius = '50%';
        cursor.appendChild(cursorImg);

        // Add user ID label
        const label = document.createElement('span');
        label.textContent = userId.slice(-4);
        label.style.position = 'absolute';
        label.style.top = '100%';
        label.style.transform = 'translateX(-50%) translateY(100%)';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        label.style.color = 'white';
        label.style.padding = '2px 4px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        cursor.appendChild(label);

        document.body.prepend(cursor);

        const perfectCursor = new PerfectCursor((point) => {
            cursor.style.transform = `translate(${point[0]}px, ${point[1]}px)`;
        });

        this.cursors.set(userId, { element: cursor, perfectCursor });
    }

    updateCursor(nodeId: string, point: [number, number]) {
        const cursor = this.cursors.get(nodeId);
        if (cursor) {
            cursor.perfectCursor.addPoint(point);
        }
    }

    removeCursor(nodeId: string) {
        const cursor = this.cursors.get(nodeId);
        if (cursor) {
            cursor.perfectCursor.dispose();
            cursor.element.remove();
            this.cursors.delete(nodeId);
        }
    }

    dispose() {
        for (const [_, cursor] of this.cursors) {
            cursor.perfectCursor.dispose();
            cursor.element.remove();
        }
        this.cursors.clear();
    }
}
