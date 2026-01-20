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

    const tempFile = join(tmpdir(), `check-i18n-${lang}-${Date.now()}.js`);
    writeFileSync(tempFile, content);

    await import(pathToFileURL(tempFile).href);
    return global[lang];
}

// Recursive function to build synced object
function syncObject(source, target) {
    const out = {};
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            out[key] = syncObject(source[key], target ? target[key] : undefined);
        } else {
            // Leaf node
            if (target && target[key] !== undefined) {
                out[key] = target[key];
            } else {
                // Missing in target, use source (English)
                out[key] = source[key];
            }
        }
    }
    return out;
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

    console.log(`Loaded en.ts baseline.`);

    for (const localeFile of locales) {
        const lang = localeFile.replace('.ts', '');
        console.log(`Syncing ${lang}...`);

        let targetDict = {};
        try {
            targetDict = await getDict(localeFile);
        } catch (e) {
            console.warn(`Could not load ${localeFile}, treating as empty.`);
        }

        const synced = syncObject(enDict, targetDict);

        const newContent = `import type { TranslationDict } from '@/i18n/types';

export const ${lang}: TranslationDict = ${JSON.stringify(synced, null, 2)};
`;
        
        writeFileSync(join(LOCALES_DIR, localeFile), newContent);
        console.log(`  Updated ${localeFile}`);
    }
    console.log('All locales synced to English structure.');
}

run();
