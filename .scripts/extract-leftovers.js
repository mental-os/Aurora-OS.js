import fs from 'fs';

const data = JSON.parse(fs.readFileSync('identical_keys.json', 'utf8'));
const uniqueKeys = {};

for (const lang in data) {
    for (const key in data[lang]) {
        if (!uniqueKeys[key]) {
            uniqueKeys[key] = data[lang][key];
        }
    }
}

// Filter out proper nouns/technical terms that shouldn't be translated
const ignoreList = ['Electron', 'Chrome', 'Node.js', 'TSX', 'JSON', 'CSS', 'HTML', 'Bash', 'Turms', 'Root', 'Admin', 'Mixer', 'Shell', 'TypeScript', 'JavaScript', 'Administrator'];
const filteredKeys = {};

for (const key in uniqueKeys) {
    const val = uniqueKeys[key];
    if (!ignoreList.includes(val) && val.length > 2) {
        filteredKeys[key] = val;
    }
}

fs.writeFileSync('to_translate.json', JSON.stringify(filteredKeys, null, 2));
console.log(`Extracted ${Object.keys(filteredKeys).length} unique keys to translate.`);
