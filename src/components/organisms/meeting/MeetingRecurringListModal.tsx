import CircleByIdButton from '@atoms/CircleByIdButton'
import Loading from '@atoms/Loading'
import TextErrors from '@atoms/TextErrors'
import {
  Box,
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  UseModalProps,
} from '@chakra-ui/react'
import {
  MeetingRecurringFragment,
  useMeetingRecurringsSubscription,
} from '@gql'
import { useOrgId } from '@hooks/useOrgId'
import ListItemWithButtons from '@molecules/ListItemWithButtons'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { RRule } from 'rrule'
import MeetingRecurringDeleteModal from './MeetingRecurringDeleteModal'
import MeetingRecurringEditModal from './MeetingRecurringEditModal'

interface Props extends UseModalProps {
  circleId?: string
}

export default function MeetingRecurringListModal({
  circleId,
  ...modalProps
}: Props) {
  const { t } = useTranslation()
  const orgId = useOrgId()

  // Subscribe to recurring meetings
  const { data, loading, error } = useMeetingRecurringsSubscription({
    skip: !orgId,
    variables: {
      where: circleId
        ? { circleId: { _eq: circleId } }
        : { orgId: { _eq: orgId } },
    },
  })

  // Group recurring meetings by circle
  const groupedByCircle = useMemo(
    () =>
      data?.meeting_recurring?.reduce((acc, mt) => {
        const circle = acc.find((c) => c.circleId === mt.circleId)
        if (circle) {
          circle.meetingsRecurring.push(mt)
        } else {
          acc.push({ circleId: mt.circleId, meetingsRecurring: [mt] })
        }
        return acc
      }, [] as { circleId: string; meetingsRecurring: MeetingRecurringFragment[] }[]),
    [data?.meeting_recurring]
  )

  // Create/Edit modal
  const [meetingRecurring, setMeetingRecurring] = useState<
    MeetingRecurringFragment | undefined
  >()
  const editModal = useDisclosure()

  // Delete modal
  const deleteModal = useDisclosure()

  const handleCreate = () => {
    setMeetingRecurring(undefined)
    editModal.onOpen()
  }

  const handleEdit = (mt: MeetingRecurringFragment) => {
    setMeetingRecurring(mt)
    editModal.onOpen()
  }

  const handleDelete = (mt: MeetingRecurringFragment) => {
    setMeetingRecurring(mt)
    deleteModal.onOpen()
  }

  return (
    <>
      <Modal blockScrollOnMount={false} {...modalProps}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('MeetingRecurringListModal.heading')}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {loading && <Loading active size="md" />}
            <TextErrors errors={[error]} />

            <Box textAlign="center" mb={7}>
              <Button leftIcon={<FiPlus />} onClick={handleCreate}>
                {t('MeetingRecurringListModal.create')}
              </Button>
            </Box>

            {!groupedByCircle?.length ? (
              <Text fontStyle="italic">
                {t('MeetingRecurringListModal.empty')}
              </Text>
            ) : (
              groupedByCircle?.map(({ circleId, meetingsRecurring }) => (
                <Box key={circleId} mb={5}>
                  <CircleByIdButton id={circleId} mb={2} />

                  {meetingsRecurring.map((mt) => (
                    <ListItemWithButtons
                      key={mt.id}
                      mb={2}
                      pl={6}
                      onClick={() => handleEdit(mt)}
                      buttons={
                        <IconButton
                          aria-label={t('common.delete')}
                          size="sm"
                          variant="ghost"
                          zIndex={2}
                          onClick={() => handleDelete(mt)}
                          icon={<FiTrash2 />}
                        />
                      }
                    >
                      <Text>{mt.template.title}</Text>
                      <Text
                        fontSize="sm"
                        color="gray.500"
                        _dark={{ color: 'gray.300' }}
                      >
                        {RRule.fromString(mt.rrule)
                          .toText()
                          .replace(' (~ approximate)', '')}
                      </Text>
                    </ListItemWithButtons>
                  ))}
                </Box>
              ))
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {editModal.isOpen && (
        <MeetingRecurringEditModal
          meetingRecurring={meetingRecurring}
          defaultCircleId={circleId}
          isOpen
          onClose={editModal.onClose}
        />
      )}

      {deleteModal.isOpen && meetingRecurring && (
        <MeetingRecurringDeleteModal
          meetingRecurring={meetingRecurring}
          isOpen
          onClose={deleteModal.onClose}
        />
      )}
    </>
  )
}
