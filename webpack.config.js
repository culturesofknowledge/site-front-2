const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const STATIC_DIR = path.resolve(__dirname, "site_front_2/flaskapp/static/");
const JS_DIR = `${STATIC_DIR}/js`;
const BUILD_DIR = `${STATIC_DIR}/dist`;

config = {
    entry: {
        core: `${JS_DIR}/emfr/core/index.js`,
        browse: `${JS_DIR}/emfr/browse/index.js`,
        styles: [
            `${STATIC_DIR}/css/tailwind.css`,
        ]
    },
    output: {
        path: BUILD_DIR,
        filename: "[name].bundle.js",
        chunkFilename: "[name].[id].js",
        library: ["emfr", "[name]"],
        libraryTarget: "umd",
        publicPath: "",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-react"],
                        },
                    },
                ],
            },
            {
                test: /\.css$/,  // Regex to match CSS files
                use: [
                    MiniCssExtractPlugin.loader,
                    // 'style-loader',
                    'css-loader',
                    'sass-loader',
                    'postcss-loader',
                ]
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].bundle.css",
            chunkFilename: "[name].[id].css",
        }),
        new webpack.ProvidePlugin({
            // $: "jquery",
            // jQuery: "jquery",
        }),
    ],
}


module.exports = config;
