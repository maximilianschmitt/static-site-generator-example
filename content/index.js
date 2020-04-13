/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'
import MasterLayout from '../layouts/MasterLayout/MasterLayout'
import TextXXL from '../components/TextXXL'
import SlimContainer from '../components/SlimContainer'
import PostsList from '../components/PostsList'
import { fontSizes, breakpoints } from '../design'
import FancyLink from '../components/FancyLink'

export const data = {
    title: 'Static site generated page',
    standaloneTitle: true,
}

function Index() {
    return (
        <MasterLayout>
            <SlimContainer>
                <Section first>
                    <TextXXL as="h2">Welcome to my site</TextXXL>
                    <TextContent>
                        <p>
                            This repo demonstrates static site generation with
                            Webpack and MDX as described on{' '}
                            <FancyLink href="https://maximilianschmitt.me/posts/mdx-webpack-static-site-generator/">
                                maximilianschmitt.me
                            </FancyLink>
                            .
                        </p>
                    </TextContent>
                </Section>

                <Section>
                    <TextXXL as="h2">Latest posts</TextXXL>
                    <PostsList
                        limit={5}
                        css={css`
                            margin-top: 40px;
                        `}
                    />
                    <p
                        css={css`
                            margin-top: 50px;
                        `}
                    />
                    <FancyLink href="/posts">View all posts</FancyLink>
                </Section>
            </SlimContainer>
        </MasterLayout>
    )
}

export default Index

const Section = styled.div`
    margin-top: ${(props) => (props.first ? '20vh' : '150px')};
    font-size: ${fontSizes.l};

    @media ${breakpoints.s} {
        margin-top: ${(props) => (props.first ? '40px' : '100px')};
    }
`

const TextContent = styled.div`
    margin-top: 20px;

    > * + p {
        margin-top: 30px;
    }
`
