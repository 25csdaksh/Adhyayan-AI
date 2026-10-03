/**
 * Timeline Extraction Service
 *
 * Extracts dated milestones, version events, and chronological developments from evidence.
 * Flags uncertain dates explicitly without fabricating timeline points.
 */

const DATE_REGEX = /\b((?:19|20)\d{2}(?:[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01]))?|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},?\s+)?(?:19|20)\d{2}|Q[1-4]\s+(?:19|20)\d{2}|(?:19|20)\d{2})\b/gi;

/**
 * Extract chronological events from evidence excerpts
 *
 * @param {Array<Object>} evidenceList
 * @returns {Array<{ date: string, event: string, sourceTitle: string, citation: string, isUncertain: boolean }>}
 */
function extractTimelineEvents(evidenceList = []) {
  if (!evidenceList || evidenceList.length === 0) return [];

  const events = [];
  const seenEvents = new Set();

  for (const ev of evidenceList) {
    const text = ev.text || '';
    const sentences = text.split(/(?<=[.?!])\s+/);

    for (const sentence of sentences) {
      const matches = sentence.match(DATE_REGEX);
      if (matches && matches.length > 0) {
        const rawDate = matches[0];
        const eventText = sentence.trim();

        if (eventText.length > 20 && !seenEvents.has(eventText)) {
          seenEvents.add(eventText);

          // Check if date is approximate or relative
          const isApprox = /\b(around|approximately|circa|estimated|late|early|mid)\b/i.test(sentence);

          events.push({
            date: rawDate,
            event: eventText,
            sourceTitle: ev.sourceTitle,
            citation: ev.chunkId || ev.id,
            isUncertain: isApprox,
          });
        }
      }
    }
  }

  // Sort events chronologically where possible
  events.sort((a, b) => {
    const yearA = parseInt((a.date.match(/\b(19|20)\d{2}\b/) || [0])[0], 10);
    const yearB = parseInt((b.date.match(/\b(19|20)\d{2}\b/) || [0])[0], 10);
    return yearA - yearB;
  });

  return events.slice(0, 10);
}

module.exports = {
  extractTimelineEvents,
};
