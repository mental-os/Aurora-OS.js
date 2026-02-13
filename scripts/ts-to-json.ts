/**
 * Converts TypeScript translation files to JSON format
 * This allows translators to work with JSON while keeping TypeScript as the source of truth
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');
const jsonLocalesDir = path.join(__dirname, '../src/i18n/locales-json');

interface TranslationValue {
	[key: string]: string | TranslationValue;
}

// Ensure JSON directory exists
if (!fs.existsSync(jsonLocalesDir)) {
	fs.mkdirSync(jsonLocalesDir, { recursive: true });
}

/**
 * Flatten a nested object into dot-notation keys
 */
function flattenObject(obj: TranslationValue, prefix = ''): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			result[newKey] = value;
		} else if (typeof value === 'object' && value !== null) {
			Object.assign(result, flattenObject(value, newKey));
		}
	}

	return result;
}

/**
 * Convert a TS translation file to JSON
 */
async function convertTsToJson(locale: string) {
	const tsFilePath = path.join(localesDir, `${locale}.ts`);
	const jsonFilePath = path.join(jsonLocalesDir, `${locale}.json`);

	if (!fs.existsSync(tsFilePath)) {
		console.warn(`⚠️  ${locale}.ts not found`);
		return;
	}

	try {
		// Dynamically import the TypeScript file
		const module = await import(tsFilePath);
		const translation = module[locale] as TranslationValue;

		if (!translation) {
			console.warn(`⚠️  No export named '${locale}' in ${locale}.ts`);
			return;
		}

		// Flatten the nested object
		const flattened = flattenObject(translation);

		const newContent = JSON.stringify(flattened, null, 2) + '\n';
		let action: 'written' | 'skipped' = 'written';
		if (fs.existsSync(jsonFilePath)) {
			const existing = fs.readFileSync(jsonFilePath, 'utf-8');
			if (existing === newContent) {
				action = 'skipped';
			} else {
				fs.writeFileSync(jsonFilePath, newContent);
			}
		} else {
			fs.writeFileSync(jsonFilePath, newContent);
		}
		if (action === 'written') {
			console.log(`✓ Generated ${locale}.json`);
		} else {
			console.log(`• Unchanged ${locale}.json (skipped)`);
		}
	} catch (error) {
		console.error(`✗ Error converting ${locale}.ts:`, error);
	}
}

/**
 * Get all locale files
 */
function getAvailableLocales(): string[] {
	const files = fs.readdirSync(localesDir);
	return files
		.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== 'types.ts' && f !== 'index.ts')
		.map(f => f.replace('.ts', ''));
}

function getChangedTsLocales(): string[] {
	try {
		const out = execSync("git status --porcelain src/i18n/locales/*.ts", { encoding: 'utf-8' });
		const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
		const files = lines.map(l => l.replace(/^..\s+/, ''));
		return files
			.map(f => path.basename(f))
			.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== 'types.ts' && f !== 'index.ts')
			.map(f => f.replace('.ts', ''));
	} catch {
		return [];
	}
}

/**
 * Main conversion process
 */
async function main() {
	console.log('🌍 Converting TypeScript translations to JSON...\n');

	const args = process.argv.slice(2);
	const flags = new Set(args.filter(a => a.startsWith('-')));
	const explicit = args.filter(a => !a.startsWith('-'));

	let locales: string[];
	if (flags.has('--changed')) {
		const changed = getChangedTsLocales();
		locales = changed.length ? changed : getAvailableLocales();
	} else if (explicit.length) {
		locales = explicit;
	} else {
		locales = getAvailableLocales();
	}

	console.log(`Found locales: ${locales.join(', ')}\n`);

	for (const locale of locales) {
		await convertTsToJson(locale);
	}

	console.log('\n✅ Translation conversion complete!');
}

main().catch(console.error);
