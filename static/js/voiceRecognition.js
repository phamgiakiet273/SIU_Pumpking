export function initVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    const result = document.getElementById('query');
    const recordedAudio = document.getElementById('recordedAudio');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let noSpeechTimeout;

    // Enable continuous mode and interim results for real-time transcription
    recognition.continuous = true;
    recognition.interimResults = true;

    // Store final transcript
    let finalTranscript = '';

    recognition.onstart = () => {
        //console.log('Voice recognition started');
        voiceBtn.classList.add('active');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;  // Append final results to the final transcript
            } else {
                interimTranscript += transcript;  // Collect interim results
            }
        }

        // Update the textarea with the combined final and interim transcripts
        result.value = finalTranscript + interimTranscript;

        // Reset the timeout each time new speech is detected
        clearTimeout(noSpeechTimeout);

        // Start a new timeout for 7 seconds after the last speech detection
        noSpeechTimeout = setTimeout(() => {
            //console.log('No speech for 7 seconds, stopping recognition');
            recognition.stop();
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
            voiceBtn.classList.remove('active');
            isRecording = false;
        }, 7000);
    };

    recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
    };

    voiceBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        if (isRecording) {
            // Stop everything when the button is clicked again
            recognition.stop();
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
            clearTimeout(noSpeechTimeout);
            isRecording = false;
            voiceBtn.classList.remove('active');
            return;
        }

        finalTranscript = ''; // Reset the final transcript when starting a new recording
        const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || 'vi-VN';
        recognition.lang = selectedLanguage;
        recognition.start();

        // Start recording audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            recordedAudio.src = audioUrl;
        };

        mediaRecorder.start();
        isRecording = true;
    });
}
