export class UIManager {
    constructor() {
        this.messagesDiv = document.getElementById('messages');
        this.input = document.getElementById('question-input');
        this.sendBtn = document.getElementById('send-btn');
        this.toastContainer = this._getOrCreateToastContainer();
    }

    addMessage(text, sender, isLoading = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}${isLoading ? ' loading' : ''}`;

        if (sender === 'assistant' && !isLoading) {
            msgDiv.innerHTML = this._linkifyVerses(text);
        } else {
            msgDiv.textContent = text;
        }

        this.messagesDiv.appendChild(msgDiv);
        this.scrollToBottom();
        return msgDiv;
    }

    removeLoading() {
        const loading = this.messagesDiv.querySelector('.loading');
        if (loading) loading.remove();
    }

    scrollToBottom() {
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }

    setLoadingState(isLoading) {
        this.sendBtn.disabled = isLoading;
        if (!isLoading) {
            this.input.focus();
        }
    }

    showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const close = document.createElement('span');
        close.className = 'close';
        close.textContent = '✕';
        close.onclick = () => toast.remove();

        toast.appendChild(close);
        this.toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), duration);
    }

    _getOrCreateToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    _linkifyVerses(text) {
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

        const linkedText = text.replace(/\b([1-3]?\s?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g,
            (match, book, ch, v1, v2) => {
                const abbr = bookAbbrev[book.trim()];
                if (!abbr) return match;
                let ref = `${abbr}%20${ch}`;
                if (v1) ref += `:${v1}`;
                if (v2) ref += `-${v2}`;
                return `<a href="https://www.biblegateway.com/passage/?search=${ref}&version=NASB" target="_blank">${match}</a>`;
            }
        );

        return this._sanitizeHtml(linkedText);
    }

    _sanitizeHtml(html) {
        // 1. Sanitize with DOMPurify to allow only safe tags
        const clean = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        });

        // 2. Custom enforcement: Only allow links to biblegateway.com
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, 'text/html');

        doc.querySelectorAll('a').forEach(a => {
            try {
                const url = new URL(a.href);
                if (!url.hostname.endsWith('biblegateway.com')) {
                    const text = document.createTextNode(a.textContent);
                    a.parentNode.replaceChild(text, a);
                }
            } catch (e) {
                a.remove();
            }
        });

        return doc.body.innerHTML;
    }
}
