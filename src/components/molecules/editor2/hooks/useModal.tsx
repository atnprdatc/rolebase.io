/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useMemo, useState } from 'react'

import Modal from '../ui/Modal'

export default function useModal(): [
  React.ReactNode | null,
  (title: string, showModal: (onClose: () => void) => React.ReactNode) => void
] {
  const [modalContent, setModalContent] = useState<null | {
    closeOnClickOutside: boolean
    content: React.ReactNode
    title: string
  }>(null)

  const onClose = useCallback(() => {
    setModalContent(null)
  }, [])

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null
    }
    const { title, content, closeOnClickOutside } = modalContent
    return (
      <Modal
        onClose={onClose}
        title={title}
        closeOnClickOutside={closeOnClickOutside}
      >
        {content}
      </Modal>
    )
  }, [modalContent, onClose])

  const showModal = useCallback(
    (
      title: string,
      // eslint-disable-next-line no-shadow
      getContent: (onClose: () => void) => React.ReactNode,
      closeOnClickOutside = false
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      })
    },
    [onClose]
  )

  return [modal, showModal]
}
