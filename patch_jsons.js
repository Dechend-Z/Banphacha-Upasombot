const fs = require('fs');
const glob = require('glob');

// Map of code to youtube_id
const ytMap = {
    'ukasah': 'JroJer67uIY',
    'esahang': 'Zjz7DNFL-kA'
};

const folder = 'c:/Users/ACER/Desktop/My Project/Banphacha Upasombot/data';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = dir + '/' + file;
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.json') && file !== 'dhamma_quotes.json' && file !== 'lessons.json' && file !== 'paths.json') {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            const code = data.code;

            // Add youtube_id if it's ukasah or esahang
            if (ytMap[code]) {
                data.youtube_id = ytMap[code];
            }

            // Remove old audio fields and add yt_start if missing
            if (data.verses) {
                data.verses.forEach(v => {
                    delete v.audio;
                    delete v.audio_slow;
                    if (!v.yt_start) v.yt_start = 0;
                });
            }

            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
            console.log('Updated ' + fullPath);
        }
    }
}

processDir(folder);
