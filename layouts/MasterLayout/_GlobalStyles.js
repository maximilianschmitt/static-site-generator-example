/** @jsx jsx */
import { jsx, Global, css } from '@emotion/core'
import { fontSizes, colors, lineHeights, fontFamilies } from '../../design'

function GlobalStyles() {
    return (
        <Global
            styles={css`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-size: inherit;
                    -webkit-overflow-scrolling: touch;
                }

                html {
                    font-size: ${fontSizes.default};
                    line-height: ${lineHeights.default};
                }

                body {
                    font-family: ${fontFamilies.default};
                    -webkit-text-size-adjust: none;
                }

                a {
                    color: ${colors.textSecondary};
                }
            `}
        />
    )
}

export default GlobalStyles
