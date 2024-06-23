document.getElementById('getNativeAudio').addEventListener('click', async () => {
    console.log('Get Native Audio button clicked');
    const phrase = document.getElementById('phraseInput').value;
    if (phrase) {
        const nativeAudioUrl = await fetchNativeAudio(phrase);
        if (nativeAudioUrl) {
            const nativeAudio = document.getElementById('nativeAudio');
            nativeAudio.src = nativeAudioUrl;
            nativeAudio.style.display = 'block';
            document.getElementById('recordSection').style.display = 'block';
            console.log(`Fetched native audio for phrase "${phrase}"`);
        } else {
            alert(`Failed to fetch native audio for phrase "${phrase}".`);
        }
    } else {
        alert("Please enter a phrase.");
    }
});

async function fetchNativeAudio(phrase) {
    const apiKey = '97b5c406b7cde32439c3c5bb1802a696'; // あなたのAPIキー
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/6OGIebVd3VTvANBC9LnQ', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: phrase,
                voice_settings: {
                    stability: 0.75,
                    similarity_boost: 0.75
                }
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            console.log(`Fetched native audio for phrase "${phrase}"`);
            return url;
        } else {
            console.error('Error fetching native audio:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching native audio:', error);
        return null;
    }
}

let audioContext;
let recorder;
let audioChunks = [];

document.getElementById('recordButton').addEventListener('click', () => {
    console.log('Record button clicked');
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
            audioChunks = []; // Clear previous recordings
            recorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioBuffer = await audioBlob.arrayBuffer();
                const audio = await audioContext.decodeAudioData(audioBuffer);
                // フォルマント解析をここで実行
                document.getElementById('compareButton').disabled = false;
            };
            recorder.start();
            document.getElementById('recordButton').textContent = 'Stop Recording';
        })
        .catch(err => {
            console.error('Error accessing microphone', err);
            document.getElementById('output').textContent = 'Error accessing microphone: ' + err.message;
        });
}

function stopRecording() {
    recorder.stop();
    document.getElementById('recordButton').textContent = 'Start Recording';
}
