/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { Input } from '@chakra-ui/react'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
  PASTE_COMMAND,
} from 'lexical'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImagePayload,
} from '../../nodes/ImageNode'
import { validateImgUrl } from '../../utils/url'

export type InsertImagePayload = Readonly<ImagePayload>
export type UploadImagePayload = Readonly<
  Omit<ImagePayload, 'src'> & { file: File }
>

export const UPLOAD_IMAGE_COMMAND: LexicalCommand<UploadImagePayload> =
  createCommand('UPLOAD_IMAGE_COMMAND')
export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND')

export function useImagePicker(editor: LexicalEditor) {
  const loadImage = useCallback(
    async (files: FileList | null) => {
      if (files !== null) {
        editor.dispatchCommand(UPLOAD_IMAGE_COMMAND, {
          file: files[0],
        })
      }
    },
    [editor]
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const input = useMemo(() => {
    return (
      <Input
        type="file"
        ref={inputRef}
        display="none"
        accept="image/*"
        onChange={(e) => loadImage(e.target.files)}
      />
    )
  }, [])
  const openPicker = () => {
    inputRef.current?.click()
  }

  return [input, openPicker] as const
}

export default function ImagesPlugin({
  captionsEnabled,
  onUpload,
}: {
  captionsEnabled?: boolean
  onUpload: (file: File) => Promise<string>
}) {
  const [editor] = useLexicalComposerContext()

  const uploadImageFile = useCallback(
    async ({ file, ...payload }: UploadImagePayload) => {
      try {
        const src = await onUpload(file)
        if (src) {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, ...payload })
        }
      } catch (e) {
        console.error(e)
      }
    },
    [onUpload, editor]
  )

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<UploadImagePayload>(
        UPLOAD_IMAGE_COMMAND,
        (payload) => {
          uploadImageFile(payload)
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),
      // Drag'n drop existing images inside the document
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event)
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH
      ),
      // Paste image URL
      editor.registerCommand<ClipboardEvent>(
        PASTE_COMMAND,
        (event) => {
          const src = event.clipboardData?.getData('text')
          if (!src || !validateImgUrl(src)) {
            return false
          }
          const selection = $getSelection()
          if (selection?.getTextContent().length) {
            return editor.dispatchCommand(TOGGLE_LINK_COMMAND, src)
          }

          return editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src })
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [captionsEnabled, editor, uploadImageFile])

  return null
}

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const img = document.createElement('img')
img.src = TRANSPARENT_IMAGE

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  dataTransfer.setDragImage(img, 0, 0)
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    })
  )

  return true
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  const data = getDragImageData(event)
  if (!data) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data)
  }
  return true
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isImageNode(node) ? node : null
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag')
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== 'image') {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable')
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const domSelection = getSelection()
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error(`Cannot get the selection when dragging`)
  }

  return range
}
