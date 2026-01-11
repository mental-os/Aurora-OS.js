import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../src/i18n/locales');

async function getDict(filename) {
    const filePath = join(LOCALES_DIR, filename);
    let content = readFileSync(filePath, 'utf-8');

    // Transform TS to JS:
    content = content.replace(/^import.*$/gm, '');
    content = content.replace(/: TranslationDict/g, '');
    const langMatch = filename.match(/^([a-z]+)\.ts/);
    const lang = langMatch ? langMatch[1] : filename.replace('.ts', '');
    content = content.replace(`export const ${lang} =`, `global.${lang} =`);

    const tempFile = join(tmpdir(), `check-identical-${lang}-${Date.now()}.js`);
    writeFileSync(tempFile, content);

    await import(pathToFileURL(tempFile).href);
    return global[lang];
}

function getValueMap(obj, prefix = '') {
    let map = {};
    if (!obj || typeof obj !== 'object') return map;

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(map, getValueMap(obj[key], fullKey));
        } else {
            map[fullKey] = obj[key];
        }
    }
    return map;
}

async function run() {
    const allFiles = readdirSync(LOCALES_DIR).filter(f => f.endsWith('.ts'));
    const locales = allFiles.filter(f => f !== 'en.ts').sort();
    
    let enDict;
    try {
        enDict = await getDict('en.ts');
    } catch (e) {
        console.error('Failed to parse en.ts:', e);
        process.exit(1);
    }

    const enValues = getValueMap(enDict);
    console.log(`Baseline (en.ts) has ${Object.keys(enValues).length} keys.`);

    for (const locale of locales) {
        let dict;
        try {
            dict = await getDict(locale);
        } catch (e) {
            console.error(`Failed to parse ${locale}:`, e);
            continue;
        }

        const values = getValueMap(dict);
        const identical = [];

        for (const key in values) {
            if (enValues[key] !== undefined && values[key] === enValues[key]) {
                // Ignore very short strings or technical ones that might be identical
                if (values[key].length < 3) continue;
                if (['N/A', 'N/D', 'BIOS', 'CPU', 'RAM', 'GPU', 'SUDO', 'Sudo'].includes(values[key])) continue;
                
                identical.push({ key, value: values[key] });
            }
        }

        console.log(`\nChecking ${locale}:`);
        if (identical.length > 0) {
            console.log(`  [POTENTIAL UNTRANSLATED] ${identical.length} keys have identical values to en.ts:`);
            identical.forEach(item => console.log(`    - ${item.key}: "${item.value}"`));
        } else {
            console.log(`  [OK] No identical long strings found.`);
        }
    }
}

run();
