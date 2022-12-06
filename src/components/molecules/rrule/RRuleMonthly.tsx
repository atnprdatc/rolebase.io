import {
  HStack,
  InputGroup,
  InputRightAddon,
  Radio,
  RadioGroup,
  Select,
} from '@chakra-ui/react'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { range } from 'src/utils'
import { FormRow } from './FormRow'
import { FormPartProps } from './RRuleEditor'
import useI18nDays from './useI18nDays'

enum Choices {
  monthday = 'monthday',
  weekday = 'weekday',
}

export default function RRuleMonthly({ options, onChange }: FormPartProps) {
  const { t } = useTranslation()
  const i18nDays = useI18nDays()

  // If dtstart is set, use it to determine the week day
  const forcedWeekday = useMemo(
    () => (options.dtstart ? options.dtstart.getDay() - 1 : undefined),
    [options.dtstart]
  )
  useEffect(() => {
    if (forcedWeekday === undefined) return
    onChange({ byweekday: [forcedWeekday] })
  }, [forcedWeekday, options.byweekday])

  return (
    <FormRow label={t('RRuleEditor.bymonthday')}>
      <RadioGroup
        value={
          options.bymonthday?.length
            ? Choices.monthday
            : options.byweekday?.length || options.bysetpos?.length
            ? Choices.weekday
            : undefined
        }
        onChange={(mode) => {
          if (mode === Choices.monthday) {
            onChange({ bymonthday: [1], bysetpos: [], byweekday: [] })
          } else {
            onChange({
              bymonthday: [],
              bysetpos: [1],
              byweekday: [0],
            })
          }
        }}
      >
        <HStack mb={1}>
          <Radio value={Choices.monthday} />
          <InputGroup>
            <Select
              value={options.bymonthday?.toString()}
              w="80px"
              onChange={(e) =>
                onChange({
                  bymonthday: [+e.target.value],
                  bysetpos: [],
                  byweekday: [],
                })
              }
            >
              {range(1, 31).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
            <InputRightAddon>
              {t('RRuleEditor.bymonthday-suffix')}
            </InputRightAddon>
          </InputGroup>
        </HStack>

        <HStack>
          <Radio value={Choices.weekday} />

          {options.dtstart ? (
            <InputGroup>
              <SelectBysetpos options={options} onChange={onChange} />
              <InputRightAddon>{i18nDays[forcedWeekday ?? 0]}</InputRightAddon>
            </InputGroup>
          ) : (
            <>
              <SelectBysetpos options={options} onChange={onChange} />
              <Select
                value={options.byweekday?.[0]}
                onChange={(e) =>
                  onChange({
                    bymonthday: [],
                    bysetpos: options.bysetpos || [1],
                    byweekday: [+e.target.value],
                  })
                }
              >
                {i18nDays.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </Select>
            </>
          )}
        </HStack>
      </RadioGroup>
    </FormRow>
  )
}

function SelectBysetpos({ options, onChange }: FormPartProps) {
  const { t } = useTranslation()
  return (
    <Select
      value={options.bysetpos?.[0]}
      onChange={(e) =>
        onChange({
          bymonthday: [],
          bysetpos: [+e.target.value],
          byweekday: options.byweekday || [0],
        })
      }
    >
      {[1, 2, 3, 4, -1].map((pos) => (
        <option key={pos} value={pos}>
          {t(`RRuleEditor.bysetpos.${pos}` as any)}
        </option>
      ))}
    </Select>
  )
}
