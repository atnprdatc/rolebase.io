import ThreadPageContent from '@components/organisms/ThreadPageContent'
import useOverflowHidden from '@hooks/useOverflowHidden'
import React from 'react'
import { useParams } from 'react-router-dom'
import Page404 from './Page404'

interface Params {
  threadId: string
}

export default function ThreadPage() {
  useOverflowHidden()

  const threadId = useParams<Params>().threadId

  if (!threadId) {
    return <Page404 />
  }

  return <ThreadPageContent id={threadId} h="100vh" pt="60px" />
}
