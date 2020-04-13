/** @jsx jsx */
import React from 'react'
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'
import SiteContext from '../framework/SiteContext'
import { colors, borderRadi, fontSizes } from '../design'
import FancyLink from './FancyLink'

function PostsList({ limit = undefined, ...props }) {
    const { contentPages } = React.useContext(SiteContext)

    const posts = contentPages
        .filter(
            (contentPage) =>
                contentPage.href.startsWith('/posts') &&
                contentPage.href !== '/posts'
        )
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
        .slice(0, limit)

    if (posts.length === 0) {
        return null
    }

    return (
        <PostsListContainer {...props}>
            {posts.map((post) => (
                <PostItem key={post.href} post={post} />
            ))}
        </PostsListContainer>
    )
}

export default PostsList

const PostsListContainer = styled.div`
    > * + * {
        margin-top: 30px;
    }
`

const PostDate = styled.small`
    font-size: ${fontSizes.s};
    color: ${colors.textSecondary};
    display: block;
    padding-bottom: 7px;
`

function PostItem({ post }) {
    return (
        <div>
            <PostDate>{post.data.formattedDate}</PostDate>
            {/* post title should inherit font size */}
            <FancyLink href={post.href}>{post.data.title}</FancyLink>
        </div>
    )
}
