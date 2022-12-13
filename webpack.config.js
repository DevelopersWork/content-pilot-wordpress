const path = require('path');
const webpack = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const VersionFile = require('webpack-version-file-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'build');

const GIT_FILE = path.join(BUILD_DIR, 'git.json');

module.exports = (env, argv) => {
	console.log(env, argv);

	const mode = argv.mode || 'development';

	return {
		context: SRC_DIR,
		mode: mode,
		devtool: mode === 'production' ? 'inline-source-map' : false,
		watch: mode === 'development',
		entry: path.join(SRC_DIR, 'index.js'),
		output: {
			path: BUILD_DIR,
			filename: 'bundle.js',
			clean: mode === 'production',
		},
		optimization: {
			minimize: true,
			nodeEnv: mode,
			chunkIds: mode === 'development' ? 'named' : 'deterministic',
			splitChunks: {
				chunks: 'async',
				minSize: 20000,
				minRemainingSize: 0,
				minChunks: 1,
				maxAsyncRequests: 30,
				maxInitialRequests: 30,
				enforceSizeThreshold: 50000,
				cacheGroups: {
					defaultVendors: {
						test: /[\\/]node_modules[\\/]/,
						priority: -10,
						reuseExistingChunk: true,
					},
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
					},
				},
			},
			minimizer: [
				new CssMinimizerPlugin(),
				new TerserPlugin({
					test: /\.js(\?.*)?$/i,
					extractComments: mode === 'production',
					parallel: true,
					terserOptions: {
						compress: mode === 'production',
						module: false,
					},
				}),
			],
		},
		module: {
			rules: [
				{
					test: /\.(jsx|js)$/,
					include: SRC_DIR,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react'],
							},
						},
					],
				},
				{
					test: /\.(sa|sc|c)ss$/,
					include: SRC_DIR,
					exclude: /node_modules/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						'sass-loader',
						'postcss-loader',
					],
				},
			],
		},
		plugins: [
			new ESLintPlugin({
				emitError: mode !== 'development',
			}),
			new MiniCssExtractPlugin({
				filename: 'css/[name].css',
				chunkFilename: 'css/[id].css',
			}),
			new webpack.ids.DeterministicChunkIdsPlugin(),
			new WebpackShellPluginNext({
				onBuildStart: {
					scripts: [
						`echo "{" > ${GIT_FILE}`,
						`echo "\\"branch\\": \\"$(git name-rev --name-only HEAD)\\"," >> ${GIT_FILE}`,
						`echo "\\"commits\\": \\"$(git rev-list HEAD --count)\\"," >> ${GIT_FILE}`,
						`echo "\\"hash\\": \\"$(git rev-parse HEAD)\\"" >> ${GIT_FILE}`,
						`echo "}" >> ${GIT_FILE}`,
					],
					blocking: true,
					parallel: false,
				},
				onBuildEnd: {
					scripts: [],
					blocking: true,
					parallel: false,
				},
			}),
			new VersionFile({
				packageFile: path.join(__dirname, 'package.json'),
				outputFile: path.join(BUILD_DIR, 'version.json'),
				data: {
					date: new Date(),
					environment: env,
				},
				extras: {
					timestamp: Date.now(),
				},
			}),
		],
		watchOptions: {
			aggregateTimeout: 500,
			poll: 1000, // Check for changes every second
			ignored: /node_modules/,
		},
	};
};
