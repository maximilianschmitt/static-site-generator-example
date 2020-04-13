/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import MasterLayout from '../../layouts/MasterLayout/MasterLayout'
import TextXXL from '../../components/TextXXL'
import SlimContainer from '../../components/SlimContainer'
import PostsList from '../../components/PostsList'
import { fontSizes } from '../../design'

export const data = {
    title: 'Posts',
}

function Index() {
    return (
        <MasterLayout>
            <SlimContainer
                css={css`
                    padding-top: 40px;
                    font-size: ${fontSizes.l};
                `}
            >
                <TextXXL as="h1">Posts</TextXXL>
                <PostsList
                    css={css`
                        margin-top: 40px;
                    `}
                />
            </SlimContainer>
        </MasterLayout>
    )
}

export default Index
