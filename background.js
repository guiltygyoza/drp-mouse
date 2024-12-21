import { DRPNode } from '@ts-drp/node';
import { CursorDRP } from './src/drp/cursorDRP';

let nodes = new Map();
let tabActiveNodes = new Map();

async function createNode() {
    const node = new DRPNode();
    await node.start();
    const nodeId = node.networkNode.peerId;
    console.log('createNode', nodeId);

    // Add subscription for peer changes
    node.addCustomGroupMessageHandler("", () => {
        broadcastStateUpdate();
    });

    nodes.set(nodeId, {
        node,
        drpObjects: new Map()
    });
    return nodeId;
}

function getNodeState(tabId) {
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

function broadcastStateUpdate(tabId) {
    const state = getNodeState(tabId);
    if (!state) return;
    chrome.runtime.sendMessage({
        type: 'STATE_UPDATE',
        state,
        tabId
    });
}

async function createDRPObject(nodeId, drpId, tabId) {
    const nodeData = nodes.get(nodeId);
    if (!nodeData) throw new Error('Node not found');

    const drpObject = await nodeData.node.createObject(new CursorDRP(), drpId);
    nodeData.drpObjects.set(tabId, drpObject);
    broadcastStateUpdate();

    // Set up cursor position subscription
    nodeData.node.objectStore.subscribe(drpObject.id, (_, obj) => {
        const cursorDRP = obj.drp;
        const users = cursorDRP.getUsers();
        users.forEach(userId => {
            if (userId !== nodeData.node.networkNode.peerId) {
                const position = cursorDRP.getCursorPosition(userId);
                if (position) {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'CURSOR_UPDATE',
                        userId,
                        currentPeerId: nodeData.node.networkNode.peerId,
                        position
                    });
                }
            }
        });
    });

    return drpObject;
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'CREATE_NODE':
            try {
                createNode().then(nodeId => {
                    if (sender.tab) {
                        tabActiveNodes.set(sender.tab.id, nodeId);
                    }
                    sendResponse({ nodeId });
                }).catch(error => {
                    sendResponse({ error: error.message });
                });
            } catch (error) {
                sendResponse({ error: error.message });
            }
            return true;

        case 'GET_NODES':
            const currentTabId = message.tabId || (sender.tab && sender.tab.id);
            sendResponse({
                nodes: Array.from(nodes.keys()),
                activeNodeId: currentTabId ? tabActiveNodes.get(currentTabId) : null
            });
            break;

        case 'SELECT_NODE':
            tabActiveNodes.set(message.tabId, message.nodeId);
            broadcastStateUpdate(message.tabId);
            sendResponse({ success: true });
            break;

        case 'GET_NODE_STATE':
            if (!sender.tab && !message.tabId) {
                // For popup requests without a tab, get the current tab first
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (tabs[0]) {
                        const state = getNodeState(tabs[0].id);
                        sendResponse(state || {
                            peerId: null,
                            peers: [],
                            discoveryPeers: [],
                            drpId: null
                        });
                    }
                });
                return true;  // Indicate we will send response asynchronously
            }
            const tabId = message.tabId || sender.tab.id;
            sendResponse(getNodeState(tabId));
            break;

        case 'CREATE_DRP_OBJECT':
            const activeNodeId = tabActiveNodes.get(sender.tab.id);
            if (!activeNodeId) {
                sendResponse({ error: 'No active node' });
                return;
            }
            createDRPObject(activeNodeId, message.drpId, sender.tab.id)
                .then(obj => {
                    broadcastStateUpdate(sender.tab.id);
                    sendResponse(obj);
                })
                .catch(err => sendResponse({ error: err.message }));
            return true;

        case 'LEAVE_DRP_OBJECT':
            if (!tabActiveNodes.has(sender.tab.id)) {
                sendResponse({ error: 'No active node' });
                return;
            }
            const nodeData = nodes.get(tabActiveNodes.get(sender.tab.id));
            const drpObject = nodeData.drpObjects.get(sender.tab.id);
            if (drpObject) {
                nodeData.node.objectStore.unsubscribe(drpObject.id);
                nodeData.drpObjects.delete(sender.tab.id);
                broadcastStateUpdate();
            }
            sendResponse({ success: true });
            break;

        case 'UPDATE_CURSOR_POSITION':
            if (!tabActiveNodes.has(sender.tab.id)) return;
            const currentNodeData = nodes.get(tabActiveNodes.get(sender.tab.id));
            const currentDrpObject = currentNodeData.drpObjects.get(sender.tab.id);
            if (currentDrpObject) {
                const cursorDRP = currentDrpObject.drp;
                cursorDRP.updateCursor(currentNodeData.node.networkNode.peerId, message.position);
            }
            break;
    }
});

// Handle tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tabActiveNodes.has(tabId)) {
        const nodeData = nodes.get(tabActiveNodes.get(tabId));
        chrome.tabs.sendMessage(tabId, {
            type: 'URL_CHANGED',
            url: changeInfo.url,
            autoJoin: nodeData.drpObjects.has(tabId)
        });
    }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabActiveNodes.has(tabId)) {
        const nodeData = nodes.get(tabActiveNodes.get(tabId));
        const drpObject = nodeData.drpObjects.get(tabId);
        if (drpObject) {
            nodeData.node.objectStore.unsubscribe(drpObject.id);
            nodeData.drpObjects.delete(tabId);
        }
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('DRP Mouse extension installed');
});
