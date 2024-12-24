import { CursorManager } from "./drp/cursorManager";
import { DRPNode } from '@ts-drp/node';
import { CursorDRP } from './drp/cursorDRP';

const listenerByTabId = new Map();
const cursorManager = new CursorManager();
const nodes = new Map();
const tabActiveNodes = new Map();
let isLive = false;

async function createNode(tabId: number) {
    const node = new DRPNode();
    await node.start();
    const nodeId = node.networkNode.peerId;
    console.log('createNode', nodeId);

    // Add subscription for peer changes
    node.addCustomGroupMessageHandler("", () => {
        broadcastStateUpdate(tabId);
    });

    nodes.set(nodeId, {
        node,
        drpObjects: new Map()
    });
    return nodeId;
}

function getNodeState(tabId: number) {
    const activeNodeId = tabActiveNodes.get(tabId);
    if (!activeNodeId) return null;
    const nodeData = nodes.get(activeNodeId);
    if (!nodeData) return null;

    const drpObject = nodeData.drpObjects.get(tabId);
    return {
        peerId: nodeData.node.networkNode.peerId,
        peers: nodeData.node.networkNode.getAllPeers(),
        discoveryPeers: nodeData.node.networkNode.getGroupPeers("drp::discovery"),
        drpId: drpObject ? drpObject.id : null
    };
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function broadcast(message: any, tabId: number) {
    chrome.runtime.sendMessage({
        type: 'BROADCAST',
        message,
        tabId
    });
}

function broadcastStateUpdate(tabId: number) {
    const state = getNodeState(tabId);
    if (!state) return;
    broadcast({
        type: 'STATE_UPDATE',
        state,
    }, tabId);
}

async function createDRPObject(nodeId: string, drpId: string, tabId: number) {
    const nodeData = nodes.get(nodeId);
    if (!nodeData) throw new Error('Node not found');

    const drpObject = await nodeData.node.createObject(new CursorDRP(), drpId);
    nodeData.drpObjects.set(tabId, drpObject);

    // Set up cursor position subscription
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    nodeData.node.objectStore.subscribe(drpObject.id, (_: any, obj: { drp: any; }) => {
        const cursorDRP = obj.drp;
        const users = cursorDRP.getUsers();
        for (const userId of users) {
            if (userId !== nodeData.node.networkNode.peerId) {
                const position = cursorDRP.getCursorPosition(userId);
                if (position) {
                    if (isLive && userId !== nodeData.node.networkNode.peerId) {
                        if (!cursorManager.hasCursor(userId)) {
                            cursorManager.createCursor(userId);
                        }
                        cursorManager.updateCursor(userId, [position.x, position.y]);
                    }
                }
            }
        }
    });

    await broadcastStateUpdate(tabId);

    return drpObject;
}


// Handle messages from popup and background
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const { type, tabId } = message;
    if (!tabId) {
        console.error("No tabId", message);
        sendResponse({ error: true, message: "No tabId" });
        return;
    }
    switch (type) {
        case 'GET_STATE':
            // Forward state request to background script
            chrome.runtime.sendMessage({ type: 'GET_NODE_STATE' }, sendResponse);
            return true;

        case 'GO_LIVE': {
            isLive = true;
            const currentHost = window.location.host;
            const drpId = `cursor-presence-${currentHost}`;
            const activeNodeId = tabActiveNodes.get(tabId);
            try {
                const obj = await createDRPObject(activeNodeId, drpId, tabId);
                sendResponse(obj);
            } catch (err) {
                sendResponse({ error: (err as Error).message });
            }
            setupMouseTracking(tabId);
            sendResponse({ isLive: true });
            break;
        }

        case 'LEAVE_ROOM': {
            isLive = false;
            chrome.runtime.sendMessage({ type: 'LEAVE_DRP_OBJECT' });
            removeCursors();
            const listener = listenerByTabId.get(tabId);
            if (listener) {
                document.removeEventListener("mousemove", listener);
                listenerByTabId.delete(tabId);
            }
            break;
        }

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

        case 'SELECT_NODE':
            tabActiveNodes.set(tabId, message.nodeId);
            broadcastStateUpdate(tabId);
            sendResponse({ success: true });
            break;

        case 'GET_NODES':
            sendResponse({
                nodes: Array.from(nodes.keys()),
                activeNodeId: tabActiveNodes.get(tabId)
            });
            break;


        case 'GET_NODE_STATE':
            sendResponse(getNodeState(tabId));
            break;

        case 'CREATE_DRP_OBJECT': {
            const activeNodeId = tabActiveNodes.get(tabId);
            if (!activeNodeId) {
                sendResponse({ error: 'No active node' });
                return;
            }
            try {
                const obj = await createDRPObject(activeNodeId, message.drpId, tabId);
                sendResponse(obj);
            } catch (err) {
                sendResponse({ error: (err as Error).message });
            }
            break;
        }

        case 'URL_CHANGED':
            if (isLive) {
                removeCursors();
                if (message.autoJoin) {
                    const newDrpId = `cursor-presence-${new URL(message.url).host}`;
                    try {
                        const activeNodeId = tabActiveNodes.get(tabId);
                        const obj = await createDRPObject(activeNodeId, newDrpId, tabId);
                        sendResponse(obj);
                    } catch (err) {
                        sendResponse({ error: (err as Error).message });
                    }
                }
            }
            break;

        case 'LEAVE_DRP_OBJECT': {
            if (!tabActiveNodes.has(tabId)) {
                sendResponse({ error: 'No active node' });
                return;
            }
            const nodeData = nodes.get(tabActiveNodes.get(tabId));
            const drpObject = nodeData.drpObjects.get(tabId);
            if (drpObject) {
                nodeData.node.objectStore.unsubscribe(drpObject.id);
                nodeData.drpObjects.delete(tabId);
                broadcastStateUpdate(tabId);
            }
            sendResponse({ success: true });
            break;
        }

        case 'CREATE_NODE':
            try {
                const nodeId = await createNode(tabId);
                tabActiveNodes.set(tabId, nodeId);
                sendResponse({ nodeId });
            } catch (error) {
                sendResponse({ error: (error as Error).message });
            }
            return true;
    }
});

function handleMouseMove(tabId: number) {
    let lastInvote = 0;
    return (event: MouseEvent) => {
        if (!isLive) return;
        if (!tabActiveNodes.has(tabId)) return;

        const currentNodeData = nodes.get(tabActiveNodes.get(tabId));
        const currentDrpObject = currentNodeData.drpObjects.get(tabId);
        if (!currentDrpObject) return;

        const now = Date.now()
        const isMoreThan50ms = now - lastInvote > 50;
        if (!isMoreThan50ms) return;

        lastInvote = now;
        const cursorDRP = currentDrpObject.drp;
        cursorDRP.updateCursor(currentNodeData.node.networkNode.peerId, { x: event.clientX, y: event.clientY });
    }
}

function setupMouseTracking(tabId: number) {
    const listener = handleMouseMove(tabId);
    document.addEventListener("mousemove", listener);
    listenerByTabId.set(tabId, listener);
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

// TODO: Fix this right now we kinda don't care as when you change page it will be removed
// Cleanup on page unload
//window.addEventListener("beforeunload", () => {
//    if (isLive) {
//        chrome.runtime.sendMessage({ type: 'LEAVE_DRP_OBJECT' });
//    }
//    removeCursors();
//});
