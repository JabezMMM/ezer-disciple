import { ChatService } from './js/chat_service.js';
import { UIManager } from './js/ui_manager.js';

// Configuration
const PROXY_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/ezer-disciple/us-central1/generate' // Local Firebase Emulator
    : '/generate'; // Firebase Hosting rewrite to Function

const chatService = new ChatService(PROXY_URL);
const uiManager = new UIManager();
let lastQuestion = null;

// Event Listeners
document.getElementById('send-btn').addEventListener('click', handleSend);
document.getElementById('question-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Welcome Message
window.addEventListener('load', () => {
    uiManager.addMessage("Hi! Ask me any question about faith, anxiety, love, or life. I'll answer using Scripture.", 'assistant');
});

async function handleSend() {
    const question = uiManager.input.value.trim();
    if (!question) return;

    lastQuestion = question;
    uiManager.addMessage(question, 'user');
    uiManager.input.value = '';
    uiManager.setLoadingState(true);

    // Show loading indicator
    uiManager.addMessage('Thinking...', 'assistant', true);

    try {
        const response = await chatService.sendMessage(question);
        uiManager.removeLoading();
        uiManager.addMessage(response, 'assistant');
    } catch (error) {
        uiManager.removeLoading();

        if (error.retryAfter) {
            handleRetry(error.retryAfter);
        } else {
            uiManager.addMessage(error.message || 'Unable to get a response.', 'error');
            uiManager.showToast(error.message, 'error');
        }
    } finally {
        uiManager.setLoadingState(false);
    }
}

function handleRetry(seconds) {
    uiManager.addMessage(`Service busy. Retrying in ${seconds}s...`, 'error');

    setTimeout(async () => {
        uiManager.showToast('Auto-retrying...', 'info');
        try {
            const response = await chatService.sendMessage(lastQuestion);
            uiManager.addMessage(response, 'assistant');
        } catch (e) {
            uiManager.showToast('Retry failed: ' + e.message, 'error');
        }
    }, seconds * 1000);
}