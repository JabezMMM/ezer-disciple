export class ChatService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async sendMessage(question) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: question }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this._handleError(response);
            }

            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
                return data.messages.map(m => this._processResponse(m));
            }
            return this._processResponse(data.text || '');

        } catch (error) {
            clearTimeout(timeoutId);
            throw this._normalizeError(error);
        }
    }

    async _handleError(response) {
        let errorData = {};
        try { errorData = await response.json(); } catch (e) { }

        const err = new Error('API Error');
        err.status = response.status;
        err.details = errorData;

        // Retry-After handling
        const retryHeader = response.headers.get('Retry-After');
        if (retryHeader) {
            err.retryAfter = parseInt(retryHeader, 10);
        }

        throw err;
    }

    _processResponse(text) {
        if (!text || typeof text !== 'string') return '';
        // Replace LORD/GOD with YHWH (Case-sensitive for YHWH names, ignore case for 'the')
        let processed = text.replace(/\b([tT]he\s+)?LORD\b/g, 'YHWH');
        processed = processed.replace(/\b([tT]he\s+)?GOD\b/g, 'YHWH');
        return processed;
    }

    _normalizeError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timed out. Please try again.');
        }
        return error;
    }
}
