/** @jsx jsx */
import React from 'react'
import { jsx, css } from '@emotion/core'
import { colors, fontSizes, breakpoints } from '../design'
import FancyLink from './FancyLink'
import styled from '@emotion/styled'

function PageFooter({ text, ...props }) {
    return (
        <footer>
            <nav
                css={css`
                    padding: 20px 40px;
                    background: ${colors.bgLight};
                    font-size: ${fontSizes.s};
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    text-align: center;

                    > * {
                        flex: 1;
                        text-align: center;
                    }

                    > *:first-child {
                        text-align: left;
                    }

                    > *:last-child {
                        text-align: right;
                    }

                    @media ${breakpoints.s} {
                        display: block;
                        padding: 20px 20px;

                        > *,
                        > *:first-child,
                        > *:last-child {
                            text-align: left;
                        }

                        > *:last-child {
                            margin-top: 5px;
                        }
                    }
                `}
                {...props}
            >
                <div />
                <div>
                    <NavItem>{text || 'This is the footer'}</NavItem>
                </div>
                <div>
                    <NavItem>
                        <FancyLink href="/some-page">Some page</FancyLink>
                    </NavItem>
                </div>
            </nav>
        </footer>
    )
}

export default PageFooter

const NavItem = styled.span`
    display: inline-block;

    & + & {
        padding-left: 20px;
    }

    @media ${breakpoints.s} {
        & + & {
            padding-left: 10px;
        }
    }
`
