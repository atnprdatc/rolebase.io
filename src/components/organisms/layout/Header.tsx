import {
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import HeaderButton from '@components/atoms/HeaderButton'
import IconTextButton from '@components/atoms/IconTextButton'
import HeaderLinksMenu, {
  HeaderLink,
} from '@components/molecules/HeaderLinksMenu'
import HeaderOrgMenu from '@components/molecules/HeaderOrgMenu'
import HeaderUserMenu from '@components/molecules/HeaderUserMenu'
import Notifications from '@components/molecules/Notifications'
import SearchGlobal from '@components/molecules/search/SearchGlobal'
import useCurrentMember from '@hooks/useCurrentMember'
import useCurrentOrg from '@hooks/useCurrentOrg'
import { usePathInOrg } from '@hooks/usePathInOrg'
import { useAuthenticated } from '@nhost/react'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaQuestion, FaSearch } from 'react-icons/fa'
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckSquare,
  FiDisc,
  FiMessageSquare,
} from 'react-icons/fi'
import { cmdOrCtrlKey } from 'src/utils/env'

export const headerHeight = 50

// Force reset with fast refresh
// @refresh reset

export default function Header() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthenticated()
  const org = useCurrentOrg()
  const currentMember = useCurrentMember()

  // Links
  const rootPath = usePathInOrg('')
  const links: HeaderLink[] = useMemo(
    () =>
      org
        ? [
            {
              to: rootPath,
              exact: true,
              icon: <FiDisc />,
              label: t('Header.roles'),
            },
            {
              to: `${rootPath}threads`,
              icon: <FiMessageSquare />,
              label: t('Header.threads'),
            },
            {
              to: `${rootPath}meetings`,
              icon: <FiCalendar />,
              label: t('Header.meetings'),
              alert: !!currentMember?.meetingId,
            },
            {
              to: `${rootPath}tasks?member=${currentMember?.id}`,
              icon: <FiCheckSquare />,
              label: t('Header.tasks'),
            },
          ]
        : [],
    [org, currentMember, t]
  )

  // Open help chatbox
  const handleOpenHelp = () => {
    const $crisp = (window as any).$crisp
    if (!$crisp) {
      throw new Error('Crisp not found')
    }
    $crisp.push(['do', 'chat:show'])
    $crisp.push(['do', 'chat:toggle'])
  }

  // Hider buttons when screen is too small
  const [isSmallScreen] = useMediaQuery('(max-width: 730px)')

  // Search
  const searchModal = useDisclosure()

  // Use Cmd+K or Cmd+P keys to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'p' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        searchModal.onOpen()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!isAuthenticated) return null
  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      zIndex={1000}
      w="100%"
      h={`${headerHeight}px`}
      alignItems="center"
      px={1}
      pt="1px"
      borderBottom="1px solid"
      bg="gray.50"
      borderBottomColor="gray.300"
      _dark={{
        bg: 'gray.700',
        borderBottomColor: 'gray.550',
      }}
    >
      {org ? (
        <>
          <HeaderOrgMenu mr={2} />

          {!isSmallScreen &&
            links.map((link, i) => (
              <HeaderButton
                key={i}
                to={link.to}
                exact={link.exact}
                icon={link.icon}
                alert={link.alert}
              >
                {link.label}
              </HeaderButton>
            ))}

          <HeaderLinksMenu links={isSmallScreen ? links : undefined} />
        </>
      ) : window.location.pathname !== '/' ? (
        <HeaderButton to="/" exact icon={<FiArrowLeft />}>
          {t('Header.orgs')}
        </HeaderButton>
      ) : null}

      <Spacer />

      {org && (
        <IconTextButton
          aria-label={t('Header.search', {
            keys: `${cmdOrCtrlKey} + P`,
          })}
          icon={<FaSearch />}
          variant="ghost"
          size="sm"
          onClick={searchModal.onOpen}
        />
      )}

      <Modal
        isOpen={searchModal.isOpen}
        size="lg"
        onClose={searchModal.onClose}
      >
        <ModalOverlay />
        <ModalContent position="relative">
          <SearchGlobal onClose={searchModal.onClose} />
        </ModalContent>
      </Modal>

      <IconTextButton
        aria-label={t('Header.help')}
        icon={<FaQuestion />}
        variant="ghost"
        size="sm"
        onClick={handleOpenHelp}
      />

      <Notifications />

      <HeaderUserMenu ml={2} />
    </Flex>
  )
}
