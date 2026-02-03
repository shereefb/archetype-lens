'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { addToSelection, removeFromSelection } from '@/lib/selection'

export async function addToSelectionAction(sourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Add to database for logged-in users
    await supabase
      .from('user_selections')
      .upsert({
        user_id: user.id,
        source_id: sourceId,
      })
  } else {
    // Add to cookie for anonymous users
    await addToSelection(sourceId)
  }

  revalidatePath('/selection')
  revalidatePath('/source/[id]')
}

export async function removeFromSelectionAction(sourceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Remove from database for logged-in users
    await supabase
      .from('user_selections')
      .delete()
      .eq('user_id', user.id)
      .eq('source_id', sourceId)
  } else {
    // Remove from cookie for anonymous users
    await removeFromSelection(sourceId)
  }

  revalidatePath('/selection')
  revalidatePath('/source/[id]')
}
