// Get the total number of available GIFs
const TOTAL_GIFS = 500;

export function getEmojiForNodeId(nodeId: string): string {
    const hash = nodeId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);

    // Map the hash to a number between 1 and 500
    const gifNumber = (hash % TOTAL_GIFS) + 1;

    // Return the path to the local GIF
    return chrome.runtime.getURL(`images/${gifNumber}.gif`);
}
