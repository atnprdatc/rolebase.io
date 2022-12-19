import { Box, FormControlOptions, Spinner } from '@chakra-ui/react'
import useCurrentMember from '@hooks/useCurrentMember'
import { usePreventClose } from '@hooks/usePreventClose'
import throttle from 'lodash.throttle'
import React, { forwardRef, useCallback, useMemo, useState } from 'react'
import Editor from '../editor2/Editor'
import useEditor, { EditorHandle } from './useEditor'
import useFileUpload from './useFileUpload'

// Collaborative Markdown editor

export interface Props extends FormControlOptions {
  docId: string
  value: string
  updates?: Uint8Array
  placeholder?: string
  autoFocus?: boolean
  readOnly?: boolean
  saveDelay: number
  onSave?(value: string, updates: Uint8Array): void
}

const CollabEditor = forwardRef<EditorHandle, Props>(
  (
    {
      docId,
      value,
      updates,
      placeholder,
      autoFocus,
      readOnly,
      saveDelay,
      onSave,
    },
    ref
  ) => {
    const currentMember = useCurrentMember()
    const { editorRef, getValue } = useEditor(ref)
    const { handleUpload } = useFileUpload()

    // On mount
    // useEffect(() => {
    //   if (updates) {
    //     // Apply saved updates
    //     collabPlugin.applyUpdates(updates)
    //   } else {
    //     // Compute and apply updates from value
    //     collabPlugin.applyValue(value)

    //     // Save updates
    //     onSave?.(getValue(), collabPlugin.getUpdates())
    //   }

    //   // Stop collab on unmount
    //   return () => collabPlugin.stop()
    // }, [collabPlugin])

    // // Update member name
    // useEffect(() => {
    //   if (!currentMember) return
    //   collabPlugin.setUserName(
    //     currentMember.name,
    //     randomColor({ string: currentMember.name })
    //   )
    // }, [currentMember?.name])

    // Prevent from changing page when dirty
    const [isDirty, setIsDirty] = useState(false)
    const { preventClose, allowClose } = usePreventClose()

    // Save now
    const handleSave = useCallback(() => {
      // onSave?.(getValue(), collabPlugin.getUpdates())
      setIsDirty(false)
      allowClose()
    }, [docId])

    // Save with throttling
    const handleSaveThrottle = useMemo(
      () => throttle(handleSave, saveDelay, { leading: false }),
      [handleSave, saveDelay]
    )

    // Handle every little change in the doc
    // to save it with throttling
    const handleChange = useCallback(() => {
      const newValue = getValue()
      if (newValue === value) return
      setIsDirty(true)
      preventClose()
      handleSaveThrottle()
    }, [docId, value])

    return (
      <>
        <Editor
          key={docId}
          id={docId}
          ref={editorRef}
          collaboration
          username={currentMember?.name}
          placeholder={placeholder}
          autoFocus={autoFocus}
          readOnly={readOnly}
          onBlur={handleSave}
          onSubmit={handleSave}
          onUpload={handleUpload}
        />

        {isDirty && (
          <Box textAlign="right">
            <Spinner
              size="xs"
              color="gray"
              position="absolute"
              mt="-18px"
              ml="-18px"
            />
          </Box>
        )}
      </>
    )
  }
)

CollabEditor.displayName = 'CollabEditor'

export default CollabEditor
