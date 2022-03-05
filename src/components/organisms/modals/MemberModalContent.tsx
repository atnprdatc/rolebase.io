import {
  Alert,
  AlertIcon,
  AlertTitle,
  Avatar,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react'
import { Title } from '@components/atoms/Title'
import MemberRoles from '@components/molecules/MemberRoles'
import useMember from '@hooks/useMember'
import { useOrgRole } from '@hooks/useOrgRole'
import { ClaimRole } from '@shared/userClaims'
import { useStoreState } from '@store/hooks'
import React from 'react'
import { FiEdit3 } from 'react-icons/fi'
import MemberEditModal from './MemberEditModal'
import ModalCloseStaticButton from './ModalCloseStaticButton'

interface Props {
  id: string
  selectedCircleId?: string
  changeTitle?: boolean
  headerIcons?: React.ReactNode
}

export default function MemberModalContent({
  id,
  changeTitle,
  selectedCircleId,
  headerIcons,
}: Props) {
  const userId = useStoreState((state) => state.auth.user?.id)
  const member = useMember(id)
  const role = useOrgRole()
  const canEdit =
    role === ClaimRole.Admin || (userId ? member?.userId === userId : false)

  // Edit modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

  if (!member) {
    return (
      <>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Membre introuvable</AlertTitle>
        </Alert>
        <ModalCloseButton />
      </>
    )
  }

  return (
    <>
      {changeTitle && <Title>{member.name}</Title>}

      <ModalHeader pt={2} pr={3}>
        <Flex>
          <HStack mt={3} spacing={5}>
            <Avatar
              name={member.name}
              src={member.picture || undefined}
              size="md"
            />
            <Heading as="h2" size="md">
              {member.name}
            </Heading>
          </HStack>

          <Spacer />

          <Box>
            {canEdit && (
              <IconButton
                aria-label=""
                icon={<FiEdit3 />}
                variant="ghost"
                size="sm"
                onClick={onEditOpen}
              />
            )}

            {headerIcons}
            <ModalCloseStaticButton />
          </Box>
        </Flex>
      </ModalHeader>

      <ModalBody pb={5}>
        <FormControl>
          <FormLabel>Rôles</FormLabel>
          <MemberRoles memberId={id} selectedCircleId={selectedCircleId} />
        </FormControl>
      </ModalBody>

      {isEditOpen && <MemberEditModal id={id} isOpen onClose={onEditClose} />}
    </>
  )
}
