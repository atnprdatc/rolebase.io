import { subscribeLogsByMeeting } from '@api/entities/logs'
import { Heading } from '@chakra-ui/react'
import Loading from '@components/atoms/Loading'
import TextErrors from '@components/atoms/TextErrors'
import { useOrgId } from '@hooks/useOrgId'
import useSubscription from '@hooks/useSubscription'
import React from 'react'
import { useTranslation } from 'react-i18next'
import LogsList from './LogsList'

interface Props {
  meetingId: string
}

export default function MeetingLogs({ meetingId }: Props) {
  const { t } = useTranslation()
  const orgId = useOrgId()

  const subscribeLogs = orgId
    ? subscribeLogsByMeeting(orgId, meetingId)
    : undefined

  const { data, loading, error } = useSubscription(subscribeLogs)

  return (
    <>
      <Heading as="h3" size="sm" mb={2}>
        {t('molecules.MeetingLogs.heading')}
      </Heading>

      {loading && <Loading active size="md" />}
      <TextErrors errors={[error]} />

      {data && <LogsList logs={data} />}
    </>
  )
}
