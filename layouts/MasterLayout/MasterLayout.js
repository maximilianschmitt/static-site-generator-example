/** @jsx jsx */
import React from 'react'
import styled from '@emotion/styled'
import { jsx, css } from '@emotion/core'
import {
    breakpoints,
    slimContainerPaddingX,
    fontSizes,
    colors,
    borderRadi,
} from '../../design'
import GlobalStyles from './_GlobalStyles'
import PageFooter from '../../components/PageFooter'
import SiteContext from '../../framework/SiteContext'

function MasterLayout({ children }) {
    const { currentPath } = React.useContext(SiteContext)

    return (
        <Container>
            <GlobalStyles />
            <Header>
                <HeaderTitle
                    css={css`
                        display: inline;
                        @media ${breakpoints.xs} {
                            display: none;
                        }
                    `}
                    href="/"
                >
                    Site title
                </HeaderTitle>
                <HeaderTitle
                    css={css`
                        display: none;
                        @media ${breakpoints.xs} {
                            display: inline;
                        }
                    `}
                    href="/"
                >
                    MS
                </HeaderTitle>
                <HeaderNav>
                    <HeaderLink active={currentPath === '/'} href="/">
                        Home
                    </HeaderLink>
                    <HeaderLink active={currentPath === '/posts'} href="/posts">
                        Posts
                    </HeaderLink>
                </HeaderNav>
            </Header>

            {children}

            <PageFooter
                css={css`
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    right: 0;
                `}
            />
        </Container>
    )
}

export default MasterLayout

const Container = styled.div`
    min-height: 100vh;
    padding-bottom: 200px;
    position: relative;
`

const Header = styled.header`
    padding: 30px 40px;
    display: flex;
    align-items: baseline;

    @media ${breakpoints.s} {
        padding: ${slimContainerPaddingX};
    }
`

const HeaderTitle = styled.a`
    font-weight: bold;
    font-size: ${fontSizes.l};
    text-decoration: none;
    color: inherit;
`

const HeaderNav = styled.nav`
    display: block;
    margin-left: auto;
    margin-right: -10px;

    > * + * {
        margin-left: 10px;
    }
`

const HeaderLink = styled.a`
    color: ${colors.textSecondary};
    text-decoration: none;
    display: inline-block;
    padding: 5px 10px;
    border-radius: ${borderRadi.default};

    ${(props) =>
        props.active &&
        css`
            background: ${colors.bgLight};
            color: ${colors.textDefault};
        `};
`
