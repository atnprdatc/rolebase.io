import useDateLocale from '@hooks/useDateLocale'
import { format, setMonth } from 'date-fns'
import { useMemo } from 'react'
import { capitalizeFirstLetter } from 'src/utils/capitalizeFirstLetter'
import { range } from 'src/utils/range'

export default function useI18nMonths() {
  const dateLocale = useDateLocale()

  return useMemo(() => {
    const date = new Date()
    date.setDate(1)
    return range(0, 11).map((month) =>
      capitalizeFirstLetter(
        format(setMonth(date, month), 'MMMM', { locale: dateLocale })
      )
    )
  }, [])
}
