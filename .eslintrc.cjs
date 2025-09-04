module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    plugins: ['react', 'react-hooks', 'prettier', '@typescript-eslint', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: 'TSTypeReference[typeName.name=/^FC$/]',
                message: 'Используй React.FC только для «чистых» обёрток-children',
            },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
        react: { version: 'detect' },
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
                alwaysTryTypes: true,
            },
            node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        },
    },
};
