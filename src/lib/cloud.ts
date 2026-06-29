import { supabase } from './supabase'

export async function cloudFetchAll<T>(
  table: string,
  businessId: string
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as T[]
}

export async function pushE<T extends { id: string }>(
  table: string,
  record: Omit<T, 'createdAt'> & { id: string }
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .upsert(record)
    .select()
    .single()
  if (error) throw error
  return data as T
}

export async function delE(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function cloudFetchSingle<T>(
  table: string,
  id: string
): Promise<T | null> {
  const { data } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()
  return data as T | null
}
