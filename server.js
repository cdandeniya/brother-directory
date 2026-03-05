const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.static(__dirname));
app.use(express.json());

// --- Load brothers data ---
function loadBrothersData() {
    const raw = fs.readFileSync(path.join(__dirname, 'brothers-data.js'), 'utf-8');
    const fn = new Function(raw + '\nreturn brothersData;');
    return fn();
}

// =============================================
// INTENT DETECTION — understand what the user is really asking
// =============================================
const INTENT_PATTERNS = {
    // Class year / seniority
    classYear: {
        patterns: [
            /\b(senior|seniors|graduating)\b/i,
            /\b(junior|juniors)\b/i,
            /\b(sophomore|sophomores)\b/i,
            /\b(freshman|freshmen|freshm[ae]n)\b/i,
            /\bgrad(?:uating)?\s*(?:in\s*)?(20\d{2}|this year|next year|soon)\b/i,
            /\b(class of|co)\s*(20\d{2})\b/i,
            /\b(upperclass(?:m[ae]n)?|older)\b/i,
            /\b(underclass(?:m[ae]n)?|younger|newer)\b/i,
        ],
        extract(query) {
            const lower = query.toLowerCase();
            const currentYear = new Date().getFullYear();

            if (/\bsenior|graduating\s*soon|upperclass/i.test(lower)) return { type: 'gradYear', years: [currentYear, currentYear + 1], label: 'Senior' };
            if (/\bjunior/i.test(lower)) return { type: 'gradYear', years: [currentYear + 1, currentYear + 2], label: 'Junior' };
            if (/\bsophomore/i.test(lower)) return { type: 'gradYear', years: [currentYear + 2, currentYear + 3], label: 'Sophomore' };
            if (/\bfresh/i.test(lower)) return { type: 'gradYear', years: [currentYear + 3, currentYear + 4], label: 'Freshman' };
            if (/\bunderclass|younger|newer/i.test(lower)) return { type: 'gradYear', years: [currentYear + 2, currentYear + 3, currentYear + 4], label: 'Underclassman' };

            const yearMatch = lower.match(/(?:grad(?:uating)?(?:\s*in)?|class\s*of)\s*(20\d{2})/i);
            if (yearMatch) return { type: 'gradYear', years: [parseInt(yearMatch[1])], label: `Class of ${yearMatch[1]}` };

            return null;
        }
    },

    // Pledge class
    pledgeClass: {
        patterns: [/\b(nu|xi|omicron|pi|rho|sigma|tau)\s*(?:class|pledge)?\b/i, /\bpledge\s*class\s*(nu|xi|omicron|pi|rho|sigma|tau)\b/i],
        extract(query) {
            const match = query.match(/\b(nu|xi|omicron|pi|rho|sigma|tau)\b/i);
            if (match) {
                const pc = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
                // Fix casing for Omicron
                const normalized = pc === 'Omicron' ? 'Omicron' : pc;
                return { type: 'pledgeClass', value: normalized, label: `${normalized} Class` };
            }
            return null;
        }
    },

    // Leadership / positions
    leadership: {
        patterns: [/\b(leader|leadership|president|vp|vice president|officer|ec|executive|chair|e-?board)\b/i],
        extract(query) {
            const lower = query.toLowerCase();
            if (/\bpresident\b/i.test(lower)) return { type: 'position', value: 'president', label: 'President' };
            if (/\b(vp|vice president)\b/i.test(lower)) return { type: 'position', value: 'vp', label: 'VP' };
            if (/\b(ec|executive|e-?board)\b/i.test(lower)) return { type: 'filter', value: 'ec', label: 'Executive Committee' };
            if (/\bchair\b/i.test(lower)) return { type: 'filter', value: 'chair', label: 'Chair' };
            if (/\b(leader|leadership)\b/i.test(lower)) return { type: 'leadership', label: 'Leadership experience' };
            return null;
        }
    },
};

// Structured field matchers — match query intent to specific profile fields
const FIELD_MATCHERS = {
    major: {
        triggers: [/\bmajor(?:ing)?\s*(?:in\s*)?/i, /\bstud(?:y|ying|ies)\s*/i, /\b(?:ams|applied math|statistics|econ|economics|business|accounting|computer science|cs|ise|tsm|info(?:rmation)?\s*sys(?:tems)?)\b/i],
        field: 'major',
        label: 'Major',
    },
    career: {
        triggers: [/\bcareer|aspir|want(?:s)?\s*to\s*(?:work|be)|interest(?:ed)?\s*in|looking\s*(?:to|for)\s*(?:work|go\s*into)|go(?:ing)?\s*into\b/i],
        field: 'careerInterests',
        label: 'Career Interest',
    },
    hobby: {
        triggers: [/\bhobb(?:y|ies)|likes?\s*to|enjoys?|for\s*fun|free\s*time|into\b/i],
        field: 'hobbies',
        label: 'Hobby',
    },
    experience: {
        triggers: [/\bintern(?:ship|ed)?|work(?:ed|ing)?\s*(?:at|for|in)|experience|job|role/i],
        field: 'pastRoles',
        label: 'Experience',
    },
};

// =============================================
// EXPANDED SYNONYMS — deeper semantic matching
// =============================================
const SYNONYMS = {
    // Sports
    'sports': ['basketball', 'soccer', 'volleyball', 'tennis', 'pickleball', 'running', 'gym', 'fitness', 'boxing', 'handball', 'athletic', 'working out', 'pilates'],
    'basketball': ['sports', 'athletic', 'bball'],
    'soccer': ['sports', 'athletic', 'football'],
    'volleyball': ['sports', 'athletic', 'vball'],
    'tennis': ['sports', 'athletic', 'pickleball'],
    'athletic': ['sports', 'gym', 'fitness', 'running'],

    // Tech
    'tech': ['technology', 'software', 'engineering', 'computer', 'developer', 'startup', 'programming', 'coding', 'it', 'computer science'],
    'technology': ['tech', 'software', 'engineering', 'computer', 'developer', 'it'],
    'software': ['tech', 'engineering', 'developer', 'programming', 'coding', 'computer science'],
    'startup': ['tech', 'entrepreneurship', 'founder', 'startups', 'product'],
    'startups': ['tech', 'entrepreneurship', 'founder', 'startup', 'product'],
    'cs': ['computer science', 'software', 'programming', 'tech'],
    'coding': ['programming', 'software', 'developer', 'computer science'],
    'ai': ['machine learning', 'data science', 'artificial intelligence'],

    // Business fields
    'marketing': ['social media', 'brand', 'advertising', 'content', 'digital marketing', 'pr', 'public relations', 'seo', 'branding'],
    'finance': ['financial', 'accounting', 'audit', 'banking', 'investment', 'wealth', 'cpa', 'actuary', 'actuarial', 'quant'],
    'accounting': ['finance', 'audit', 'cpa', 'tax', 'kpmg', 'deloitte', 'accountant'],
    'audit': ['accounting', 'deloitte', 'kpmg', 'cpa'],
    'cpa': ['accounting', 'audit', 'tax'],
    'tax': ['accounting', 'cpa', 'audit'],
    'data': ['analytics', 'data science', 'data analyst', 'quantitative', 'statistics', 'analysis'],
    'analytics': ['data', 'data science', 'analyst', 'quantitative', 'analysis'],
    'consulting': ['consultant', 'strategy', 'advisory', 'mckinsey', 'deloitte'],
    'hr': ['human resources', 'talent', 'people', 'recruiting', 'recruitment'],
    'human resources': ['hr', 'talent', 'people', 'recruiting'],
    'entrepreneurship': ['startup', 'founder', 'business owner', 'entrepreneur'],

    // Hobbies / interests
    'music': ['guitar', 'piano', 'singing', 'concerts', 'beats', 'playlists', 'violin', 'musician'],
    'art': ['creative', 'design', 'photography', 'fashion', 'graphic', 'painting', 'drawing'],
    'design': ['graphic', 'creative', 'art', 'graphic designer'],
    'fashion': ['clothing', 'shopping', 'style', 'thrifting', 'design'],
    'travel': ['traveling', 'countries', 'abroad', 'trip', 'trips'],
    'traveling': ['travel', 'countries', 'abroad', 'trip'],
    'food': ['cooking', 'baking', 'eating', 'restaurant', 'foodie', 'chef'],
    'cooking': ['food', 'baking', 'eating', 'chef', 'recipe'],
    'baking': ['cooking', 'food'],
    'gaming': ['video games', 'games', 'gamer'],
    'video games': ['gaming', 'games', 'gamer'],
    'fitness': ['gym', 'working out', 'pilates', 'strength training', 'exercise'],
    'gym': ['fitness', 'working out', 'pilates', 'strength training', 'exercise'],
    'reading': ['books', 'read', 'reader', 'literature'],
    'photography': ['photos', 'pictures', 'camera', 'art'],
    'creative': ['art', 'design', 'content', 'photography', 'writing'],

    // Personality / vibes
    'outgoing': ['social', 'extrovert', 'friendly', 'bubbly', 'energetic'],
    'chill': ['relaxed', 'easygoing', 'laid back', 'calm', 'nonchalant'],
    'ambitious': ['hardworking', 'driven', 'motivated', 'determined'],
    'funny': ['humor', 'silly', 'comedic', 'unserious'],
};

// =============================================
// SMART SEARCH ENGINE
// =============================================

// Tokenize text
function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
}

// Term frequency (normalized)
function termFrequency(tokens) {
    const tf = {};
    for (const token of tokens) tf[token] = (tf[token] || 0) + 1;
    const len = tokens.length || 1;
    for (const term in tf) tf[term] /= len;
    return tf;
}

// Pre-computed index
let profileIndex = null;

function buildIndex() {
    const brothersData = loadBrothersData();
    const names = Object.keys(brothersData);
    const tfs = [];
    const profileTexts = {};
    const docFreq = {};

    // Build per-field indexes for smarter matching
    const fieldTexts = {}; // { name: { major: "...", hobbies: "...", ... } }

    for (const name of names) {
        const data = brothersData[name];
        const text = buildProfileText(name, data);
        profileTexts[name] = text;

        // Per-field lowercased text
        fieldTexts[name] = {};
        for (const f of ['major', 'bio', 'careerInterests', 'dspPositions', 'committees', 'pastRoles', 'hobbies', 'funFact', 'personality', 'favoriteMemory', 'graduationDate', 'pledgeClass']) {
            fieldTexts[name][f] = (data[f] || '').toLowerCase();
        }

        const tokens = tokenize(text);
        tfs.push(termFrequency(tokens));

        const seenTerms = new Set(tokens);
        for (const term of seenTerms) docFreq[term] = (docFreq[term] || 0) + 1;
    }

    const idf = {};
    const N = names.length;
    for (const term in docFreq) idf[term] = Math.log(1 + N / (1 + docFreq[term]));

    profileIndex = { names, tfs, idf, profileTexts, fieldTexts, brothersData };
    console.log(`Indexed ${names.length} brother profiles (with field-level data)`);
}

function buildProfileText(name, data) {
    return [data.fullName, data.major, data.bio, data.careerInterests, data.dspPositions,
        data.committees, data.pastRoles, data.hobbies, data.funFact, data.personality,
        data.favoriteMemory, data.littleQualities].filter(Boolean).join(' ').toLowerCase();
}

// =============================================
// MAIN SEARCH — combines intent detection + TF-IDF + field boosting
// =============================================
function searchProfiles(query) {
    if (!profileIndex) buildIndex();
    const { names, tfs, idf, profileTexts, fieldTexts, brothersData } = profileIndex;

    const lowerQuery = query.toLowerCase().trim();

    // --- Step 1: Detect intents (structured filters) ---
    const intents = [];
    for (const [key, detector] of Object.entries(INTENT_PATTERNS)) {
        const hasMatch = detector.patterns.some(p => p.test(lowerQuery));
        if (hasMatch) {
            const intent = detector.extract(query);
            if (intent) intents.push(intent);
        }
    }

    // --- Step 2: Detect field focus ---
    let fieldFocus = null;
    for (const [key, matcher] of Object.entries(FIELD_MATCHERS)) {
        if (matcher.triggers.some(p => p.test(lowerQuery))) {
            fieldFocus = matcher;
            break;
        }
    }

    // --- Step 3: Strip intent/trigger words to get the "content" query ---
    let contentQuery = lowerQuery;
    // Remove common filler words
    contentQuery = contentQuery.replace(/\b(i\s+want|i'm\s+looking\s+for|looking\s+for|find\s+me|show\s+me|who|someone|a\s+brother|brother|brothers|who's|whos|that|that's|thats|interested\s+in|into|with|likes?|enjoys?|does|is|are|has|have|for\s+fun|in\s+their\s+free\s+time|majoring\s+in|studying|career\s+in|works?\s+in|hobbies?|hobby)\b/gi, ' ');
    contentQuery = contentQuery.replace(/\s+/g, ' ').trim();

    // --- Step 4: Expand query with synonyms ---
    const queryTokensRaw = tokenize(contentQuery || lowerQuery);
    const expandedTokens = new Set(queryTokensRaw);
    for (const token of queryTokensRaw) {
        if (SYNONYMS[token]) {
            for (const syn of SYNONYMS[token]) {
                for (const w of syn.split(/\s+/)) expandedTokens.add(w);
            }
        }
    }
    // Also check multi-word synonym keys
    for (const [key, syns] of Object.entries(SYNONYMS)) {
        if (key.includes(' ') && lowerQuery.includes(key)) {
            for (const syn of syns) {
                for (const w of syn.split(/\s+/)) expandedTokens.add(w);
            }
        }
    }
    const queryTokens = Array.from(expandedTokens);

    // --- Step 5: Build TF-IDF query vector ---
    const queryTF = {};
    for (const token of queryTokens) queryTF[token] = (queryTF[token] || 0) + 1;
    const qLen = queryTokens.length || 1;
    for (const term in queryTF) {
        queryTF[term] = (queryTF[term] / qLen) * (idf[term] || Math.log(1 + names.length));
    }

    // --- Step 6: Score each profile ---
    const results = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const data = brothersData[name];
        const docTF = tfs[i];
        const fields = fieldTexts[name];
        const profileText = profileTexts[name];

        let score = 0;

        // A) TF-IDF cosine similarity
        let dot = 0, magQ = 0, magD = 0;
        for (const term in queryTF) {
            const qVal = queryTF[term];
            const dVal = (docTF[term] || 0) * (idf[term] || 0);
            dot += qVal * dVal;
            magQ += qVal * qVal;
        }
        for (const term in docTF) {
            const dVal = docTF[term] * (idf[term] || 0);
            magD += dVal * dVal;
        }
        const tfidfScore = (magQ > 0 && magD > 0) ? dot / (Math.sqrt(magQ) * Math.sqrt(magD)) : 0;
        score += tfidfScore;

        // B) Direct keyword bonus (raw query words found in profile)
        for (const token of queryTokensRaw) {
            if (profileText.includes(token)) score += 0.04;
        }

        // C) Multi-word phrase match bonus
        if (queryTokensRaw.length > 1) {
            const phrase = contentQuery || lowerQuery;
            if (profileText.includes(phrase)) score += 0.1;
        }

        // D) Field-specific boost — if user asked about a specific field, boost matches there
        if (fieldFocus) {
            const fieldVal = fields[fieldFocus.field] || '';
            for (const token of queryTokensRaw) {
                if (fieldVal.includes(token)) score += 0.15;
            }
            // Check expanded synonyms against the focused field
            for (const token of expandedTokens) {
                if (fieldVal.includes(token)) score += 0.05;
            }
        }

        // E) Intent-based hard filters + boosts
        let passesIntentFilter = true;
        const intentReasons = [];

        for (const intent of intents) {
            if (intent.type === 'gradYear') {
                const gradStr = data.graduationDate || '';
                const yearMatch = gradStr.match(/(20\d{2})/);
                const gradYear = yearMatch ? parseInt(yearMatch[1]) : 0;
                if (intent.years.includes(gradYear)) {
                    score += 0.3; // Big boost for matching year
                    intentReasons.push(`Graduating: ${gradStr}`);
                } else {
                    passesIntentFilter = false;
                }
            }
            if (intent.type === 'pledgeClass') {
                if (fields.pledgeClass === intent.value.toLowerCase()) {
                    score += 0.3;
                    intentReasons.push(`Pledge Class: ${data.pledgeClass}`);
                } else {
                    passesIntentFilter = false;
                }
            }
            if (intent.type === 'filter') {
                if (intent.value === 'ec') {
                    const ecMembers = ['Karan Grover', 'Carrie Song', 'Sandra Obrycki', 'Jaelyn Gunter', 'Isabelle Baginski', 'Samuel Zou', 'Connor Wong', 'Naoki Sekine', 'Charleen You'];
                    if (ecMembers.includes(name)) {
                        score += 0.3;
                        intentReasons.push('Executive Committee member');
                    } else {
                        passesIntentFilter = false;
                    }
                }
                if (intent.value === 'chair') {
                    const chairs = ['James Kyung', 'Aldo Ramirez', 'Jahzeel Requena', 'William Sim', 'Jenny Chen', 'Ashley Lee', 'Tolu Bolaji', 'Anna Lin', 'Aidan Chan', 'Camila Sanchez', 'Walter Benitez', 'Claudelle Cortez'];
                    if (chairs.includes(name)) {
                        score += 0.3;
                        intentReasons.push('Committee Chair');
                    } else {
                        passesIntentFilter = false;
                    }
                }
            }
            if (intent.type === 'position') {
                const positions = (data.dspPositions || '').toLowerCase();
                if (positions.includes(intent.value)) {
                    score += 0.3;
                    intentReasons.push(`Position: ${data.dspPositions}`);
                } else {
                    passesIntentFilter = false;
                }
            }
            if (intent.type === 'leadership') {
                const hasLeadership = (data.dspPositions && data.dspPositions.trim() !== '' && data.dspPositions.toLowerCase() !== 'n/a')
                    || /president|vp |vice president|chair|director|lead|manager|head|captain/i.test(data.pastRoles || '');
                if (hasLeadership) {
                    score += 0.15;
                    const pos = data.dspPositions && data.dspPositions.toLowerCase() !== 'n/a' ? data.dspPositions : '';
                    intentReasons.push(pos ? `DSP: ${pos}` : 'Has leadership experience');
                } else {
                    score -= 0.1; // Penalize but don't hard-filter
                }
            }
        }

        // If there are hard-filter intents and this brother doesn't pass, skip
        if (!passesIntentFilter) continue;

        // F) Extract match reasons
        const reasons = [...intentReasons, ...extractReasons(query, contentQuery, data, expandedTokens)];
        // Deduplicate and limit
        const uniqueReasons = [...new Set(reasons)].slice(0, 3);

        results.push({
            name,
            fullName: data.fullName || name,
            image: data.image || '',
            score: Math.round(score * 1000) / 1000,
            reasons: uniqueReasons,
        });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
}

// =============================================
// REASON EXTRACTION — grounded in actual profile data
// =============================================
function extractReasons(originalQuery, contentQuery, data, expandedTokens) {
    const queryWords = tokenize(contentQuery || originalQuery);
    const allWords = new Set([...queryWords, ...expandedTokens]);
    const reasons = [];

    const fieldLabels = {
        careerInterests: 'Career',
        hobbies: 'Hobby',
        pastRoles: 'Experience',
        major: 'Major',
        bio: 'About',
        dspPositions: 'DSP Role',
        personality: 'Personality',
    };

    // Priority: check direct query words first, then expanded synonyms
    for (const wordSet of [queryWords, [...expandedTokens]]) {
        for (const [field, label] of Object.entries(fieldLabels)) {
            if (reasons.length >= 3) return reasons;
            const value = data[field];
            if (!value || value.toLowerCase() === 'n/a') continue;
            const lower = value.toLowerCase();

            for (const word of wordSet) {
                if (word.length < 3) continue;
                if (lower.includes(word)) {
                    const idx = lower.indexOf(word);
                    const start = Math.max(0, value.lastIndexOf(',', idx) + 1);
                    let end = value.indexOf(',', idx);
                    if (end === -1) end = value.length;
                    let snippet = value.substring(start, end).trim();
                    if (snippet.length > 55) snippet = snippet.substring(0, 52) + '...';
                    const reason = `${label}: ${snippet}`;
                    if (!reasons.some(r => r === reason)) {
                        reasons.push(reason);
                    }
                    break; // One reason per field
                }
            }
        }
        if (reasons.length >= 3) return reasons;
    }

    return reasons;
}

// --- Smart result filtering — only return genuinely relevant matches ---
function filterResults(results) {
    if (results.length === 0) return [];

    const topScore = results[0].score;

    // If the best match is very weak, nothing is relevant
    if (topScore < 0.03) return [];

    // Adaptive threshold: keep results that are at least 30% of the top score
    // This naturally scales — a strong top match (0.8) cuts at 0.24,
    // while a weaker top match (0.15) cuts at 0.045
    const relativeThreshold = topScore * 0.30;

    // Also enforce an absolute minimum
    const absoluteMin = 0.03;
    const threshold = Math.max(relativeThreshold, absoluteMin);

    const filtered = results.filter(r => r.score >= threshold);

    // Cap at 10 to keep results focused
    return filtered.slice(0, 10);
}

// --- Search endpoint ---
app.post('/api/search', (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const allResults = searchProfiles(query.trim());
        const topResults = filterResults(allResults);
        const hasGoodMatches = topResults.length > 0;

        res.json({
            results: topResults,
            hasGoodMatches,
            query: query.trim(),
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed. Please try again.' });
    }
});

// =============================================
// COFFEE CHAT TRACKING
// =============================================
const COFFEE_CHATS_FILE = process.env.COFFEE_CHATS_FILE || path.join(__dirname, 'coffee-chats.json');

// Tau class pledge names
const TAU_PLEDGES = [
    'Alexis', 'Jia', 'Kelly', 'Chetachi', 'Jaelyn',
    'Tarkan', 'Nolan', 'William', 'Sharon', 'Christiam',
    'Henna', 'Pema', 'Aryan'
];

function loadCoffeeChats() {
    try {
        if (fs.existsSync(COFFEE_CHATS_FILE)) {
            return JSON.parse(fs.readFileSync(COFFEE_CHATS_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Error loading coffee chats:', e);
    }
    return {};
}

function saveCoffeeChats(data) {
    fs.writeFileSync(COFFEE_CHATS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/coffee-chats — returns all requests, grouped by brother
app.get('/api/coffee-chats', (req, res) => {
    const data = loadCoffeeChats();
    res.json(data);
});

// POST /api/coffee-chats — { pledgeName, brotherName }
app.post('/api/coffee-chats', (req, res) => {
    const { pledgeName, brotherName } = req.body;

    if (!pledgeName || !brotherName) {
        return res.status(400).json({ error: 'pledgeName and brotherName are required' });
    }
    if (!TAU_PLEDGES.includes(pledgeName)) {
        return res.status(400).json({ error: 'Invalid pledge name' });
    }

    const data = loadCoffeeChats();

    // Each brother has an array of pledge names who requested
    if (!data[brotherName]) {
        data[brotherName] = [];
    }

    // Idempotent: same pledge can't request same brother twice
    if (data[brotherName].includes(pledgeName)) {
        return res.json({ status: 'already_requested', data });
    }

    data[brotherName].push(pledgeName);
    saveCoffeeChats(data);

    res.json({ status: 'ok', data });
});

// DELETE /api/coffee-chats — { pledgeName, brotherName }
app.delete('/api/coffee-chats', (req, res) => {
    const { pledgeName, brotherName } = req.body;

    if (!pledgeName || !brotherName) {
        return res.status(400).json({ error: 'pledgeName and brotherName are required' });
    }

    const data = loadCoffeeChats();
    if (data[brotherName]) {
        data[brotherName] = data[brotherName].filter(n => n !== pledgeName);
        if (data[brotherName].length === 0) delete data[brotherName];
        saveCoffeeChats(data);
    }

    res.json({ status: 'ok', data });
});

// --- Start server ---
function start() {
    buildIndex();
    app.listen(PORT, () => {
        console.log(`\nBrother Directory running at http://localhost:${PORT}`);
        console.log('Smart search with intent detection, field matching, and synonym expansion');
        console.log('Coffee chat tracking enabled');
        console.log('Press Ctrl+C to stop\n');
    });
}

start();
