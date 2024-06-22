let audioContext;
let recorder;
let audioChunks = [];

document.getElementById('recordButton').addEventListener('click', () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (document.getElementById('recordButton').textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const input = audioContext.createMediaStreamSource(stream);
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                const audioBuffer = await audioBlob.arrayBuffer();
                const audio = await audioContext.decodeAudioData(audioBuffer);
                // フォルマント解析をここで実行
                document.getElementById('compareButton').disabled = false;
            };
            recorder.start();
        })
        .catch(err => {
            console.error('Error accessing microphone', err);
            document.getElementById('output').textContent = 'Error accessing microphone: ' + err.message;
        });
    document.getElementById('recordButton').textContent = 'Stop Recording';
    document.getElementById('compareButton').disabled = true;
}

function stopRecording() {
    recorder.stop();
    document.getElementById('recordButton').textContent = 'Start Recording';
}
