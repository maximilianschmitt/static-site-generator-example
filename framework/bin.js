require('@babel/polyfill')

const fs = require('fs-extra')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const glob = require('fast-glob')
const path = require('path')
const liveServer = require('live-server')
const chokidar = require('chokidar')
const dayjs = require('dayjs')
const isEqual = require('fast-deep-equal')
const advancedFormat = require('dayjs/plugin/advancedFormat')
const escapeHTML = require('escape-html')
const MasterPage = require('./MasterPage')
const Webpack = require('./Webpack')
const argv = require('minimist')(process.argv.slice(2))
const SiteContext = require('./SiteContext')
const makeErrorComponent = require('./make-error-component')

dayjs.extend(advancedFormat)

process.on('unhandledRejection', (err) => {
    console.error(err.stack || err)
    process.exit(1)
})

const liveServerPort = 8080
const dateFormat = 'Do MMMM YYYY'
const defaultTitle = 'Blog title'
const meta = `
    <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16.png">
`
const serverRoot = '/'
const outDir = path.join(process.cwd(), 'dist')
const contentDir = path.join(process.cwd(), 'content')
const contentGlobs = [
    path.join(contentDir, '**/*.mdx'),
    path.join(contentDir, '**/*.js'),
]
const staticGlob = 'static/**/*'
const assetGlobs = [
    path.join(contentDir, '**/*.png'),
    path.join(contentDir, '**/*.jpg'),
    path.join(contentDir, '**/*.jpeg'),
    path.join(contentDir, '**/*.gif'),
    path.join(contentDir, '**/*.svg'),
]
const watch = !!argv.watch || !!argv.dev
const serve = !!argv.serve || !!argv.dev
const open = !!argv.open
const env = argv.env || 'development'
const contentFiles = glob.sync(contentGlobs)
const assetFiles = glob.sync([...assetGlobs, staticGlob])
const webpack = Webpack({ outDir, basePath: contentDir, contentFiles })
const envConfig = {
    production: {
        scripts: `
            <!-- Put something like Google analytics in here -->
        `,
    },
}

const masterPage = new MasterPage('framework/defaults/master-page.html')

function extendPageData(data) {
    return {
        ...data,
        ...(data.date && {
            formattedDate: dayjs(data.date).format(dateFormat),
        }),
    }
}

function getOutFile(file) {
    const basename = path.basename(file, path.extname(file))

    return path.join(
        outDir,
        path.relative(
            contentDir,
            path.dirname(path.resolve(process.cwd(), file))
        ),
        basename === 'index' ? 'index.html' : path.join(basename, 'index.html')
    )
}

function getOGImageOutFile(file) {
    const basename = path.basename(file, path.extname(file))

    return path.join(
        outDir,
        'og',
        path.relative(
            contentDir,
            path.dirname(path.resolve(process.cwd(), file))
        ),
        basename + '.png'
    )
}

function getOGImageHref(file) {
    const outFile = getOGImageOutFile(file)
    const href = serverRoot + path.relative(outDir, outFile)
    return href
}

function getAssetOutFile(file) {
    if (file.startsWith(contentDir)) {
        return path.join(
            outDir,
            path.relative(
                contentDir,
                path.dirname(path.resolve(process.cwd(), file))
            ),
            path.basename(file)
        )
    }

    return path.join(
        outDir,
        path.relative(
            process.cwd(),
            path.dirname(path.resolve(process.cwd(), file))
        ),
        path.basename(file)
    )
}

function getScriptSrc(file) {
    return serverRoot + path.relative(outDir, webpack.getScriptFile(file))
}

function getHref(file) {
    const outFile = getOutFile(file)

    const href = serverRoot + path.relative(outDir, path.dirname(outFile))

    return href
}

async function getContentPage(srcFile) {
    const compiledServerFile = require.resolve(
        webpack.getCompiledServerFile(srcFile)
    )

    if (watch) {
        delete require.cache[require.resolve(compiledServerFile)]
    }

    let Component, data
    try {
        const moduleExport = require(compiledServerFile)

        Component = moduleExport.default
        data = moduleExport.data
    } catch (err) {
        if (watch) {
            console.error(err.stack || err)

            Component = makeErrorComponent(err)
            data = {
                title: err.name || 'Error',
            }
        } else {
            throw err
        }
    }

    return {
        srcFile,
        outFile: getOutFile(srcFile),
        href: getHref(srcFile),
        Component,
        scriptSrc: getScriptSrc(srcFile),
        data: data || {},
    }
}

async function writeContentPage(page, { contentPages }) {
    try {
        const { Component } = page

        const siteContext = {
            contentPages,
            pageData: extendPageData(page.data),
            currentPath: page.href,
        }
        const componentHTML = ReactDOMServer.renderToString(
            React.createElement(
                SiteContext.Provider,
                { value: siteContext },
                React.createElement(Component, null)
            )
        )

        const pageTitle = page.data.standaloneTitle
            ? page.data.title
            : page.data.title
            ? [page.data.title, defaultTitle].join(' - ')
            : defaultTitle

        const html = masterPage.render({
            title: escapeHTML(pageTitle),
            renderOutput: componentHTML,
            scripts: `
                <script>window.__siteContext__ = ${JSON.stringify(
                    siteContext
                )}</script>
                <script src="${page.scriptSrc}"></script>
                ${(envConfig[env] && envConfig[env].scripts) || ''}
            `,
            styles: '',
            meta,
        })

        await fs.ensureFile(page.outFile)
        await fs.writeFile(page.outFile, html)

        console.log(`Wrote ${page.srcFile}`)
    } catch (err) {
        if (watch) {
            console.error(err.stack || err)
        } else {
            throw err
        }
    }
}

async function writeContentPages(contentPagesToWrite, { allContentPages }) {
    await Promise.all(
        contentPagesToWrite.map((page) => {
            return writeContentPage(page, {
                contentPages: allContentPages.map((page) => ({
                    href: page.href,
                    data: extendPageData(page.data),
                })),
            })
        })
    )
}

function startLiveServer() {
    liveServer.start({ root: outDir, open, port: liveServerPort })
}

async function copyAssets() {
    return Promise.all(assetFiles.map(copyAsset))
}

async function copyAsset(file) {
    const outFile = getAssetOutFile(file)

    await fs.ensureDir(path.dirname(outFile))
    await fs.copyFile(file, outFile)

    console.log(`Wrote ${file}`)
}

function watchAssets() {
    chokidar
        .watch([...assetGlobs, staticGlob])
        .on('add', copyAsset)
        .on('change', copyAsset)
}

async function main() {
    await fs.remove(outDir)

    if (watch) {
        watchAssets()

        let isInitialCompile = true
        const contentPages = []

        webpack.watch(async (err, { emittedAssets } = {}) => {
            if (err) {
                throw err
            }

            const serverAssets = emittedAssets.filter(
                (asset) => asset.isServerAsset
            )

            if (serverAssets.length > 0) {
                const wasInitialCompile = isInitialCompile
                isInitialCompile = false

                const changedContentPages = await Promise.all(
                    serverAssets
                        .flatMap((asset) => asset.chunkNames)
                        .map((chunkName) =>
                            webpack.getContentFileByServerChunkName(chunkName)
                        )
                        .map(getContentPage)
                )

                if (wasInitialCompile) {
                    contentPages.push(...changedContentPages)

                    await writeContentPages(contentPages, {
                        allContentPages: contentPages,
                    })
                } else {
                    // If any page data changed, we need to rerender all
                    // content pages because they might be relying on data from other pages
                    let didAnyPageDataChange = false

                    // Update content pages that changed
                    changedContentPages.forEach((changedContentPage) => {
                        const oldContentPageIndex = contentPages.findIndex(
                            (oldContentPage) =>
                                oldContentPage.srcFile ===
                                changedContentPage.srcFile
                        )

                        const oldContentPage = contentPages[oldContentPageIndex]

                        contentPages[oldContentPageIndex] = changedContentPage

                        didAnyPageDataChange =
                            didAnyPageDataChange ||
                            !isEqual(
                                oldContentPage.data,
                                changedContentPage.data
                            )
                    })

                    if (didAnyPageDataChange) {
                        // Write all content pages
                        await writeContentPages(contentPages, {
                            allContentPages: contentPages,
                        })
                    } else {
                        // Write content pages that changed
                        await writeContentPages(changedContentPages, {
                            allContentPages: contentPages,
                        })
                    }
                }

                if (wasInitialCompile && serve) {
                    startLiveServer()
                }
            }
        })
    } else {
        await webpack.run()

        const contentPages = await Promise.all(contentFiles.map(getContentPage))

        await Promise.all([
            writeContentPages(contentPages, { allContentPages: contentPages }),
            copyAssets(),
        ])

        if (serve) {
            startLiveServer()
        }
    }
}

main()
