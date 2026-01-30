// Hardcoded popular verses for v0
const VERSES = [
    { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
    { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
    { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
    { ref: "Matthew 11:28-30", text: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls." },
    { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
    { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future." },
    { ref: "Psalm 23:1-4", text: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
    { ref: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." },
    { ref: "2 Timothy 1:7", text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind." },
    { ref: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you." },
    { ref: "Matthew 6:33-34", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well. Therefore do not worry about tomorrow, for tomorrow will worry about itself." },
    { ref: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will." },
    { ref: "Ephesians 2:8-9", text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast." },
    { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go." },
    { ref: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble." },
    { ref: "John 14:6", text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'" },
    { ref: "Romans 5:8", text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us." },
    { ref: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear." },
    { ref: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
    { ref: "James 1:2-3", text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance." }
];

// Use server-side proxy. API key moved to .env on the server.
const PROXY_URL = '/generate';

// DOM elements
const messagesDiv = document.getElementById('messages');
const questionInput = document.getElementById('question-input');
const sendBtn = document.getElementById('send-btn');

// Event listeners
sendBtn.addEventListener('click', handleSend);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Main handler
let lastQuestion = null;
let retryTimer = null;
let retryAttempts = 0;
const MAX_CLIENT_RETRIES = 3;

function createRetryMessage(initialSeconds, onRetry) {
    const container = document.createElement('div');
    container.className = 'message error';

    const textNode = document.createElement('span');
    textNode.textContent = `Service temporarily unavailable. Retrying in ${initialSeconds}s...`;
    container.appendChild(textNode);

    const spacer = document.createElement('span');
    spacer.style.margin = '0 8px';
    container.appendChild(spacer);

    // Remaining attempts indicator
    const attemptsSpan = document.createElement('span');
    const remainingAttempts = Math.max(0, MAX_CLIENT_RETRIES - retryAttempts);
    attemptsSpan.textContent = ` (${remainingAttempts} retries left)`;
    attemptsSpan.style.marginLeft = '8px';
    container.appendChild(attemptsSpan);

    // Retry button with spinner
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn-retry';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.style.display = 'none';
    retryBtn.appendChild(spinner);

    const retryLabel = document.createElement('span');
    retryLabel.textContent = 'Retry now';
    retryBtn.appendChild(retryLabel);

    retryBtn.addEventListener('click', () => {
        // prevent click if no retries left
        if (MAX_CLIENT_RETRIES - retryAttempts <= 0) return;
        // show spinner and disable buttons
        spinner.style.display = '';
        retryBtn.disabled = true;
        cancelBtn.disabled = true;
        if (onRetry) onRetry(true);
    });
    container.appendChild(retryBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn-cancel';
    cancelBtn.addEventListener('click', () => {
        if (onRetry) onRetry(false);
    });
    container.appendChild(cancelBtn);

    messagesDiv.appendChild(container);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    let remaining = initialSeconds;
    const intervalId = setInterval(() => {
        remaining -= 1;
        if (remaining >= 0) textNode.textContent = `Service temporarily unavailable. Retrying in ${remaining}s...`;
    }, 1000);

    return {
        element: container,
        clear: () => {
            clearInterval(intervalId);
            if (container.parentNode) container.parentNode.removeChild(container);
        },
        setLoading: () => {
            spinner.style.display = '';
            retryBtn.disabled = true;
            cancelBtn.disabled = true;
        }
    };
}

async function performSend(question) {
    // central send logic for retries
    try {
        const response = await getGeminiResponse(question);
        removeLoadingMessage();
        addMessage(response, 'assistant', false, true);
        retryAttempts = 0; // reset on success
        return true;
    } catch (err) {
        removeLoadingMessage();
        throw err;
    }
}

async function handleSend() {
    const question = questionInput.value.trim();
    if (!question) return;

    lastQuestion = question;

    // Display user message
    addMessage(question, 'user');
    questionInput.value = '';
    sendBtn.disabled = true;

    // Show loading
    addMessage('...', 'assistant', true);

    try {
        const response = await getGeminiResponse(question);
        removeLoadingMessage();
        // Response may contain sanitized HTML links — insert as HTML
        addMessage(response, 'assistant', false, true);
    } catch (error) {
        removeLoadingMessage();

        // If server suggests Retry-After or we can do client retry
        const retrySeconds = (error && error.retryAfter) ? error.retryAfter : null;

        // If we have a retrySeconds, show retry UI with auto-retry and 'Retry now'
        if (retrySeconds) {
            const ui = createRetryMessage(retrySeconds, async (doRetry) => {
                if (!doRetry) {
                    ui.clear();
                    sendBtn.disabled = false;
                    questionInput.focus();
                    return;
                }
                // Immediate retry triggered: show spinner state
                ui.setLoading();
                showToast('Retrying now…', 'info');
                try {
                    // Count this as a retry attempt
                    retryAttempts += 1;
                    await performSend(lastQuestion);
                    ui.clear();
                    showToast('Retry successful', 'success');
                } catch (err) {
                    ui.clear();
                    addMessage(err.message || 'Error: Unable to get response.', 'error');
                    showToast(err.message || 'Error during retry', 'error');
                    console.error(err);
                } finally {
                    sendBtn.disabled = false;
                    questionInput.focus();
                }
            });

            // Auto-retry after given seconds
            setTimeout(async () => {
                // Auto-retry: mark attempt and show a loading state
                ui.setLoading();
                showToast('Auto-retrying now…', 'info');
                try {
                    retryAttempts += 1;
                    await performSend(lastQuestion);
                    ui.clear();
                    showToast('Retry successful', 'success');
                } catch (err) {
                    ui.clear();
                    addMessage(err.message || 'Error: Unable to get response.', 'error');
                    showToast(err.message || 'Error during auto-retry', 'error');
                    console.error(err);
                } finally {
                    sendBtn.disabled = false;
                    questionInput.focus();
                }
            }, retrySeconds * 1000);

            return;
        }

        // No server-suggested retry; attempt client-side exponential backoff retries up to MAX_CLIENT_RETRIES
        if (retryAttempts < MAX_CLIENT_RETRIES) {
            const wait = Math.pow(2, retryAttempts); // 1,2,4...
            retryAttempts += 1;
            const ui = createRetryMessage(wait, async (doRetry) => {
                ui.clear();
                if (!doRetry) {
                    sendBtn.disabled = false;
                    questionInput.focus();
                    return;
                }
                // Immediate retry
                addMessage('...', 'assistant', true);
                try {
                    await performSend(lastQuestion);
                } catch (err) {
                    addMessage(err.message || 'Error: Unable to get response.', 'error');
                    showToast(err.message || 'Error: Unable to get response.', 'error');
                    console.error(err);
                } finally {
                    sendBtn.disabled = false;
                    questionInput.focus();
                }
            });

            setTimeout(async () => {
                ui.clear();
                addMessage('...', 'assistant', true);
                try {
                    await performSend(lastQuestion);
                } catch (err) {
                    addMessage(err.message || 'Error: Unable to get response.', 'error');
                    showToast(err.message || 'Error: Unable to get response.', 'error');
                    console.error(err);
                } finally {
                    sendBtn.disabled = false;
                    questionInput.focus();
                }
            }, wait * 1000);

            return;
        }

        // Exhausted retries, show final error (layman message only)
        const finalMsg = error && error.message ? error.message : 'Unable to get a response. Please try again later.';
        addMessage(finalMsg, 'error');
        showToast(finalMsg, 'error');
        console.error(error);
    } finally {
        sendBtn.disabled = false;
        questionInput.focus();
    }
}

// Call Gemini API
async function getGeminiResponse(question) {
    // Format verses for context
    const versesContext = VERSES.map(v => `${v.ref}: "${v.text}"`).join('\n\n');

    const prompt = `You are a biblical assistant. Answer the following question using ONLY the scripture verses provided below. Be concise and conversational (2-3 sentences max). Always cite which verses you're using.

QUESTION: ${question}

AVAILABLE VERSES:
${versesContext}

Instructions:
- Use ONLY these verses to answer
- Be brief and conversational
- Cite verse references used
- Do not add theological interpretation
- If question is not about faith/life, say "I can only answer questions about faith and life using Scripture."`;

    // Browser fetch timeout using AbortController
    const CLIENT_FETCH_TIMEOUT_MS = 15000; // 15s
    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_FETCH_TIMEOUT_MS);

    try {
        response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
            signal: controller.signal
        });
    } catch (e) {
        // Network-level error (server unreachable / CORS / network down) or abort
        if (e.name === 'AbortError') {
            const err = new Error('Request timed out — the server took too long to respond. Please try again.');
            err._raw = e;
            clearTimeout(timeoutId);
            throw err;
        }
        const err = new Error('Backend unreachable — is the server running?');
        err._raw = e;
        clearTimeout(timeoutId);
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        let rawBody = null;
        let retryAfter = null;
        try {
            rawBody = await response.json();
            // Try to find retry delay in body details
            const details = rawBody && rawBody.error && rawBody.error.details ? rawBody.error.details : null;
            if (details && Array.isArray(details)) {
                for (const d of details) {
                    if (d && d.retryDelay) {
                        const s = d.retryDelay;
                        if (s.endsWith('s')) retryAfter = parseInt(parseFloat(s.slice(0, -1)), 10);
                        break;
                    }
                }
            }
        } catch (e) {
            // ignore parse errors
        }

        // Fallback to Retry-After header
        const ra = response.headers.get('Retry-After');
        if (!retryAfter && ra) {
            retryAfter = parseInt(ra, 10);
        }

        // Map status codes to layman-friendly messages
        let friendly = 'Unable to get a response from the service. Please try again later.';
        if (response.status === 429) {
            if (retryAfter) friendly = `Service is temporarily unavailable. Will retry in ${retryAfter} seconds.`;
            else friendly = 'Service is temporarily unavailable. Please try again later.';
        } else if (response.status === 401 || response.status === 403) {
            friendly = 'Authentication error. Please check the API key and permissions.';
        } else if (response.status >= 500 && response.status < 600) {
            friendly = 'Service temporarily unavailable. Please try again shortly.';
        }

        const err = new Error(friendly);
        // attach machine-readable details for logging and retry handling
        if (retryAfter) err.retryAfter = retryAfter;
        err._raw = rawBody;
        err._status = response.status;
        throw err;
    }

    const data = await response.json();
    let text = data.text;

    // Replace LORD with YHWH
    text = text.replace(/\b(the\s+)?LORD\b/gi, 'YHWH');
    text = text.replace(/\b(the\s+)?GOD\b/gi, 'YHWH');

    text = linkifyReferences(text);

    return text;
}

// UI helpers
function sanitizeHtml(html) {
    // Parse and keep only text nodes and safe <a> links to biblegateway
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const frag = document.createDocumentFragment();

    doc.body.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            frag.appendChild(document.createTextNode(node.textContent));
            return;
        }

        if (node.nodeName === 'A') {
            const href = node.getAttribute('href') || '';
            try {
                const url = new URL(href, window.location.href);
                // Only allow links to biblegateway.com
                if (url.hostname.endsWith('biblegateway.com')) {
                    const a = document.createElement('a');
                    a.href = url.toString();
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = node.textContent || url.toString();
                    frag.appendChild(a);
                    return;
                }
            } catch (e) {
                // Invalid URL — fall through to text
            }
            frag.appendChild(document.createTextNode(node.textContent || ''));
            return;
        }

        // For any other element, preserve only its text content
        frag.appendChild(document.createTextNode(node.textContent || ''));
    });

    const container = document.createElement('div');
    container.appendChild(frag);
    return container.innerHTML;
}

function showToast(message, type = 'info', timeout = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });

    toast.appendChild(closeBtn);
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, timeout);

    return toast;
}

function addMessage(text, type, isLoading = false, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}${isLoading ? ' loading' : ''}`;
    if (isHtml) {
        // Sanitize before inserting into DOM
        messageDiv.innerHTML = sanitizeHtml(text);
    } else {
        messageDiv.textContent = text;
    }
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeLoadingMessage() {
    const loading = messagesDiv.querySelector('.loading');
    if (loading) loading.remove();
}

// Welcome message
window.addEventListener('load', () => {
    addMessage("Hi! Ask me any question about faith, anxiety, love, or life. I'll answer using Scripture.", 'assistant');
});

function linkifyReferences(text) {
    const bookAbbrev = {
        'Genesis': 'gen', 'Exodus': 'exo', 'Leviticus': 'lev', 'Numbers': 'num', 'Deuteronomy': 'deu',
        'Joshua': 'jos', 'Judges': 'jdg', 'Ruth': 'rut', '1 Samuel': '1sa', '2 Samuel': '2sa',
        '1 Kings': '1ki', '2 Kings': '2ki', '1 Chronicles': '1ch', '2 Chronicles': '2ch',
        'Ezra': 'ezr', 'Nehemiah': 'neh', 'Esther': 'est', 'Job': 'job', 'Psalm': 'psa', 'Psalms': 'psa',
        'Proverbs': 'pro', 'Ecclesiastes': 'ecc', 'Song of Solomon': 'sng',
        'Isaiah': 'isa', 'Jeremiah': 'jer', 'Lamentations': 'lam', 'Ezekiel': 'eze', 'Daniel': 'dan',
        'Hosea': 'hos', 'Joel': 'joe', 'Amos': 'amo', 'Obadiah': 'oba', 'Jonah': 'jon', 'Micah': 'mic',
        'Nahum': 'nam', 'Habakkuk': 'hab', 'Zephaniah': 'zep', 'Haggai': 'hag', 'Zechariah': 'zec', 'Malachi': 'mal',
        'Matthew': 'mat', 'Mark': 'mar', 'Luke': 'luk', 'John': 'joh', 'Acts': 'act',
        'Romans': 'rom', '1 Corinthians': '1co', '2 Corinthians': '2co', 'Galatians': 'gal',
        'Ephesians': 'eph', 'Philippians': 'php', 'Colossians': 'col',
        '1 Thessalonians': '1th', '2 Thessalonians': '2th', '1 Timothy': '1ti', '2 Timothy': '2ti',
        'Titus': 'tit', 'Philemon': 'phm', 'Hebrews': 'heb', 'James': 'jas',
        '1 Peter': '1pe', '2 Peter': '2pe', '1 John': '1jn', '2 John': '2jn', '3 John': '3jn',
        'Jude': 'jud', 'Revelation': 'rev'
    };

    return text.replace(/\b([1-3]?\s?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g,
        (match, book, ch, v1, v2) => {
            const abbr = bookAbbrev[book.trim()];
            if (!abbr) return match;
            let ref = `${abbr}%20${ch}`;
            if (v1) ref += `:${v1}`;
            if (v2) ref += `-${v2}`;
            return `<a href="https://www.biblegateway.com/passage/?search=${ref}&version=NASB" target="_blank">${match}</a>`;
        }
    );
}