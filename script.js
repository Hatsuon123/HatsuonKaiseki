let recordButton = document.getElementById('recordButton');
let compareButton = document.getElementById('compareButton');
let output = document.getElementById('output');
let nativeAudio = document.getElementById('nativeAudio');
let audioContext;
let recorder;
let audioChunks = [];

recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
    }
});

compareButton.addEventListener('click', comparePronunciation);

function startRecording() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            let input = audioContext.createMediaStreamSource(stream);
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
            recorder.onstop = async () => {
                let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                let audioBuffer = await audioBlob.arrayBuffer();
                let audio = await audioContext.decodeAudioData(audioBuffer);
                analyzeAudio(audio, 'user');
            };
            recorder.start();
        })
        .catch(err => {
            console.error('Error accessing microphone', err);
            output.textContent = 'Error accessing microphone: ' + err.message;
        });
    recordButton.textContent = 'Stop Recording';
    compareButton.disabled = true;
}

function stopRecording() {
    recorder.stop();
    recordButton.textContent = 'Start Recording';
    compareButton.disabled = false;
}

function analyzeAudio(audio, type) {
    let fft = new p5.FFT();
    let buffer = audio.getChannelData(0);
    let soundFile = new p5.SoundFile();
    soundFile.setBuffer([buffer]);
    fft.setInput(soundFile);
    
    let spectrum = fft.analyze();
    
    let formants = estimateFormants(spectrum);
    
    if (type === 'user') {
        output.textContent = 'User Formants: ' + JSON.stringify(formants);
    } else if (type === 'native') {
        output.textContent += ' | Native Formants: ' + JSON.stringify(formants);
    }
}

function estimateFormants(spectrum) {
    // 簡単なフォルマント解析の例
    let formants = { F1: 500, F2: 1500 };
    // 実際のフォルマント解析には詳細なアルゴリズムが必要
    return formants;
}

function comparePronunciation() {
    // ネイティブの音声の解析
    nativeAudio.play();
    nativeAudio.onended = () => {
        audioContext.decodeAudioData(nativeAudio.captureStream().getAudioTracks()[0], buffer => {
            analyzeAudio(buffer, 'native');
        });
    };
}
