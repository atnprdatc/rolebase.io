import ColorController from '@atoms/ColorController'
import DurationSelect from '@atoms/DurationSelect'
import Loading from '@atoms/Loading'
import TextError from '@atoms/TextError'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  StackItem,
  UseModalProps,
  VStack,
} from '@chakra-ui/react'
import { RoleFragment, useGetRoleQuery, useUpdateRoleMutation } from '@gql'
import { yupResolver } from '@hookform/resolvers/yup'
import useCreateLog from '@hooks/useCreateLog'
import { EditorHandle } from '@molecules/editor'
import EditorController from '@molecules/editor/EditorController'
import CircleSearchInput from '@molecules/search/entities/circles/CircleSearchInput'
import { getEntityChanges } from '@shared/helpers/log/getEntityChanges'
import { EntityChangeType, LogType } from '@shared/model/log'
import { RoleLink } from '@shared/model/role'
import { nameSchema } from '@shared/schemas'
import React, { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaPlus } from 'react-icons/fa'
import * as yup from 'yup'

interface Props extends UseModalProps {
  id?: string
  role?: RoleFragment
}

interface Values {
  name: string
  purpose: string
  domain: string
  accountabilities: string
  checklist: string
  indicators: string
  notes: string
  singleMember: boolean
  autoCreate: boolean
  link: string
  defaultMinPerWeek: number | null
  colorHue: number | null
}

const resolver = yupResolver(
  yup.object().shape({
    name: nameSchema.required(),
    defaultMinPerWeek: yup.number().nullable(),
  })
)

enum LinkType {
  parent = 'parent',
  other = 'other',
}
const tmpCircleId = 'tmpCircleId'

function getDefaultValues(role: RoleFragment): Values {
  return {
    name: role.name,
    purpose: role.purpose,
    domain: role.domain,
    accountabilities: role.accountabilities,
    checklist: role.checklist,
    indicators: role.indicators,
    notes: role.notes,
    defaultMinPerWeek: role.defaultMinPerWeek ?? null,
    singleMember: role.singleMember,
    autoCreate: role.autoCreate,
    link: role.link,
    colorHue: role.colorHue ?? null,
  }
}

export default function RoleEditModal({ id, role, ...modalProps }: Props) {
  const { t } = useTranslation()
  const [updateRole] = useUpdateRoleMutation()
  const createLog = useCreateLog()

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver,
    defaultValues: role && getDefaultValues(role),
  })

  // Get role if not provided
  const { data, loading, error } = useGetRoleQuery({
    skip: !id,
    variables: { id: id || '' },
  })
  const fetchedRole = data?.role_by_pk
  if (fetchedRole) {
    role = fetchedRole
  }
  useEffect(() => {
    if (!fetchedRole) return
    reset(fetchedRole && getDefaultValues(fetchedRole))
  }, [fetchedRole])

  // Register some fields
  const link = watch('link')
  useEffect(() => {
    register('link')
  }, [register])

  // Checklist and indicators items
  const checklistEditor = useRef<EditorHandle>(null)
  const indicatorsEditor = useRef<EditorHandle>(null)

  const onSubmit = handleSubmit(async (values) => {
    if (!role) return
    modalProps.onClose()

    // Update role data
    await updateRole({ variables: { id: role.id, values } })

    // Log change
    createLog({
      display: {
        type: LogType.RoleUpdate,
        id: role.id,
        name: role.name,
      },
      changes: {
        roles: [
          {
            type: EntityChangeType.Update,
            id: role.id,
            ...getEntityChanges(role, values),
          },
        ],
      },
    })
  })

  if (loading) return <Loading size="sm" active center />
  if (error) return <TextError error={error} />
  if (!role) return null

  return (
    <>
      <Modal {...modalProps} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('RoleEditModal.heading', { name: role.name })}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6}>
              {role.base ? (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertDescription>
                    {t('RoleEditModal.baseInfo')}
                  </AlertDescription>
                </Alert>
              ) : null}

              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t('RoleEditModal.name')}</FormLabel>
                <Input {...register('name')} autoFocus />
              </FormControl>

              <FormControl isInvalid={!!errors.purpose}>
                <FormLabel>{t('RoleEditModal.purpose')}</FormLabel>
                <EditorController
                  name="purpose"
                  placeholder={t('RoleEditModal.purposePlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.domain}>
                <FormLabel>{t('RoleEditModal.domain')}</FormLabel>
                <EditorController
                  name="domain"
                  placeholder={t('RoleEditModal.domainPlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.accountabilities}>
                <FormLabel>{t('RoleEditModal.accountabilities')}</FormLabel>
                <EditorController
                  name="accountabilities"
                  placeholder={t('RoleEditModal.accountabilitiesPlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.checklist}>
                <FormLabel>
                  {t('RoleEditModal.checklist')}
                  <IconButton
                    aria-label={t('common.add')}
                    icon={<FaPlus />}
                    size="xs"
                    ml={2}
                    onClick={() => checklistEditor.current?.addCheckboxList()}
                  />
                </FormLabel>
                <EditorController
                  ref={checklistEditor}
                  name="checklist"
                  placeholder={t('RoleEditModal.checklistPlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.indicators}>
                <FormLabel>
                  {t('RoleEditModal.indicator')}
                  <IconButton
                    aria-label={t('common.add')}
                    icon={<FaPlus />}
                    size="xs"
                    ml={2}
                    onClick={() => indicatorsEditor.current?.addBulletList()}
                  />
                </FormLabel>
                <EditorController
                  ref={indicatorsEditor}
                  name="indicators"
                  placeholder={t('RoleEditModal.indicatorPlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.notes}>
                <FormLabel>{t('RoleEditModal.notes')}</FormLabel>
                <EditorController
                  name="notes"
                  placeholder={t('RoleEditModal.notesPlaceholder')}
                  control={control}
                />
              </FormControl>

              <FormControl>
                <Stack spacing={1}>
                  <Checkbox {...register('singleMember')}>
                    {t('RoleEditModal.singleMember')}
                  </Checkbox>

                  {/* role.base && (
                    <Checkbox {...register('autoCreate')}>
                      {t('RoleEditModal.autoCreate')}
                    </Checkbox>
                  ) */}

                  <Checkbox
                    name="link"
                    isChecked={link !== RoleLink.No}
                    onChange={() =>
                      setValue(
                        'link',
                        link === RoleLink.No ? RoleLink.Parent : RoleLink.No
                      )
                    }
                  >
                    {t('RoleEditModal.linkParent')}
                  </Checkbox>
                  <RadioGroup
                    display={link !== RoleLink.No ? '' : 'none'}
                    value={
                      link === RoleLink.Parent
                        ? LinkType.parent
                        : LinkType.other
                    }
                    onChange={(value) =>
                      setValue(
                        'link',
                        value === LinkType.parent
                          ? RoleLink.Parent
                          : tmpCircleId
                      )
                    }
                  >
                    <Stack pl={6} mt={1} spacing={1} direction="column">
                      <Radio value={LinkType.parent}>
                        {t('RoleEditModal.linkToParent')}
                      </Radio>
                      <Radio value={LinkType.other} isDisabled={role.base}>
                        {t('RoleEditModal.linkToCircle')}
                      </Radio>
                      {typeof link === 'string' && (
                        <StackItem pl={6}>
                          <CircleSearchInput
                            value={link !== tmpCircleId ? link : undefined}
                            onChange={(value) => setValue('link', value)}
                          />
                        </StackItem>
                      )}
                    </Stack>
                  </RadioGroup>
                </Stack>
              </FormControl>

              <FormControl isInvalid={!!errors.defaultMinPerWeek}>
                <FormLabel>{t('RoleEditModal.defaultWorkingTime')}</FormLabel>
                <Controller
                  name="defaultMinPerWeek"
                  control={control}
                  render={({ field }) => (
                    <DurationSelect
                      value={field.value ?? null}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormHelperText>
                  {t('RoleEditModal.defaultWorkingTimeHelp')}
                </FormHelperText>
              </FormControl>

              <FormControl>
                <ColorController name="colorHue" control={control}>
                  {t('RoleEditModal.color')}
                </ColorController>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter alignItems="end">
            <Button colorScheme="blue" onClick={onSubmit}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
