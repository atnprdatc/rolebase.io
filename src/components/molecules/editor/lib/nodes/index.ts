/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Klass, LexicalNode } from 'lexical'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'

import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode'
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode'
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode'
import { EquationNode } from './EquationNode'
import { FigmaNode } from './FigmaNode'
import { FileNode } from './FileNode'
import { ImageNode } from './ImageNode'
import { KeywordNode } from './KeywordNode'
import { MentionNode } from './MentionNode'
import { TweetNode } from './TweetNode'
import { YouTubeNode } from './YouTubeNode'

const nodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  ImageNode,
  FileNode,
  MentionNode,
  EquationNode,
  KeywordNode,
  HorizontalRuleNode,
  TweetNode,
  YouTubeNode,
  FigmaNode,
  MarkNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
]

export default nodes
