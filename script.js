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
    const apiKey = 'YOUR_ELEVENLABS_API_KEY'; // 97b5c406b7cde32439c3c5bb1802a696
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
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
