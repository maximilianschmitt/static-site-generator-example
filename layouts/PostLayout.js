/** @jsx jsx */
import { useContext } from 'react'
import { jsx, css } from '@emotion/core'
import MasterLayout from './MasterLayout/MasterLayout'
import SlimContainer from '../components/SlimContainer'
import SiteContext from '../framework/SiteContext'
import MDXContent from '../components/MDXContent'

function PostLayout({ children }) {
    const siteContext = useContext(SiteContext)

    return (
        <MasterLayout>
            <SlimContainer
                css={css`
                    margin-top: 40px;
                `}
            >
                <MDXContent
                    date={siteContext.pageData.formattedDate}
                    title={siteContext.pageData.title}
                >
                    {children}
                </MDXContent>
            </SlimContainer>
        </MasterLayout>
    )
}

export default PostLayout
