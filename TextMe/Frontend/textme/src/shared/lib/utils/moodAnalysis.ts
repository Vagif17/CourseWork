export function calculateMood(messages: { text?: string | null }[]): number {
    if (!messages || messages.length === 0) return 0;

    // Analyze up to 15 most recent messages
    const recent = messages.slice(-15);
    let score = 0;

    const positiveRegex = /смех|радость|праздник|поздравляю|супер|отлично|круто|ура|счастье|хаха|ахах|класс|good|great|awesome|happy|congrat|love|haha|lmao|lol|amazing|wonderful|perfect|😂|🤣|🥳|🎉|❤️|🤩|✨|🔥|👍|😁|🥰|😍/gi;
    const negativeRegex = /грусть|печаль|плохо|ужас|отвратительно|ошибка|проблем|боль|злит|бесит|ненавижу|bad|sad|awful|terrible|hate|angry|error|problem|pain|worst|fail|😡|😢|💔|😭|😞|😠|👎|🤬|👿/gi;

    recent.forEach(msg => {
        if (!msg.text) return;
        const pMatches = msg.text.match(positiveRegex);
        const nMatches = msg.text.match(negativeRegex);

        const pCount = pMatches ? pMatches.length : 0;
        const nCount = nMatches ? nMatches.length : 0;

        // Each keyword/emoji swings the mood by 20%
        score += (pCount - nCount) * 0.20;
    });

    // Clamp score between -1.0 (very negative) and 1.0 (very positive)
    return Math.max(-1.0, Math.min(1.0, score));
}
