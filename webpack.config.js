const path=require("path");
//const DeclarationBundlerPlugin = require('types-webpack-bundler');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports={
    entry:{
        "chosen":path.resolve(__dirname,"src/index.tsx")
    },
    output:{
        path:path.resolve(__dirname,"dist"),
        chunkFilename: '[name].js',
        filename: '[name].js'
    },
    devtool:'source-map',
    resolve: { 
        extensions: [".ts",".tsx",".js",".jsx"],
        alias:{
            "react": "preact/compat",
            "react-dom": "preact/compat"
        } 
    },
    externals:{
        "react":"react",
        "react-dom":"react-dom"
    },
    plugins:[
        new CleanWebpackPlugin(),       
        /* new DeclarationBundlerPlugin({
            moduleName:'"intoy-chosen"',
            out:'./chosen.d.ts',
        })   */      
    ],
    //stats:"detailed",
    module:{
        rules: [
            {
                test: /\.(ts|tsx|js)$/,
                exclude: /(node_module|dist)/,
                use:[
                    {
                        loader: 'babel-loader',
                        options: {
                            presets:[
                                "@babel/preset-env",
                                "@babel/preset-react",
                            ],
                            cacheDirectory: true,
                        },
                    },
                    {
                        loader: 'ts-loader',
                    },
                    {
                        loader: '@stavalfi/babel-plugin-module-resolver-loader',
                        options: {
                            // all those options will go directly to babel-plugin-module-resolver plugin.
                            // Read babel-plugin-module-resolver DOCS to see all options:
                            // https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md
                            root: ['./src'],
                            extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
                        },
                    },
                ],
            }
        ]
    },
    optimization:{
        minimizer:[
            new TerserWebpackPlugin()
        ],
    }
};