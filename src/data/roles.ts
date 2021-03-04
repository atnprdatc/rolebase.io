import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'
import * as yup from 'yup'
import { FirebaseHookReturn, getCollection } from './firebase'
import { nameSchema } from './schemas'

export interface Role {
  name: string
  purpose: string
  domain: string
  accountabilities: string
}

export interface RoleEntry extends Role {
  id: string
}

export type RoleCreate = Role
export type RoleUpdate = Partial<Role>

const collection = getCollection<Role>('roles')

export function useRoles(): FirebaseHookReturn<RoleEntry[]> {
  const [data, loading, error] = useCollectionData<Role, 'id'>(collection, {
    idField: 'id',
  })
  return [data?.sort((a, b) => (a.name < b.name ? -1 : 1)), loading, error]
}

export function useRole(id: string): FirebaseHookReturn<RoleEntry> {
  return useDocumentData(collection.doc(id), { idField: 'id' })
}

export async function createRole(name: string): Promise<RoleEntry | undefined> {
  const role: Role = {
    name,
    purpose: '',
    domain: '',
    accountabilities: '',
  }
  const doc = await collection.add(role)
  const snapshot = await doc.get()
  return { ...snapshot.data(), id: doc.id } as RoleEntry | undefined
}

export async function updateRole(id: string, data: RoleUpdate) {
  await collection.doc(id).set(data, { merge: true })
}

export async function deleteRole(id: string) {
  await collection.doc(id).delete()
}

export const roleCreateSchema = yup.object().shape({
  name: nameSchema,
})

export const roleUpdateSchema = yup.object().shape({
  name: nameSchema,
  purpose: yup.string(),
  domain: yup.string(),
  accountabilities: yup.string(),
})
