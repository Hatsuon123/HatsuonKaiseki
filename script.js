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
