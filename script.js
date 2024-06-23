document.getElementById('getNativeAudio').addEventListener('click', async () => {
    const word = document.getElementById('wordInput').value;
    if (word) {
        const nativeAudioUrl = await fetchNativeAudio(word);
        if (nativeAudioUrl) {
            document.getElementById('nativeAudio').src = nativeAudioUrl;
            document.getElementById('nativeAudio').style.display = 'block';
            document.getElementById('recordSection').style.display = 'block';
        } else {
            alert("Failed to fetch native audio.");
        }
    } else {
        alert("Please enter a word.");
    }
});

async function fetchNativeAudio(word) {
    const apiKey = '97b5c406b7cde32439c3c5bb1802a696'; // あなたのAPIキー
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/6OGIebVd3VTvANBC9LnQ', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        body: JSON.stringify({
            text: word,
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75
            }
        })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return url;
    } else {
        console.error('Error fetching native audio:', response.statusText);
        return null;
    }
}

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
