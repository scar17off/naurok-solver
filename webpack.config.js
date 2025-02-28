const path = require("path");
const prependFile = require("prepend-file");

const userScriptHeader = `// ==UserScript==
// @name         Naurok Solver
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Solves Naurok questions
// @author       scar17off
// @match        https://naurok.com.ua/test/*
// @exclude      https://naurok.com.ua/test/complete/*
// @icon         https://naurok.com.ua/favicon.ico
// @grant        none
// ==/UserScript==

`;

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: "naurok-solver.user.js",
        path: path.resolve(__dirname),
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('PrependUserScriptHeader', compilation => {
                    prependFile(path.resolve(__dirname, "naurok-solver.user.js"), userScriptHeader, function (err) {
                        if (err) {
                            console.error("Failed to prepend UserScript header:", err);
                        }
                    });
                });
            }
        }
    ]
}