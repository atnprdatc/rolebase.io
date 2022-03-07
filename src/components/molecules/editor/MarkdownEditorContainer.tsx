import styled from '@emotion/styled'
import { ColorModeProps, mode } from 'src/utils'

// Custom styles
const MarkdownEditorContainer = styled.div<ColorModeProps>`
  // Borders and background
  .ProseMirror {
    padding: var(--chakra-space-2) var(--chakra-space-4);
    border-width: 1px;
    border-radius: 6px;

    &.ProseMirror-focused {
      border-color: ${mode('#3182ce', '#63b3ed')};
      box-shadow: 0 0 0 1px ${mode('#3182ce', '#63b3ed')};
    }
  }
  &[aria-invalid='true'] .ProseMirror {
    border-color: ${mode('#e53e3e', '#FC8181')};
    box-shadow: 0 0 0 1px ${mode('#e53e3e', '#FC8181')};
  }

  .ProseMirror {
    .heading-actions {
      left: -20px;
      .heading-anchor {
        visibility: hidden;
      }
    }

    // "+" button
    .block-menu-trigger {
      color: ${mode('#4E5C6E', '#CBD5E0')};
      margin-left: -42px;
    }

    // Placeholder text
    .placeholder:before {
      color: ${mode('#a0aebf', '#4c4b4e')};
    }

    // Headings annotations
    h1:not(.placeholder):before,
    h2:not(.placeholder):before,
    h3:not(.placeholder):before,
    h4:not(.placeholder):before,
    h5:not(.placeholder):before,
    h6:not(.placeholder):before {
      visibility: hidden;
    }

    // List items handles
    ul li::before,
    ol li::before {
      left: -36px;
    }
    ul.checkbox_list li::before {
      left: 4px;
    }

    // Overlays zIndex
    .emoji-menu-container {
      z-index: 2000;
    }

    // Fix double bloquotes border
    blockquote:before {
      display: none;
    }
  }
`

export default MarkdownEditorContainer
