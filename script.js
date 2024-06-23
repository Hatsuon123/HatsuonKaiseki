document.getElementById('getNativeAudio').addEventListener('click', async () => {
    console.log('Get Native Audio button clicked');
    const phrase = document.getElementById('phraseInput').value;
    if (phrase) {
        const words = phrase.split(' ');
        const audioControls = document.getElementById('audioControls');
        audioControls.innerHTML = '';
        for (const word of words) {
            const nativeAudioUrl = await fetchNativeAudio(word);
            if (nativeAudioUrl) {
                const audioElement = document.createElement('audio');
                audioElement.src = nativeAudioUrl;
                audioElement.controls = true;
                audioElement.dataset.word = word;
                audioControls.appendChild(audioElement);
                console.log(`Audio for word "${word}" added`);
            } else {
                alert(`Failed to fetch native audio for "${word}".`);
            }
        }
        document.getElementById('recordSection').style.display = 'block';
    } else {
        alert("Please enter a phrase.");
    }
});

async function fetchNativeAudio(word) {
    const apiKey = '97b5c406b7cde32439c3c5bb1802a696'; // あなたのAPIキー
    try {
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
            console.log(`Fetched native audio for "${word}"`);
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

document.getElementById('compareButton').addEventListener('click', async () => {
    console.log('Compare button clicked');
    const audioControls = document.getElementById('audioControls');
    const nativeBuffers = [];
    for (const audioElement of audioControls.getElementsByTagName('audio')) {
        const nativeBuffer = await fetchAudioBuffer(audioElement.src);
        nativeBuffers.push({ word: audioElement.dataset.word, buffer: nativeBuffer });
    }
    const userBuffer = await getUserAudioBuffer();

    for (const native of nativeBuffers) {
        const nativeFormants = analyzeAudio(native.buffer);
        const userFormants = analyzeAudio(userBuffer);

        drawFormants(native.word, nativeFormants, userFormants);
    }
});

async function fetchAudioBuffer(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

async function getUserAudioBuffer() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

function analyzeAudio(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const data = audioBuffer.getChannelData(0); // Mono audio
    const fftSize = 2048;
    const fft = new FFT(fftSize, sampleRate);
    fft.forward(data);

    // 簡単なピーク検出アルゴリズム
    const spectrum = fft.spectrum;
    const formants = [];
    for (let i = 0; i < spectrum.length; i++) {
        if (spectrum[i] > 0.5) { // 任意のしきい値
            formants.push(i * sampleRate / fftSize);
        }
    }
    return formants;
}

function drawFormants(word, nativeFormants, userFormants) {
    const canvas = document.getElementById('formantCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    for (const formant of nativeFormants) {
        ctx.beginPath();
        ctx.arc(formant / 10, 100, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = 'blue';
    for (const formant of userFormants) {
        ctx.beginPath();
        ctx.arc(formant / 10, 200, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Word: ${word}`, 10, 20);
}

class FFT {
    constructor(fftSize, sampleRate) {
        this.fftSize = fftSize;
        this.sampleRate = sampleRate;
        this.spectrum = new Array(fftSize / 2).fill(0);
    }

    forward(buffer) {
        // FFT処理をここに実装
        // これは単純化された例で、実際にはもっと複雑な処理が必要
        for (let i = 0; i < this.fftSize / 2; i++) {
            this.s
