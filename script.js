let recordButton = document.getElementById('recordButton');
let compareButton = document.getElementById('compareButton');
let output = document.getElementById('output');
let nativeAudio = document.getElementById('nativeAudio');
let audioContext;
let recorder;
let audioChunks = [];
let nativeBuffer;
let userFormants;
let nativeFormants;
let canvas;

recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Start Recording') {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        startRecording();
    } else {
        stopRecording();
    }
});

compareButton.addEventListener('click', comparePronunciation);

function setup() {
    canvas = createCanvas(800, 400);
    canvas.parent('output');
    noLoop();
}

function draw() {
    background(220);
    if (userFormants) {
        drawFormants(userFormants, 'User', color(0, 0, 255));
    }
    if (nativeFormants) {
        drawFormants(nativeFormants, 'Native', color(255, 0, 0));
    }
}

function startRecording() {
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
                userFormants = analyzeAudio(audio);
                redraw();
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

function analyzeAudio(audio) {
    let fft = new p5.FFT();
    let buffer = audio.getChannelData(0);
    let soundFile = new p5.SoundFile();
    soundFile.setBuffer([buffer]);
    fft.setInput(soundFile);
    
    let spectrum = fft.analyze();
    
    return estimateFormants(spectrum);
}

function estimateFormants(spectrum) {
    // 簡単なフォルマント解析の例
    let formants = { F1: 500, F2: 1500 };
    // 実際のフォルマント解析には詳細なアルゴリズムが必要
    return formants;
}

function drawFormants(formants, label, col) {
    fill(col);
    noStroke();
    textSize(16);
    text(`${label} Formants`, 10, height - 10);
    ellipse(formants.F1 / 4, height - 50, 20, 20);
    text('F1', formants.F1 / 4 + 10, height - 50);
    ellipse(formants.F2 / 4, height - 100, 20, 20);
    text('F2', formants.F2 / 4 + 10, height - 100);
}

function comparePronunciation() {
    if (!nativeBuffer) {
        fetch('native_dog.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedData => {
                nativeBuffer = decodedData;
                nativeFormants = analyzeAudio(nativeBuffer);
                redraw();
            })
            .catch(err => console.error('Error decoding native audio', err));
    } else {
        nativeFormants = analyzeAudio(nativeBuffer);
        redraw();
    }
}
