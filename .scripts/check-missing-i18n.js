
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../src/i18n/locales');
const SRC_DIR = join(__dirname, '../src');

// Reuse getDict from check-i18n.js
async function getDict(filename) {
    const filePath = join(LOCALES_DIR, filename);
    let content = readFileSync(filePath, 'utf-8');

    content = content.replace(/^import.*$/gm, '');
    content = content.replace(/: TranslationDict/g, '');
    const langMatch = filename.match(/^([a-z]+)\.ts/);
    const lang = langMatch ? langMatch[1] : filename.replace('.ts', '');
    content = content.replace(`export const ${lang} =`, `global.${lang} =`);

    const tempFile = join(tmpdir(), `check-missing-${lang}-${Date.now()}.js`);
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

function getAllSrcFiles(dir) {
    let results = [];
    const list = readdirSync(dir);
    
    list.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(getAllSrcFiles(filePath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(filePath);
        }
    });

    return results;
}

async function run() {
    let enDict;
    try {
        enDict = await getDict('en.ts');
    } catch (e) {
        console.error('Failed to parse en.ts:', e);
        process.exit(1);
    }

    const baselineKeys = new Set(getAllKeys(enDict));
    console.log(`Found ${baselineKeys.size} keys in en.ts`);

    const srcFiles = getAllSrcFiles(SRC_DIR);
    const filesToSearch = srcFiles.filter(f => !f.includes('i18n/locales/')); // Exclude locale files
    
    console.log(`Searching in ${filesToSearch.length} source files...`);

    const missing = new Set();
    const regex = /\bt\(['"]([^'"]+)['"]\)/g;

    filesToSearch.forEach(f => {
        const content = readFileSync(f, 'utf-8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1];
            if (!baselineKeys.has(key)) {
                missing.add(key);
                console.log(`[MISSING] found in ${f.split('/').pop()}: ${key}`);
            }
        }
    });

    if (missing.size > 0) {
        console.warn(`\n[WARN] Found ${missing.size} missing keys in en.ts:`);
        missing.forEach(k => console.log(`  - ${k}`));
        process.exit(1);
    } else {
        console.log('\n[OK] All t("key") usages exist in en.ts.');
    }
}

run();
