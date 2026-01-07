import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../src/i18n/locales');

async function getDict(filename) {
    const filePath = join(LOCALES_DIR, filename);
    let content = readFileSync(filePath, 'utf-8');

    // Transform TS to JS:
    // 1. Remove imports
    content = content.replace(/^import.*$/gm, '');
    // 2. Remove Type annotations
    content = content.replace(/: TranslationDict/g, '');
    // 3. Change export const to global assignment
    const langMatch = filename.match(/^([a-z]+)\.ts/);
    const lang = langMatch[1];
    content = content.replace(`export const ${lang} =`, `global.${lang} =`);

    // Create a temp file to import or eval
    const tempFile = join(tmpdir(), `check-i18n-${lang}-${Date.now()}.js`);
    writeFileSync(tempFile, content);

    await import(pathToFileURL(tempFile).href);
    return global[lang];
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    if (!obj || typeof obj !== 'object') return keys;

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

async function run() {
    const locales = ['en.ts', 'de.ts', 'es.ts', 'fr.ts', 'pt.ts', 'ro.ts'];
    let enDict;
    try {
        enDict = await getDict('en.ts');
    } catch (e) {
        console.error('Failed to parse en.ts:', e);
        process.exit(1);
    }

    const baseline = getAllKeys(enDict).sort();
    console.log(`Baseline (en.ts) has ${baseline.length} keys.`);

    let hasErrors = false;

    for (const locale of locales.slice(1)) {
        let dict;
        try {
            dict = await getDict(locale);
        } catch (e) {
            console.error(`Failed to parse ${locale}:`, e);
            hasErrors = true;
            continue;
        }

        const keys = getAllKeys(dict).sort();
        const missing = baseline.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !baseline.includes(k));

        console.log(`\nChecking ${locale}:`);
        if (missing.length > 0) {
            console.error(`  [ERROR] Missing ${missing.length} keys:`);
            missing.forEach(k => console.error(`    - ${k}`));
            hasErrors = true;
        } else {
            console.log(`  [OK] All baseline keys present.`);
        }

        if (extra.length > 0) {
            console.warn(`  [WARN] ${extra.length} Extra keys (not in en.ts):`);
            extra.forEach(k => console.warn(`    - ${k}`));
        }
    }

    if (hasErrors) {
        process.exit(1);
    } else {
        console.log(`\nVerification successful: All ${locales.length} locales are in sync with English baseline.`);
    }
}

run();
