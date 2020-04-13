const fs = require('fs-extra')
const minify = require('html-minifier').minify

class MasterPage {
    constructor(filepath) {
        this.template = fs.readFileSync(filepath)

        this.render = opts => {
            const render = new Function(
                ...Object.keys(opts),
                `return \`${this.template}\``
            )

            const html = render(...Object.values(opts))

            return minify(html, { collapseWhitespace: true })
        }
    }
}

module.exports = MasterPage
