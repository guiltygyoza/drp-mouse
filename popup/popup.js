import { getEmojiForNodeId } from '../src/utils/emojiMapper';

console.log("Popup script attempting to load");
try {
    console.log("Window object:", window);
    console.log("Document object:", document);
} catch (e) {
    console.error("Error during initial load:", e);
}

// Top of file
console.log("Popup script loading");

window.addEventListener('error', (event) => {
    console.error('Script error:', {
        message: event.error?.message,
        stack: event.error?.stack,
        source: event.filename,
        line: event.lineno,
        column: event.colno
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded");
    const createNodeButton = document.getElementById('createNode');
    const goLiveButton = document.getElementById('goLive');
    const nodeList = document.getElementById('nodeList');

    console.log("Elements found:", {
        createNodeButton,
        goLiveButton,
        nodeList
    });

    function formatPeerId(peerId) {
        if (!peerId) return 'Not connected';
        return `${peerId.slice(0, 4)}...${peerId.slice(-4)}`;
    }

    function getNodeEmoji(nodeId) {
        if (!nodeId) return '👻';
        // Use the existing emoji mapper utility
        const emojiUrl = getEmojiForNodeId(nodeId);
        const img = document.createElement('img');
        img.src = emojiUrl;
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '7px';
        return img;
    }

    async function updateUI(state) {
        // Get and display tab ID first, independent of state
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        document.getElementById('tabId').innerText = tab ? tab.id : 'No tab';

        // Update current peer ID with emoji
        const peerIdElement = document.getElementById('peerId');
        peerIdElement.innerHTML = '';
        if (state?.peerId) {
            peerIdElement.appendChild(getNodeEmoji(state.peerId));
            const peerIdText = document.createElement('span');
            peerIdText.style.textDecoration = 'underline';
            peerIdText.textContent = formatPeerId(state.peerId);
            peerIdElement.appendChild(peerIdText);
        } else {
            peerIdElement.innerText = 'Not connected';
        }

        // Rest of the updates
        document.getElementById('peers').innerText = state?.peers?.map(formatPeerId).join(', ') || 'None';
        document.getElementById('discoveryPeers').innerText = state?.discoveryPeers?.map(formatPeerId).join(', ') || 'None';
        document.getElementById('drpId').innerText = state?.drpId || 'no live drp';

        if (state?.drpId) {
            goLiveButton.classList.add('active');
            goLiveButton.innerText = 'LIVE';
        } else {
            goLiveButton.classList.remove('active');
            goLiveButton.innerText = 'GO LIVE';
        }
    }

    async function updateNodeList() {
        console.log("Updating node list");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.runtime.sendMessage({
            type: 'GET_NODES',
            tabId: tab.id
        });
        console.log("Got nodes response:", response);

        nodeList.innerHTML = '';

        response.nodes.forEach(nodeId => {
            const nodeItem = document.createElement('div');
            nodeItem.className = 'node-item';
            if (nodeId === response.activeNodeId) {
                nodeItem.classList.add('selected');
            }
            nodeItem.innerHTML = '';
            nodeItem.appendChild(getNodeEmoji(nodeId));
            nodeItem.appendChild(document.createTextNode(formatPeerId(nodeId)));
            nodeItem.addEventListener('click', async () => {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                // alert(`tabId ${tab.id} selects node ${nodeId}`);
				await chrome.runtime.sendMessage({
                    type: 'SELECT_NODE',
                    nodeId,
                    tabId: tab.id
                });
                updateNodeList();
                const state = await chrome.runtime.sendMessage({
                    type: 'GET_NODE_STATE',
                    tabId: tab.id
                });
                if (state && !state.error) {
                    updateUI(state);
                }
            });
            nodeList.appendChild(nodeItem);
        });
    }

    // Create Node button handler
    createNodeButton.addEventListener('click', async () => {
        console.log("Create node clicked");
        const response = await chrome.runtime.sendMessage({ type: 'CREATE_NODE' });
        console.log("Create node response:", response);
        if (!response) {
            console.error("No response received from background script");
            return;
        }
        if (response.error) {
            console.error("Error creating node:", response.error);
            return;
        }

        if (response.nodeId) {
            await updateNodeList();
            const state = await chrome.runtime.sendMessage({ type: 'GET_NODE_STATE' });
            if (state && !state.error) {
                updateUI(state);
            }
        }
    });

    // GO LIVE button handler
    goLiveButton.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (goLiveButton.classList.contains('active')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'LEAVE_ROOM'
                });
                goLiveButton.classList.remove('active');
                goLiveButton.innerText = 'GO LIVE';
            } else {
                console.log('popup: attempt to go live');
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'GO_LIVE'
                });
                setTimeout(async () => {
                    const state = await chrome.runtime.sendMessage({
                        type: 'GET_NODE_STATE',
                        tabId: tabs[0].id
                    });
                    if (state) {
                        updateUI(state);
                    }
                }, 500);
            }
        });
    });

    // Initial setup
    try {
		await updateNodeList();
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const state = await chrome.runtime.sendMessage({
			type: 'GET_NODE_STATE',
			tabId: tab.id  // Always pass the current tab ID
		});
		await updateUI(state || {});
	} catch (error) {
		console.error("Error during initial setup:", error);
	}

    // Listen for state updates
    chrome.runtime.onMessage.addListener(async (message) => {
        if (message.type === 'STATE_UPDATE') {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id === message.tabId) {  // Only update if it's for our tab
                updateUI(message.state);
                updateNodeList();
            }
        }
    });
});

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});
