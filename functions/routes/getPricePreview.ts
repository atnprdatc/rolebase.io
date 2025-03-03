import { Member_Role_Enum } from '@gql'
import { PricePreview } from '@shared/model/subscription'
import { addressSchema, subscriptionPlanTypeSchema } from '@shared/schemas'
import { getOrgSubscriptionAndActiveMembers } from '@utils/getOrgSubscriptionAndActiveMembers'
import { getPlanTypePriceId } from '@utils/getPlanTypePriceId'
import { guardAuth } from '@utils/guardAuth'
import { guardBodyParams } from '@utils/guardBodyParams'
import { guardOrg } from '@utils/guardOrg'
import { route, RouteError } from '@utils/route'
import { getPricePreview } from '@utils/stripe'
import * as yup from 'yup'

const yupSchema = yup.object().shape({
  orgId: yup.string().required(),
  promotionCode: yup.string().nullable(),
  address: addressSchema,
  planType: subscriptionPlanTypeSchema,
})

export default route(async (context): Promise<PricePreview> => {
  guardAuth(context)
  const { orgId, promotionCode, address, planType } = guardBodyParams(
    context,
    yupSchema
  )

  if (!orgId) {
    throw new RouteError(400, 'Invalid request')
  }

  await guardOrg(orgId, Member_Role_Enum.Owner, context)

  const { activeMembers } = await getOrgSubscriptionAndActiveMembers(orgId)

  // TODO: retrieve priceId and quantity
  const { coupon, price } = await getPricePreview(
    getPlanTypePriceId(planType),
    activeMembers,
    address,
    promotionCode
  )

  return {
    subTotalPerSeatInCents: price.lines.data[0]?.price.unit_amount,
    quantity: price.lines.data[0]?.quantity,
    promotionCode: coupon
      ? {
          id: coupon.code,
          restrictions: coupon.restrictions,
          duration: {
            type: coupon.coupon.duration,
            durationInMonth: coupon.coupon.duration_in_months,
          },
          name: coupon.coupon.name,
          amountOff: coupon.coupon.amount_off,
          percentOff: coupon.coupon.percent_off,
        }
      : null,
    tax: price.total_tax_amounts[0]
      ? price.total_tax_amounts[0]?.tax_rate.percentage
      : null,
  }
})
