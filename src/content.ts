import { CursorManager } from "./drp/cursorManager";

const cursorManager = new CursorManager();
let isLive = false;

// Handle messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_STATE':
            // Forward state request to background script
            chrome.runtime.sendMessage({ type: 'GET_NODE_STATE' }, sendResponse);
            return true;

        case 'GO_LIVE':
            isLive = true;
            const currentHost = window.location.host;
            const drpId = `cursor-presence-${currentHost}`;
            chrome.runtime.sendMessage({
                type: 'CREATE_DRP_OBJECT',
                drpId
            });
            setupMouseTracking();
            break;

        case 'LEAVE_ROOM':
            isLive = false;
            chrome.runtime.sendMessage({ type: 'LEAVE_DRP_OBJECT' });
            removeCursors();
            document.removeEventListener("mousemove", handleMouseMove);
            break;

        case 'CURSOR_UPDATE':
            if (isLive && message.userId !== message.currentPeerId) {
                if (!cursorManager.hasCursor(message.userId)) {
                    cursorManager.createCursor(message.userId);
                }
                cursorManager.updateCursor(message.userId, [message.position.x, message.position.y]);
            }
            break;

        case 'PEER_LEFT':
            if (cursorManager.hasCursor(message.peerId)) {
                removePeerCursor(message.peerId);
            }
            break;

        case 'URL_CHANGED':
            if (isLive) {
                removeCursors();
                if (message.autoJoin) {
                    const newDrpId = `cursor-presence-${new URL(message.url).host}`;
                    chrome.runtime.sendMessage({
                        type: 'CREATE_DRP_OBJECT',
                        drpId: newDrpId
                    });
                }
            }
            break;
    }
});

function handleMouseMove(event: MouseEvent) {
    if (!isLive) return;

    const position = { x: event.clientX, y: event.clientY };
    chrome.runtime.sendMessage({
        type: 'UPDATE_CURSOR_POSITION',
        position
    });
}

function setupMouseTracking() {
    document.addEventListener("mousemove", handleMouseMove);
}

function removePeerCursor(peerId: string) {
    if (cursorManager.hasCursor(peerId)) {
        const cursor = cursorManager.cursors.get(peerId);
        if (cursor) {
            cursor.element.remove();
            cursor.perfectCursor.dispose();
            cursorManager.cursors.delete(peerId);
        }
    }
}

function removeCursors() {
    for (const [peerId, cursor] of cursorManager.cursors) {
        cursor.element.remove();
        cursor.perfectCursor.dispose();
    }
    cursorManager.cursors.clear();
}

// Cleanup on page unload
window.addEventListener("unload", () => {
    if (isLive) {
        chrome.runtime.sendMessage({ type: 'LEAVE_DRP_OBJECT' });
    }
    removeCursors();
});
