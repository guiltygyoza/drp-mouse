import { PerfectCursor } from 'perfect-cursors';
import { getEmojiForNodeId } from '../utils/emojiMapper';

export class CursorManager {
    cursors: Map<string, {
        element: HTMLDivElement;
        perfectCursor: PerfectCursor;
    }> = new Map();

    hasCursor(nodeId: string): boolean {
        return this.cursors.has(nodeId);
    }

    createCursor(nodeId: string) {
        const cursorElement = document.createElement('div');
        cursorElement.className = 'remote-cursor';
        cursorElement.style.position = 'fixed';
        cursorElement.style.pointerEvents = 'none';
        cursorElement.style.width = '24px';
        cursorElement.style.height = '24px';
        cursorElement.style.backgroundImage = `url(${getEmojiForNodeId(nodeId)})`;
        cursorElement.style.backgroundSize = 'contain';
        document.body.appendChild(cursorElement);

        const perfectCursor = new PerfectCursor((point: number[]) => {
            cursorElement.style.transform = `translate(${point[0]}px, ${point[1]}px)`;
        });

        this.cursors.set(nodeId, { element: cursorElement, perfectCursor });
    }

    updateCursor(nodeId: string, point: [number, number]) {
		console.log('updateCursor', nodeId, point);
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
        this.cursors.forEach((cursor) => {
            cursor.perfectCursor.dispose();
            cursor.element.remove();
        });
        this.cursors.clear();
    }
}
