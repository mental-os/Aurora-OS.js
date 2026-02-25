/**
 * Converts validated JSON translation files back to TypeScript
 * This ensures the .ts files are always in sync with the JSON source
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');
const jsonLocalesDir = path.join(__dirname, '../src/i18n/locales-json');

/**
 * Unflatten dot-notation keys back into nested object
 */
function unflattenObject(flat: Record<string, string>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(flat)) {
		const parts = key.split('.');
		let current: Record<string, unknown> = result;

		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!current[part] || typeof current[part] !== 'object') {
				current[part] = {};
			}
			current = current[part] as Record<string, unknown>;
		}

		current[parts[parts.length - 1]] = value;
	}

	return result;
}

/**
 * Convert JSON to TypeScript format with proper imports
 */
function jsonToTsContent(locale: string, data: unknown): string {
	const code = JSON.stringify(data, null, '\t');

	return `import type { TranslationDict } from '../types';

export const ${locale}: TranslationDict = ${code};
`;
}

function writeFileIfChanged(filePath: string, content: string): 'written' | 'skipped' {
	if (fs.existsSync(filePath)) {
		const existing = fs.readFileSync(filePath, 'utf-8');
		if (existing === content) {
			return 'skipped';
		}
	}
	fs.writeFileSync(filePath, content);
	return 'written';
}

/**
 * Convert a JSON translation file to TS
 */
function convertJsonToTs(locale: string): boolean {
	const jsonFilePath = path.join(jsonLocalesDir, `${locale}.json`);
	const tsFilePath = path.join(localesDir, `${locale}.ts`);

	if (!fs.existsSync(jsonFilePath)) {
		console.warn(`⚠️  ${locale}.json not found`);
		return false;
	}

	try {
		const content = fs.readFileSync(jsonFilePath, 'utf-8');
		const flat = JSON.parse(content);
		const nested = unflattenObject(flat);
		const tsContent = jsonToTsContent(locale, nested);

		const result = writeFileIfChanged(tsFilePath, tsContent);
		if (result === 'written') {
			console.log(`✓ Generated ${locale}.ts`);
		} else {
			console.log(`• Unchanged ${locale}.ts (skipped)`);
		}
		return true;
	} catch (error) {
		console.error(`✗ Error converting ${locale}.json:`, error);
		return false;
	}
}

/**
 * Get all locale JSON files
 */
function getAvailableJsonLocales(): string[] {
	if (!fs.existsSync(jsonLocalesDir)) {
		return [];
	}

	const files = fs.readdirSync(jsonLocalesDir);
	return files
		.filter(f => f.endsWith('.json'))
		.map(f => f.replace('.json', ''));
}

function getChangedJsonLocales(): string[] {
	try {
		const out = execSync("git status --porcelain src/i18n/locales-json/*.json", { encoding: 'utf-8' });
		const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
		const files = lines.map(l => l.replace(/^..\s+/, ''));
		return files
			.map(f => path.basename(f))
			.filter(f => f.endsWith('.json'))
			.map(f => f.replace('.json', ''));
	} catch {
		return [];
	}
}

/**
 * Main conversion process
 */
function main() {
	console.log('🔄 Converting JSON translations to TypeScript...\n');

	const args = process.argv.slice(2);
	const flags = new Set(args.filter(a => a.startsWith('-')));
	const explicit = args.filter(a => !a.startsWith('-'));

	let locales: string[];
	if (flags.has('--changed')) {
		const changed = getChangedJsonLocales();
		locales = changed.length ? changed : getAvailableJsonLocales();
	} else if (explicit.length) {
		locales = explicit;
	} else {
		locales = getAvailableJsonLocales();
	}

	if (locales.length === 0) {
		console.log('ℹ️  No JSON translation files found.');
		return;
	}

	console.log(`Converting locales: ${locales.join(', ')}\n`);

	let success = 0;
	for (const locale of locales) {
		if (convertJsonToTs(locale)) {
			success++;
		}
	}

	console.log(`\n✅ Converted ${success}/${locales.length} translations successfully!`);
}

main();
