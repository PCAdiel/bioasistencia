import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.angular/**'] },
  { files: ['**/*.ts'], languageOptions: { parser: tseslint.parser }, rules: {} },
];
