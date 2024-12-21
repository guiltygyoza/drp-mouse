const EMOJI_URLS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=1',
    'https://api.dicebear.com/7.x/bottts/svg?seed=2',
    // ... we can generate more URLs dynamically
];

export function getEmojiForNodeId(nodeId: string): string {
    const hash = nodeId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${hash}`;
}
