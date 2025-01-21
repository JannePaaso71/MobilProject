module.exports = {
    overrides: [
        {
            // Test files only
            files: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
            extends: ['plugin:testing-library/react'],
        },
    ],
};