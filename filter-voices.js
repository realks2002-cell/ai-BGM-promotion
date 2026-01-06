const fs = require('fs');

try {
    const rawData = fs.readFileSync('voices.json');
    const json = JSON.parse(rawData);

    // items 배열이거나 voices 배열일 수 있음
    const voices = json.items || json.voices || [];

    console.log(`Total voices found: ${voices.length}`);

    // Filter Korean voices
    const koreanVoices = voices.filter(v => v.language && v.language.includes('ko'));

    // Sort by name for consistency
    koreanVoices.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Korean voices found: ${koreanVoices.length}`);

    // Map to simplified object
    const exportVoices = koreanVoices.slice(0, 15).map(v => ({
        id: v.voice_id,
        name: v.name,
        gender: v.gender,
        description: v.description,
        styles: v.styles || []
    }));

    fs.writeFileSync('filtered_voices.json', JSON.stringify(exportVoices, null, 2));
    console.log('Saved top 15 Korean voices to filtered_voices.json');

    exportVoices.forEach(v => {
        console.log(`- [${v.id}] ${v.name} (${v.gender})`);
    });

} catch (e) {
    console.error('Error processing voices.json:', e);
}
