import {
  subscribeMeetingsByDates,
  updateMeetingDates,
} from '@api/entities/meetings'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  ColorMode,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spacer,
  useColorMode,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import Loading from '@components/atoms/Loading'
import TextErrors from '@components/atoms/TextErrors'
import { Title } from '@components/atoms/Title'
import MeetingEditModal from '@components/organisms/modals/MeetingEditModal'
import MeetingExportModal from '@components/organisms/modals/MeetingExportModal'
import MeetingModal from '@components/organisms/modals/MeetingModal'
import {
  DateSelectArg,
  DatesSetArg,
  EventChangeArg,
  EventClickArg,
} from '@fullcalendar/common'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar, { EventInput } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import useCurrentMember from '@hooks/useCurrentMember'
import useEntitiesFilterMenu from '@hooks/useEntitiesFilterMenu'
import useFilterEntities from '@hooks/useFilterEntities'
import { useOrgId } from '@hooks/useOrgId'
import useSubscription from '@hooks/useSubscription'
import { enrichCircleWithRole } from '@shared/helpers/enrichCirclesWithRoles'
import { EntityFilters } from '@shared/model/types'
import { useStoreState } from '@store/hooks'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiPlus, FiUpload } from 'react-icons/fi'

const getColors = (mode: ColorMode) => ({
  bgNotStarted:
    mode === 'light'
      ? 'var(--chakra-colors-blue-100)'
      : 'var(--chakra-colors-blue-800)',
  bgStarted:
    mode === 'light'
      ? 'var(--chakra-colors-green-100)'
      : 'var(--chakra-colors-green-800)',
  bgEnded:
    mode === 'light'
      ? 'var(--chakra-colors-gray-100)'
      : 'var(--chakra-colors-gray-550)',
})

export default function MeetingsPage() {
  const { t } = useTranslation()
  const currentMember = useCurrentMember()
  const { colorMode } = useColorMode()
  const colors = useMemo(() => getColors(colorMode), [colorMode])
  const getCircleById = useStoreState((state) => state.circles.getById)
  const roles = useStoreState((state) => state.roles.entries)
  const [isSmallScreen] = useMediaQuery('(max-width: 700px)')

  // Circles filter menu
  const {
    filter,
    value: filterValue,
    handleChange: handleFilterChange,
  } = useEntitiesFilterMenu()

  // Dates range
  const [datesRange, setDatesRange] = useState<[Date, Date] | undefined>(
    undefined
  )

  // Subscribe to meetings
  const orgId = useOrgId()

  // Subscribe to meetings
  const { data, error, loading } = useSubscription(
    orgId && datesRange
      ? subscribeMeetingsByDates(orgId, datesRange[0], datesRange[1])
      : undefined
  )

  // Filter meetings
  const meetings = useFilterEntities(filter, data)

  // Prepare events for Fullcalendar
  const events = useMemo(
    () =>
      meetings?.map((meeting): EventInput => {
        let roleName = undefined

        // Add role name to title
        const circle = getCircleById(meeting.circleId)
        if (circle && roles) {
          const circleWithRole = enrichCircleWithRole(circle, roles)
          roleName = circleWithRole?.role.name
        }

        const title = `${roleName} - ${meeting.title}`

        // Can move event or change duration?
        const isNotStarted = !meeting.ended && meeting.currentStepId === null
        const canEditConfig = isNotStarted
        // TODO: Use participants like in MeetingContent
        // const canEditConfig = isNotStarted && (isParticipant || isInitiator)

        return {
          id: meeting.id,
          title,
          start: meeting.startDate.toDate(),
          end: meeting.endDate.toDate(),
          backgroundColor: meeting.ended
            ? colors.bgEnded
            : meeting.currentStepId !== null
            ? colors.bgStarted
            : colors.bgNotStarted,
          editable: canEditConfig,
        }
      }),
    [meetings, roles, colors]
  )

  const handleCreate = useCallback(() => {
    setStartDate(undefined)
    onCreateOpen()
  }, [])

  const handleCreated = useCallback((id: string) => {
    setMeetingId(id)
    onMeetingOpen()
  }, [])

  const handleOpenCurrentMeeting = useCallback(() => {
    if (!currentMember?.meetingId) return
    setMeetingId(currentMember?.meetingId)
    onMeetingOpen()
  }, [currentMember?.meetingId])

  const handleEventClick = useCallback(
    ({ event }: EventClickArg) => {
      const meeting = meetings?.find((m) => m.id === event.id)
      if (!meeting) return
      setMeetingId(meeting.id)
      onMeetingOpen()
    },
    [meetings]
  )

  const handleDateClick = useCallback(
    ({ date }: { date: Date }) => {
      setStartDate(date)
      onCreateOpen()
    },
    [meetings]
  )

  const handleSelect = useCallback(({ start, end }: DateSelectArg) => {
    setStartDate(start)
    setDuration(Math.round((end.getTime() - start.getTime()) / (1000 * 60)))
    onCreateOpen()
  }, [])

  const handleDatesChange = useCallback(
    ({ start, end }: DatesSetArg) => {
      setDatesRange([start, end])
    },
    [meetings]
  )

  const handleEventChange = useCallback(({ event }: EventChangeArg) => {
    if (!event.start || !event.end) return
    updateMeetingDates(event.id, event.start, event.end)
  }, [])

  // Meeting Modal
  const [meetingId, setMeetingId] = useState<string | undefined>()
  const {
    isOpen: isMeetingOpen,
    onOpen: onMeetingOpen,
    onClose: onMeetingClose,
  } = useDisclosure()

  // Create meeting Modal
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [duration, setDuration] = useState<number>(30)
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure()

  // Export Modal
  const {
    isOpen: isExportOpen,
    onOpen: onExportOpen,
    onClose: onExportClose,
  } = useDisclosure()

  return (
    <Flex h="100%" p={5} flexDirection="column">
      <Title>{t('pages.MeetingsPage.heading')}</Title>

      {loading && <Loading active center />}
      <TextErrors errors={[error]} />

      <Flex mb={1} alignItems="center" flexWrap="wrap">
        <Heading as="h1" size="md">
          {t('pages.MeetingsPage.heading')}
        </Heading>

        <Spacer />

        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            size="sm"
            variant="ghost"
            rightIcon={<FiChevronDown />}
          >
            {t('common.filters')}
          </MenuButton>
          <MenuList zIndex={2}>
            <MenuOptionGroup
              title={t('pages.MeetingsPage.participation.title')}
              type="checkbox"
              value={filterValue}
              onChange={handleFilterChange}
            >
              <MenuItemOption value={EntityFilters.Invited}>
                {t('pages.MeetingsPage.participation.invited')}
              </MenuItemOption>
              <MenuItemOption value={EntityFilters.NotInvited}>
                {t('pages.MeetingsPage.participation.notInvited')}
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>

        <Button size="sm" ml={1} leftIcon={<FiUpload />} onClick={onExportOpen}>
          {t('pages.MeetingsPage.export')}
        </Button>

        <Button
          size="sm"
          colorScheme="blue"
          ml={1}
          leftIcon={<FiPlus />}
          onClick={handleCreate}
        >
          {t('pages.MeetingsPage.create')}
        </Button>
      </Flex>

      {currentMember?.meetingId && (
        <Alert status="info" mt={2} mb={3} maxW={400}>
          <AlertIcon />
          <AlertTitle>{t('pages.MeetingsPage.current')}</AlertTitle>
          <Spacer />
          <Button ml={3} colorScheme="blue" onClick={handleOpenCurrentMeeting}>
            {t('pages.MeetingsPage.openCurrent')}
          </Button>
        </Alert>
      )}

      <Box flex={1}>
        <FullCalendar
          events={events}
          height="100%"
          locale="fr"
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          initialView={isSmallScreen ? 'listWeek' : 'timeGridWeek'}
          scrollTime="08:00:00"
          weekends={false}
          allDaySlot={false}
          nowIndicator
          editable
          selectable
          dateClick={handleDateClick}
          select={handleSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          datesSet={handleDatesChange}
        />
      </Box>

      {isMeetingOpen && meetingId && (
        <MeetingModal id={meetingId} isOpen onClose={onMeetingClose} />
      )}

      {isCreateOpen && (
        <MeetingEditModal
          defaultStartDate={startDate}
          defaultDuration={duration}
          isOpen
          onCreate={handleCreated}
          onClose={onCreateClose}
        />
      )}

      {isExportOpen && <MeetingExportModal isOpen onClose={onExportClose} />}
    </Flex>
  )
}
