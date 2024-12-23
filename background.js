const nodes = new Map();
const tabActiveNodes = new Map();

// Message handler
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.type) {
        case 'BROADCAST': {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            for (const tab of tabs) {
                if (!tab.id) continue;
                if (message.tabId === tab.id) continue;

                chrome.tabs.sendMessage(tab.id, {
                    ...message.message,
                    tabId: tab.id
                });
            }

            break;
        }
        case 'UPDATE_CURSOR_POSITION': {
            if (!tabActiveNodes.has(sender.tab.id)) return;
            const currentNodeData = nodes.get(tabActiveNodes.get(sender.tab.id));
            const currentDrpObject = currentNodeData.drpObjects.get(sender.tab.id);
            if (currentDrpObject) {
                const cursorDRP = currentDrpObject.drp;
                cursorDRP.updateCursor(currentNodeData.node.networkNode.peerId, message.position);
            }
            break;
        }
    }
    sendResponse({ success: true });
    return true;
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
    console.log('DRP Mouse extension installed background');
});
