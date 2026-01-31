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
            return this._processResponse(data.text);

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
        // Replace LORD/GOD with YHWH
        let processed = text.replace(/\b(the\s+)?LORD\b/gi, 'YHWH');
        processed = processed.replace(/\b(the\s+)?GOD\b/gi, 'YHWH');
        return processed;
    }

    _normalizeError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timed out. Please try again.');
        }
        return error;
    }
}
