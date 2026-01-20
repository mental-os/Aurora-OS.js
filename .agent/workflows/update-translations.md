---
description: Update and synchronize the localizations (English as source)
---

Follow this workflow after adding or modifying UI components to ensure full internationalization and maintain translation file health.

1. **Extraction**: Identify all user-facing strings added or modified in the current session. Move them to `src/i18n/locales/en.ts` using logical keys.
2. **Implementation**: Replace hardcoded strings in code with the `t('key')` function from the `useI18n` hook.
3. **Audit Unused Keys**:
   // turbo
   - Run `node .scripts/check-unused-i18n.js` to identify and remove any keys in `en.ts` that are no longer referenced in the codebase. Keep `en.ts` lean.
4. **Missing Key Verification**:
   - **Crucial**: Ensure that every new `t('key')` usage in your components has a corresponding entry in `en.ts`. The `check-i18n.js` script only compares `en.ts` against other locales; it does _not_ check if the code uses keys missing from `en.ts`.
   - Manually verify or grep for your new keys in `en.ts` before proceeding.
5. **Consistency Check**:
   // turbo
   - Run `node .scripts/check-i18n.js` to identify missing keys in non-English locale files (`es.ts`, `fr.ts`, etc.) compared to `en.ts`.
6. **Localization Sync**:
   - Update all missing keys in the respective locale files. If a translation is not yet available, use the English value as a temporary fallback, but ensure the key exists to satisfy the synchronization check.
7. **Final Verification**: Ensure no lint errors or missing translation warnings appear in the console during runtime.
