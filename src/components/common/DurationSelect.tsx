import { Flex, Input, Select } from '@chakra-ui/react'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'

interface Props {
  value: number | null
  placeholderValue?: number
  onChange(value: number | null): void
}

enum DurationUnits {
  Min = 1,
  Hours = 60,
}

const defaultUnit = DurationUnits.Hours
const pattern = /^\d*$/

function inferUnit(duration: number | null): DurationUnits {
  if (duration === null) return defaultUnit
  if (duration % DurationUnits.Hours == 0) return DurationUnits.Hours
  return DurationUnits.Min
}

function getValueInUnit(value: number | null, unit: DurationUnits) {
  return value === null ? null : Math.round(value / unit)
}

export default function DurationSelect({
  placeholderValue,
  value,
  onChange,
}: Props) {
  const [unit, setUnit] = useState(() =>
    inferUnit(value ?? placeholderValue ?? null)
  )

  const handleValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      if (!pattern.test(newValue)) return
      onChange(newValue === '' ? null : parseInt(newValue) * unit)
    },
    [unit]
  )

  const handleUnitChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setUnit((DurationUnits as any)[event.target.value])
    },
    []
  )

  // Round value when unit changes
  useEffect(() => {
    if (value !== null && value % unit !== 0) {
      onChange(Math.round(value / unit) * unit)
    }
  }, [value, unit])

  return (
    <Flex>
      <Input
        placeholder={
          placeholderValue !== undefined
            ? `${getValueInUnit(placeholderValue, unit)} (défaut)`
            : ''
        }
        value={getValueInUnit(value, unit) || ''}
        onChange={handleValueChange}
      />
      <Select value={DurationUnits[unit]} onChange={handleUnitChange}>
        <option value="Min">Min / semaine</option>
        <option value="Hours">Heures / semaine</option>
      </Select>
    </Flex>
  )
}
