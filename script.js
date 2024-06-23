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
    const apiKey = '97b5c406b7cde32439c3c5bb1802a696'; // ここにあなたのAPIキーを入力してください
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
