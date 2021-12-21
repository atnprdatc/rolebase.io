import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  UseModalProps,
} from '@chakra-ui/react'
import CircleAndParentsButton from '@components/atoms/CircleAndParentsButton'
import { CircleEntry } from '@shared/circle'
import { useStoreState } from '@store/hooks'
import React, { useMemo } from 'react'

export default function VacantRolesModal(modalProps: UseModalProps) {
  const circles = useStoreState((state) => state.circles.entries)
  const roles = useStoreState((state) => state.roles.entries)

  // Filter roles
  const vacantCircles: CircleEntry[] = useMemo(() => {
    if (!circles || !roles) return []
    return (
      circles
        // Keep empty circles
        ?.filter(
          (c) =>
            c.members.length === 0 &&
            !circles.some((c2) => c2.parentId === c.id)
        )
    )
  }, [circles, roles])

  if (!vacantCircles?.length) return null

  return (
    <Modal {...modalProps}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rôles vacants</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={5}>
          <Stack>
            {!vacantCircles || vacantCircles.length === 0 ? (
              <>Aucun rôle vacant 🎉</>
            ) : (
              vacantCircles.map((circle) => (
                <CircleAndParentsButton key={circle.id} id={circle.id} />
              ))
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
