const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const clientEntryPointsDir = path.resolve(
    process.cwd(),
    './.build/client-entry-points'
)
const serverOutDir = path.resolve(process.cwd(), './.build/server-entry-points')
const contentFilesByServerChunkName = {}

function Webpack({ basePath, contentFiles, outDir }) {
    const clientOutDir = outDir

    const clientAssetsByChunkName = {}
    const serverAssetsByChunkName = {}

    function getScriptFile(file) {
        const chunkName = getChunkName(file)

        if (!clientAssetsByChunkName[chunkName]) {
            throw new Error('No asset')
        }

        return path.resolve(clientOutDir, clientAssetsByChunkName[chunkName])
    }

    function getChunkName(file) {
        file = path.resolve(process.cwd(), file)

        const dirname = path.relative(basePath, path.dirname(file))

        return path.join(dirname, path.basename(file, path.extname(file)))
    }

    function getCompiledServerFile(file) {
        return path.join(serverOutDir, getChunkName(file) + '.js')
    }

    function getClientEntryPointFile(file) {
        return path.join(clientEntryPointsDir, getChunkName(file) + '.js')
    }

    function getContentFileByServerChunkName(chunkName) {
        return contentFilesByServerChunkName[chunkName]
    }

    async function writeClientEntryPoint(file) {
        const outFile = getClientEntryPointFile(file)
        const content = `
            const SiteContext = require('${require.resolve('./SiteContext')}')
            const React = require('react')
            const ReactDOM = require('react-dom')
            const page = require('${file}')
            const Component = page.default || page
            ReactDOM.hydrate(
                <SiteContext.Provider value={window.__siteContext__}>
                    <Component />
                </SiteContext.Provider>,
                document.querySelector('#site-root')
            )
        `

        await fs.ensureDir(path.dirname(outFile))
        await fs.writeFile(outFile, content)
    }

    async function getWebpackConfig({ contentFiles, mode = 'development' }) {
        const loaderRules = [
            {
                test: /\.mdx?$/,
                use: ['babel-loader', '@mdx-js/loader']
            },
            {
                test: /\.js?$/,
                use: ['babel-loader']
            }
        ]

        const clientEntryPoints = contentFiles.reduce(
            (entries, contentFile) => {
                const chunkName = getChunkName(contentFile)

                entries[chunkName] = getClientEntryPointFile(contentFile)

                contentFilesByServerChunkName[chunkName] = contentFile

                return entries
            },
            {}
        )

        const serverEntryPoints = contentFiles.reduce(
            (entries, contentFile) => {
                entries[getChunkName(contentFile)] = contentFile

                return entries
            },
            {}
        )

        const clientConfig = {
            mode,
            entry: clientEntryPoints,
            output: {
                filename: '[name].js',
                path: clientOutDir
            },
            module: { rules: loaderRules }
        }

        const siteContextPath = require.resolve('./SiteContext')
        const serverConfig = {
            mode,
            target: 'node',
            externals: [
                nodeExternals(),

                function(context, request, cb) {
                    const absPath = require.resolve(
                        path.resolve(context, request)
                    )

                    if (absPath === siteContextPath) {
                        return cb(null, 'commonjs ' + siteContextPath)
                    }

                    cb()
                }
            ],
            entry: serverEntryPoints,
            output: {
                filename: '[name].js',
                path: serverOutDir,
                libraryTarget: 'commonjs'
            },
            module: { rules: loaderRules }
        }

        return [clientConfig, serverConfig]
    }

    async function prepare() {
        await fs.ensureDir(clientEntryPointsDir)
        await fs.ensureDir(serverOutDir)

        // Write client entry points
        for (const contentFile of contentFiles) {
            await writeClientEntryPoint(contentFile)
        }
    }

    function processStats(stats) {
        // TODO: Handle webpack errors properly, Google webpack error handling
        stats.stats.forEach(stats => {
            if (stats.compilation.errors.length > 0) {
                stats.compilation.errors.forEach(error => {
                    console.error(error)
                })

                process.exit(1)
            }
        })

        const statsJson = stats.toJson()

        statsJson.children.forEach(stat => {
            if (stat.outputPath === serverOutDir) {
                Object.assign(serverAssetsByChunkName, stat.assetsByChunkName)
            } else if (stat.outputPath === clientOutDir) {
                Object.assign(clientAssetsByChunkName, stat.assetsByChunkName)
            }
        })

        const emittedAssets = statsJson.children
            .map(stats =>
                stats.assets.map(asset => ({
                    ...asset,
                    isServerAsset: stats.outputPath === serverOutDir,
                    isClientAsset: stats.outputPath === clientOutDir
                }))
            )
            .flat()
            .filter(asset => asset.emitted)

        return { emittedAssets }
    }

    async function run() {
        await prepare()

        const config = await getWebpackConfig({
            contentFiles,
            mode: 'production'
        })

        return new Promise((resolve, reject) => {
            const compiler = webpack(config)

            compiler.run((err, stats) => {
                if (err) {
                    return reject(err)
                }

                const { emittedAssets } = processStats(stats)

                resolve({ emittedAssets })
            })
        })
    }

    async function watch(cb) {
        try {
            await prepare()

            const config = await getWebpackConfig({
                contentFiles,
                mode: 'development'
            })

            webpack(config).watch({}, (err, stats) => {
                if (err) {
                    return cb(err)
                }

                const { emittedAssets } = processStats(stats)

                cb(null, { emittedAssets })
            })
        } catch (err) {
            cb(err)
        }
    }

    return {
        run,
        watch,
        getScriptFile,
        getCompiledServerFile,
        getContentFileByServerChunkName
    }
}

module.exports = Webpack
