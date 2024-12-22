import { CursorManager } from "./drp/cursorManager";
import { DRPNode } from '@ts-drp/node';
import type { DRPObject } from "@ts-drp/object";
import { CursorDRP } from './drp/cursorDRP';

const cursorManager = new CursorManager();
let isLive = false;

// Node management
let nodes = new Map(); // map nodeId -> node
let activeNodeId = "";
let mapNodeIdToDrpIds = new Map();

console.log("== CONTENT.TS IS LOADED ==");

async function createNode() {
    const node = new DRPNode();
    await node.start();
    const nodeId = node.networkNode.peerId;

    // Add subscription for peer changes
    node.addCustomGroupMessageHandler("", () => {
        console.log("Peer change detected, broadcasting state update");
        broadcastStateUpdate();
    });

    nodes.set(nodeId, node);
	mapNodeIdToDrpIds.set(nodeId, []);

    return nodeId;
}

function getNodeState() {
    if (!activeNodeId) return null;
    const node: DRPNode = nodes.get(activeNodeId);
    if (!node) return null;

	const drpId = mapNodeIdToDrpIds.get(node.networkNode.peerId);
    const drpObject = node.objectStore.get(drpId);

    return {
        peerId: node.networkNode.peerId,
        peers: node.networkNode.getAllPeers(),
        discoveryPeers: node.networkNode.getGroupPeers("drp::discovery"),
        drpId: drpObject ? drpObject.id : null
    };
}

function broadcastStateUpdate() {
    const state = getNodeState();
    if (!state) return;
    chrome.runtime.sendMessage({
        type: 'STATE_UPDATE',
        state,
        tabId: state.peerId
    });
}

// Handle messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'CREATE_NODE':
            createNode().then(nodeId => {
                activeNodeId = nodeId;
                sendResponse({ nodeId });
                broadcastStateUpdate();
            });
            return true;

        case 'GET_NODES':
            sendResponse({
                nodes: Array.from(nodes.keys()),
                activeNodeId
            });
            break;

        case 'SELECT_NODE':
            activeNodeId = message.nodeId;
            broadcastStateUpdate();
            sendResponse({ success: true });
            break;

        case 'GET_NODE_STATE':
            sendResponse(getNodeState());
            break;

        case 'GO_LIVE':
            (async () => {
                isLive = true;
                const currentHost = window.location.host;
                const drpId = `cursor-presence-${currentHost}`;
                const node = nodes.get(activeNodeId);
                if (node) {
                    const drpObject = await node.createObject(new CursorDRP(), drpId);
                    // Add subscription for cursor updates
                    node.objectStore.subscribe(drpObject.id, (_: unknown, obj: DRPObject) => {
                        const cursorDRP = obj.drp as CursorDRP;
                        const users = cursorDRP.getUsers();
                        users.forEach(userId => {
                            if (userId !== node.networkNode.peerId) {
                                const position = cursorDRP.getCursorPosition(userId);
                                if (position) {
                                    if (!cursorManager.hasCursor(userId)) {
                                        cursorManager.createCursor(userId);
                                    }
                                    cursorManager.updateCursor(userId, [position.x, position.y]);
                                }
                            }
                        });
                    });
                    setupMouseTracking();
                    broadcastStateUpdate();
                }
                sendResponse({ success: true });
            })();
            return true;

        // case 'LEAVE_ROOM':
        //     isLive = false;
        //     node = nodes.get(activeNodeId);
        //     if (node) {
        //         const drpObject = node.drpObjects.get('cursor');
        //         if (drpObject) {
        //             leaveNodeData.drpObjects.delete('cursor');
        //         }
        //     }
        //     removeCursors();
        //     document.removeEventListener("mousemove", handleMouseMove);
        //     break;

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
            (async () => {
                if (isLive) {
                    removeCursors();
                    if (message.autoJoin) {
                        const node: DRPNode = nodes.get(activeNodeId);
                        if (node) {
                            const newDrpId = `cursor-presence-${new URL(message.url).host}`;
                            const drpObject = await node.createObject(new CursorDRP(), newDrpId);
                            setupMouseTracking();
                            broadcastStateUpdate();
                        }
                    }
                    sendResponse({ success: true });
                }
            })();
            return true;
    }
});

function handleMouseMove(event: MouseEvent) {
    if (!isLive) return;

    const position = { x: event.clientX, y: event.clientY };
    const node: DRPNode = nodes.get(activeNodeId);
    if (node) {
        const drpObject = node.objectStore.get('cursor');
        if (drpObject) {
            const cursorDRP = drpObject.drp as CursorDRP;
            cursorDRP.updateCursor(node.networkNode.peerId, position);
        }
    }
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
        const node: DRPNode = nodes.get(activeNodeId);
        if (node) {
            const drpObject = node.objectStore.get('cursor');
            if (drpObject) {
                node.objectStore.remove('cursor');
            }
        }
    }
    removeCursors();
});
