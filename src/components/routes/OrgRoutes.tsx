import Loading from '@components/atoms/Loading'
import TextErrors from '@components/atoms/TextErrors'
import CirclesPage from '@components/pages/CirclesPage'
import DecisionPage from '@components/pages/DecisionPage '
import LogsPage from '@components/pages/LogsPage'
import MeetingPage from '@components/pages/MeetingPage'
import MeetingRecurringPage from '@components/pages/MeetingRecurringPage'
import MembersPage from '@components/pages/MembersPage'
import Page404 from '@components/pages/Page404'
import TaskPage from '@components/pages/TaskPage'
import TasksPage from '@components/pages/TasksPage'
import ThreadPage from '@components/pages/ThreadPage'
import ThreadsPage from '@components/pages/ThreadsPage'
import useOrg from '@hooks/useOrg'
import useSuperAdmin from '@hooks/useSuperAdmin'
import { MemberEntry } from '@shared/model/member'
import { useStoreActions, useStoreState } from '@store/hooks'
import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import {
  useSubscribeCirclesSubscription,
  useSubscribeMembersSubscription,
  useSubscribeRolesSubscription,
} from 'src/graphql.generated'
import { UserLocalStorageKeys } from 'src/utils/localStorage'

// Lazy pages
const MeetingsPage = lazy(() => import('@components/pages/MeetingsPage'))

interface Props {
  orgId: string
}

export default function OrgRoutes({ orgId }: Props) {
  const org = useOrg(orgId)
  const orgLoading = useStoreState(
    (state) => state.orgs.loading || !state.orgs.entries
  )

  const loading =
    useStoreState(
      (state) =>
        state.circles.loading || state.members.loading || state.roles.loading
    ) || orgLoading
  const circlesError = useStoreState((state) => state.circles.error)
  const membersError = useStoreState((state) => state.members.error)
  const rolesError = useStoreState((state) => state.roles.error)

  // Set current org id
  const setCurrentId = useStoreActions((actions) => actions.orgs.setCurrentId)
  useEffect(() => {
    setCurrentId(orgId)
  }, [orgId])

  const actions = useStoreActions((actions) => ({
    setCircles: actions.circles.setSubscriptionResult,
    setRoles: actions.roles.setSubscriptionResult,
    setMembers: actions.members.setSubscriptionResult,
  }))

  // Subscribe to circles
  const circlesResult = useSubscribeCirclesSubscription({
    variables: { orgId, archived: false },
  })
  useEffect(() => {
    actions.setCircles({
      entries: circlesResult.data?.circle,
      loading: circlesResult.loading,
      error: circlesResult.error,
    })
  }, [circlesResult])

  // Subscribe to roles
  const rolesResult = useSubscribeRolesSubscription({
    variables: { orgId, archived: false },
  })
  useEffect(() => {
    actions.setRoles({
      entries: rolesResult.data?.role,
      loading: rolesResult.loading,
      error: rolesResult.error,
    })
  }, [rolesResult])

  // Subscribe to members
  const membersResult = useSubscribeMembersSubscription({
    variables: { orgId, archived: false },
  })
  useEffect(() => {
    actions.setMembers({
      entries: membersResult.data?.member as MemberEntry[] | undefined,
      loading: membersResult.loading,
      error: membersResult.error,
    })
  }, [membersResult])

  // If org doesn't exist, redirect to root
  const navigate = useNavigate()
  const superAdmin = useSuperAdmin()
  useEffect(() => {
    if (!org && !orgLoading && !superAdmin) {
      localStorage.removeItem(UserLocalStorageKeys.OrgId)
      navigate('/')
    }
  }, [org, orgLoading])

  return (
    <Suspense fallback={<Loading active center />}>
      <Loading center active={loading} />
      <TextErrors errors={[membersError, rolesError, circlesError]} />

      <Routes>
        <Route index element={<CirclesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="threads/:threadId" element={<ThreadPage />} />
        <Route path="threads" element={<ThreadsPage />} />
        <Route path="meetings/:meetingId" element={<MeetingPage />} />
        <Route
          path="meetings-recurring/:id"
          element={<MeetingRecurringPage />}
        />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="tasks/:taskId" element={<TaskPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="decisions/:decisionId" element={<DecisionPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Suspense>
  )
}
