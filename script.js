document.getElementById('getNativeAudio').addEventListener('click', async () => {
    const word = document.getElementById('wordInput').value;
    if (word) {
        const nativeAudioUrl = await fetchNativeAudio(word);
        document.getElementById('nativeAudio').src = nativeAudioUrl;
        document.getElementById('nativeAudio').style.display = 'block';
        document.getElementById('recordSection').style.display = 'block';
    } else {
        alert("Please enter a word.");
    }
});

async function fetchNativeAudio(word) {
    // 仮のネイティブ発音取得機能
    // 実際には適切なAPIやサービスを使用してください
    // ここではデモとして、既存の音声ファイルのURLを返します
    return 'https://example.com/native_audio/' + word + '.mp3';
}
