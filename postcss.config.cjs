module.exports = {
    plugins: [
        require('@csstools/postcss-global-data')({
            files: ['./src/styles/custom-media.css'],
        }),
        require('postcss-custom-media')(),
        require('postcss-nesting')(),
        require('autoprefixer')(),
    ],
};