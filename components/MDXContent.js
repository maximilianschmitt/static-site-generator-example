/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'
import { MDXProvider } from '@mdx-js/react'
import {
    lineHeights,
    colors,
    fontSizes,
    borderRadi,
    breakpoints,
    slimContainerPaddingX,
} from '../design'
import TextXXL from './TextXXL'

const extractTextFromChildren = (children) => {
    if (typeof children === 'string') {
        return children
    }

    if (children.props) {
        return extractTextFromChildren(children.props.children)
    }

    if (Array.isArray(children)) {
        return children.map(extractTextFromChildren).join('')
    }

    return ''
}
const slugFromChildren = (children) => {
    return extractTextFromChildren(children)
        .toLowerCase()
        .replace(/(\W+)/g, '-')
        .replace(/-$/, '')
        .replace(/^-/, '')
}

const PostDate = styled.small`
    display: block;
    color: ${colors.textSecondary};
    margin-bottom: 10px;
`

export const yBlockSpacingDefault = '24px'
export const yBlockSpacingL = '34px'
export const yBlockSpacingXl = '48px'
export const yPadding = '30px'
export const xOverlap = '45px'

function makeSubHeadingComponent(tag = 'h2') {
    return function SubHeading({ as = tag, children, ...props }) {
        const Component = as
        const slug = slugFromChildren(children)

        return (
            <Component id={slug} {...props}>
                {children}
            </Component>
        )
    }
}

const PostBody = styled.div`
    line-height: ${lineHeights.l};
    word-break: break-word;

    a {
        border-bottom: 2px solid ${colors.borderDefault};
        text-decoration: none;
        color: inherit;
        color: ${colors.textBlue};
        border-bottom: 2px solid ${colors.borderLightBlue};
    }

    p,
    blockquote {
        margin-top: ${yBlockSpacingDefault};
    }

    blockquote {
        padding-left: 2em;
        font-style: italic;
        color: ${colors.textSecondary};
    }

    pre {
        font-size: ${fontSizes.monospaceDefault};
    }

    code {
        font-size: 0.8em;
        padding: 5px;
        border-radius: ${borderRadi.s};
        background: ${colors.bgLight};
        border: 1px solid ${colors.borderDefault};
        color: inherit;
    }

    pre code {
        background: transparent;
        color: inherit;
        border: none;
        padding: 0;
    }

    a code {
        text-decoration: underline;
    }

    ol,
    ul {
        display: table;
        padding-left: 0;
        list-style: none;
        width: 100%;
        margin: ${yBlockSpacingL} 0;
    }

    li {
        display: table-row;
        width: 100%;

        ::before {
            display: table-cell;
            padding-right: 0.4em;
            padding-left: 2em;
            width: 20px;
        }

        ::after {
            content: '';
            display: block;
            font-size: 0;
            height: 5px;
        }

        :last-child::after {
            display: none;
        }

        @media ${breakpoints.s} {
            ::before {
                padding-left: 0;
            }

            & &::before {
                padding-left: 2em;
            }
        }
    }

    ul li {
        ::before {
            content: '-';
        }
    }

    ol li {
        counter-increment: table-ol;

        ::before {
            content: counter(table-ol) '.';
            text-align: right;
        }
    }

    li p {
        :first-child {
            margin: 0;
        }
    }

    li video {
        margin: 0;
        margin-top: 5px;
        width: 100%;
    }

    video {
        display: block;
        width: calc(100% + 2 * ${xOverlap});
        margin: ${yBlockSpacingL} -${xOverlap};

        @media ${breakpoints.s} {
            width: calc(100% + 2 * ${slimContainerPaddingX});
            margin: ${yBlockSpacingL} -${slimContainerPaddingX};
        }
    }

    hr {
        display: block;
        border: 0;
        border-top: 1px solid ${colors.borderDefault};
        background: transparent;
        margin: 24px 0;
    }

    pre {
        width: calc(100% + 2 * ${xOverlap});
        margin: ${yBlockSpacingDefault} -${xOverlap};
        padding: 15px ${xOverlap};
        border: 1px solid ${colors.borderDefault};
        border-radius: ${borderRadi.default};
        font-size: ${fontSizes.default};

        @media ${breakpoints.s} {
            border: 0;
            border-radius: 0;
            margin-left: -${slimContainerPaddingX};
            margin-right: -${slimContainerPaddingX};
            width: calc(100% + 2 * ${slimContainerPaddingX});
            padding: ${yPadding} ${slimContainerPaddingX};
        }
    }
`

const H2 = styled(makeSubHeadingComponent('h2'))`
    font-size: ${fontSizes.xl};
    font-weight: bold;
    line-height: ${lineHeights.s};
    margin-top: ${yBlockSpacingXl};
    margin-bottom: ${yBlockSpacingDefault};
`

const H3 = styled(makeSubHeadingComponent('h3'))`
    font-weight: bold;
    line-height: ${lineHeights.s};
    margin-top: ${yBlockSpacingXl};
    font-size: ${fontSizes.l};
`

const H4 = styled(makeSubHeadingComponent('h4'))`
    font-weight: bold;
    line-height: inherit;
    font-size: inherit;
    margin-top: ${yBlockSpacingXl};
`

const markdownComponents = {
    h2: H2,

    h3: H3,

    h4: H4,

    img: styled.img`
        width: calc(100% + 2 * ${xOverlap});
        margin: ${parseFloat(yBlockSpacingL) -
            parseFloat(yBlockSpacingDefault)}px -${xOverlap};
        padding: ${yPadding} ${xOverlap};
        border: 1px solid ${colors.borderDefault};
        border-radius: ${borderRadi.default};

        @media ${breakpoints.s} {
            border: 0;
            border-radius: 0;
            margin-left: -${slimContainerPaddingX};
            margin-right: -${slimContainerPaddingX};
            width: calc(100% + 2 * ${slimContainerPaddingX});
            padding: ${yPadding} ${slimContainerPaddingX};
        }
    `,
}

function MDXContent({ date, title, children }) {
    return (
        <div>
            {date && <PostDate>{date}</PostDate>}
            <TextXXL as="h1">{title}</TextXXL>

            <MDXProvider components={markdownComponents}>
                <PostBody
                    css={css`
                        padding-top: 10px;
                    `}
                >
                    {children}
                </PostBody>
            </MDXProvider>
        </div>
    )
}

export default MDXContent
