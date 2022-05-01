import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Spacer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import CircleButton from '@components/atoms/CircleButton'
import { CirclePanelTab } from '@components/atoms/CirclePanelTab'
import Markdown from '@components/atoms/Markdown'
import ParticipantsNumber from '@components/atoms/ParticipantsNumber'
import { Title } from '@components/atoms/Title'
import ActionsMenu from '@components/molecules/ActionsMenu'
import CircleAndParents from '@components/molecules/CircleAndParentsLinks'
import CircleMemberFormControl from '@components/molecules/CircleMemberFormControl'
import MeetingsInCircleList from '@components/molecules/MeetingsInCircleList'
import SubCirclesFormControl from '@components/molecules/SubCirclesFormControl'
import TasksInCircleList from '@components/molecules/TasksInCircleList'
import ThreadsInCircleList from '@components/molecules/ThreadsInCircleList'
import useCircle from '@hooks/useCircle'
import useParticipants from '@hooks/useParticipants'
import { MembersScope } from '@shared/member'
import React from 'react'
import {
  FiCalendar,
  FiCheckSquare,
  FiChevronDown,
  FiChevronUp,
  FiDisc,
  FiMessageSquare,
} from 'react-icons/fi'
import CircleDeleteModal from './CircleDeleteModal'
import ModalCloseStaticButton from './ModalCloseStaticButton'
import RoleEditModal from './RoleEditModal'

interface Props {
  id: string
  changeTitle?: boolean
  headerIcons?: React.ReactNode
}

enum TabTypes {
  Circle,
  Threads,
  Meetings,
  Tasks,
}

export default function CircleModalContent({
  id,
  changeTitle,
  headerIcons,
}: Props) {
  const circle = useCircle(id)
  const role = circle?.role
  const { colorMode } = useColorMode()

  // Parent circles and linked circle
  const parentCircle = useCircle(circle?.parentId || undefined)
  const linkedCircle = useCircle(
    (role?.link === true ? parentCircle?.parentId : role?.link) || undefined
  )

  // Participants
  const participants = useParticipants(
    id,
    MembersScope.CircleLeaders,
    circle?.members.map((member) => member.id)
  )

  // Tabs
  const [tab, setTab] = React.useState<TabTypes>(0)

  // Role info toggle
  const { isOpen: isRoleInfoOpen, onToggle: onRoleInfoToggle } = useDisclosure()

  // Role edit modal
  const {
    isOpen: isEditRoleOpen,
    onOpen: onEditRoleOpen,
    onClose: onEditRoleClose,
  } = useDisclosure()

  // Delete modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  if (!role) {
    return (
      <>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Rôle introuvable</AlertTitle>
        </Alert>
        <ModalCloseButton />
      </>
    )
  }

  return (
    <>
      {changeTitle && <Title>{role.name}</Title>}

      <ModalHeader pt={2} pb={1} pr={3}>
        <Flex>
          <CircleAndParents id={id} />
          <Spacer />

          <Box>
            <ParticipantsNumber participants={participants} />
          </Box>

          <ActionsMenu onEdit={onEditRoleOpen} onDelete={onDeleteOpen} />

          {headerIcons}
          <ModalCloseStaticButton />
        </Flex>
      </ModalHeader>

      <ModalBody pt={0} pb={5}>
        <Tabs isLazy variant="unstyled" index={tab} onChange={setTab}>
          <TabList
            mx="-1.5rem"
            px="1.5rem"
            borderTop="1px solid"
            borderBottom="1px solid"
            borderTopColor={colorMode === 'light' ? 'gray.200' : 'gray.550'}
            borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.550'}
            overflow="auto"
          >
            <CirclePanelTab icon={<FiDisc />}>
              {role.singleMember ? 'Rôle' : 'Cercle'}
            </CirclePanelTab>
            <CirclePanelTab icon={<FiMessageSquare />}>
              Discussions
            </CirclePanelTab>
            <CirclePanelTab icon={<FiCalendar />}>Réunions</CirclePanelTab>
            <CirclePanelTab icon={<FiCheckSquare />}>Tâches</CirclePanelTab>
          </TabList>

          <TabPanels mt={5}>
            <TabPanel p={0}>
              <VStack spacing={5} align="stretch">
                {role.purpose && (
                  <FormControl>
                    <FormLabel>Raison d'être :</FormLabel>
                    <Markdown>{role.purpose}</Markdown>
                  </FormControl>
                )}

                {(role.domain ||
                  role.accountabilities ||
                  role.checklist ||
                  role.indicators ||
                  role.notes) && (
                  <>
                    <Button
                      variant="link"
                      rightIcon={
                        isRoleInfoOpen ? <FiChevronUp /> : <FiChevronDown />
                      }
                      onClick={onRoleInfoToggle}
                    >
                      {isRoleInfoOpen ? 'Voir moins' : 'Voir plus'}
                    </Button>
                    <Collapse in={isRoleInfoOpen} animateOpacity>
                      <VStack spacing={5} align="stretch">
                        {role.domain && (
                          <FormControl>
                            <FormLabel>Domaine :</FormLabel>
                            <Markdown>{role.domain}</Markdown>
                          </FormControl>
                        )}

                        {role.accountabilities && (
                          <FormControl>
                            <FormLabel>Redevabilités :</FormLabel>
                            <Markdown>{role.accountabilities}</Markdown>
                          </FormControl>
                        )}

                        {role.checklist && (
                          <FormControl>
                            <FormLabel>Checklist :</FormLabel>
                            <Markdown>{role.checklist}</Markdown>
                          </FormControl>
                        )}

                        {role.indicators && (
                          <FormControl>
                            <FormLabel>Indicateurs :</FormLabel>
                            <Markdown>{role.indicators}</Markdown>
                          </FormControl>
                        )}

                        {role.notes && (
                          <FormControl>
                            <FormLabel>Notes :</FormLabel>
                            <Markdown>{role.notes}</Markdown>
                          </FormControl>
                        )}
                      </VStack>
                    </Collapse>
                  </>
                )}

                {!role.singleMember ? (
                  <SubCirclesFormControl
                    circleId={id}
                    participants={participants}
                  />
                ) : null}

                <CircleMemberFormControl circleId={id} />

                {parentCircle && linkedCircle && (
                  <Text>
                    Représente le Cercle <CircleButton circle={parentCircle} />
                    <br />
                    dans le Cercle <CircleButton circle={linkedCircle} />
                  </Text>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0}>
              <ThreadsInCircleList circleId={id} />
            </TabPanel>

            <TabPanel p={0}>
              <MeetingsInCircleList circleId={id} />
            </TabPanel>

            <TabPanel p={0}>
              <TasksInCircleList circleId={id} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>

      {isEditRoleOpen && circle && (
        <RoleEditModal id={circle.roleId} isOpen onClose={onEditRoleClose} />
      )}

      {isDeleteOpen && (
        <CircleDeleteModal id={id} isOpen onClose={onDeleteClose} />
      )}
    </>
  )
}
