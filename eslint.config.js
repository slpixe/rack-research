import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Pipeline (scrapers, scripts, src)
  {
    files: ['pipeline/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './pipeline/tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  // Website (Next.js)
  {
    files: ['website/**/*.ts', 'website/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './website/tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'data/', 'resources/', 'drizzle/', '.next/', 'out/'],
  },
];
