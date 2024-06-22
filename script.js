let recordButton = document.getElementById('recordButton');
let compareButton = document.getElementById('compareButton');
let output = document.getElementById('output');
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
                analyzeAudio(audio);
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
    fft.setInput(new p5.SoundFile(buffer));
    
    let spectrum = fft.analyze();
    
    let formants = estimateFormants(spectrum);
    
    output.textContent = 'Formants analyzed: ' + JSON.stringify(formants);
}

function estimateFormants(spectrum) {
    let formants = { F1: 500, F2: 1500 };
    return formants;
}

function comparePronunciation() {
    let nativeFormants = { F1: 500, F2: 1500 };
    let userFormants = estimateFormants(spectrum);

    let comparisonResult = compareFormants(nativeFormants, userFormants);
    output.textContent = 'Comparison result: ' + JSON.stringify(comparisonResult);
}

function compareFormants(nativeFormants, userFormants) {
    let result = {
        F1Difference: Math.abs(nativeFormants.F1 - userFormants.F1),
        F2Difference: Math.abs(nativeFormants.F2 - userFormants.F2)
    };
    return result;
}
