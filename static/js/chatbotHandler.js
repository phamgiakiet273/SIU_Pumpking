import { createChat } from './chat.bundle.es.js';

export function createChatHandler(){

    createChat({
        webhookUrl: 'http://localhost:5678/webhook/fd7dd461-e9d9-4cfc-a274-a8023306c52f/chat',
        target: document.getElementById('n8n‑chat'),
        mode: 'fullscreen',
        allowFileUploads: true,
        initialMessages: [
            'Pumpking, ready to serve',
            'How can this humble servant be of use to you?'
        ],
        showWelcomeScreen: false,
        i18n: {
            en: {
                title: 'PUMPKING 🎃👑',
                subtitle: "May this boundless knowledge become your vision.",
                footer: '',
                getStarted: 'New Conversation',
                inputPlaceholder: 'Type your question..',
            },
        },
    });
}
