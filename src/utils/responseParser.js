/**
 * Parses Azure AI response and extracts sources from citations
 * @param {string} response - The raw response from Azure AI
 * @returns {object} - Object containing cleaned text and sources
 */
export const parseResponseWithSources = (response) => {
    if (!response || typeof response !== 'string') {
        return {
            text: response || '',
            sources: []
        };
    }

    // Regular expression to match citations like 【4:1†source】, 【4:0†source】, etc.
    const citationRegex = /【(\d+):(\d+)†source】/g;
    const sources = [];
    let match;
    
    // Extract all citations and their positions
    const citations = [];
    while ((match = citationRegex.exec(response)) !== null) {
        citations.push({
            fullMatch: match[0],
            documentIndex: parseInt(match[1]),
            chunkIndex: parseInt(match[2]),
            position: match.index
        });
    }

    // Remove citations from the text
    let cleanedText = response.replace(citationRegex, '');
    
    // Create source references
    const uniqueSources = new Map();
    citations.forEach(citation => {
        const key = `${citation.documentIndex}:${citation.chunkIndex}`;
        if (!uniqueSources.has(key)) {
            uniqueSources.set(key, {
                id: uniqueSources.size + 1,
                documentIndex: citation.documentIndex,
                chunkIndex: citation.chunkIndex,
                label: `[${uniqueSources.size + 1}]`
            });
        }
    });

    // Replace citations with numbered references
    let formattedText = response;
    uniqueSources.forEach((source, key) => {
        const citationPattern = new RegExp(`【${source.documentIndex}:${source.chunkIndex}†source】`, 'g');
        formattedText = formattedText.replace(citationPattern, source.label);
    });

    return {
        text: formattedText,
        sources: Array.from(uniqueSources.values()),
        rawText: cleanedText
    };
};

/**
 * Formats sources for display
 * @param {Array} sources - Array of source objects
 * @returns {string} - Formatted sources text
 */
export const formatSources = (sources) => {
    if (!sources || sources.length === 0) {
        return '';
    }

    const sourceLabels = sources.map(source => 
        `${source.label} Document ${source.documentIndex}, Chunk ${source.chunkIndex}`
    );

    return `Sources: ${sourceLabels.join(', ')}`;
}; 