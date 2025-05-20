import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

const topConfig = compat.config({
    extends: ['next/core-web-vitals'],
    rules: {
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
    },
});

const bottomConfig = compat.config({
    extends: ['next'],
    rules: {
        'react/no-unescaped-entities': 'off',
        '@next/next/no-page-custom-font': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
    },
});

const eslintConfig = [
    ...topConfig,
    ...bottomConfig,
];

export default eslintConfig;

