const React = require('react')

function makeErrorComponent(err) {
    return function Error() {
        return React.createElement('pre', {}, err.stack || err)
    }
}

module.exports = makeErrorComponent
