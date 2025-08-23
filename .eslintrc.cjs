module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    plugins: ['react', 'react-hooks', 'prettier', '@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended', // ← работает с parser 5.62
        'plugin:prettier/recommended',
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off', // Т.к. переходим на TS-типы

        // Запрещаем использовать React.FC
        'no-restricted-syntax': [
            'error',
            {
                selector: 'TSTypeReference[typeName.name=\'FC\']',
                message: 'Используй React.FC только для «чистых» обёрток-children',
            },
        ],

        // Требуем явно объявлять children, если он есть
        '@typescript-eslint/explicit-module-boundary-types': [
            'off',
            { allowArgumentsExplicitlyTypedAsAny: true },
        ],
    },
    settings: { react: { version: 'detect' } },
};
