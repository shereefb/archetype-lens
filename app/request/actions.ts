'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string

  // Check for duplicates
  const { data: existing } = await supabase
    .from('sources')
    .select('id')
    .ilike('title', title)
    .eq('category', category)
    .single()

  if (existing) {
    redirect(`/source/${existing.id}?message=This content already exists`)
  }

  // Check for pending requests
  const { data: pendingRequest } = await supabase
    .from('content_requests')
    .select('id')
    .ilike('title', title)
    .eq('category', category)
    .in('status', ['pending', 'processing'])
    .single()

  if (pendingRequest) {
    redirect('/?message=This content is already being generated')
  }

  // Create request record
  const { data: request, error } = await supabase
    .from('content_requests')
    .insert({
      title,
      category,
      requested_by: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    redirect('/request?error=Failed to submit request')
  }

  // Call edge function to generate characters
  const { data: result, error: fnError } = await supabase.functions.invoke(
    'generate-characters',
    {
      body: { requestId: request.id, title, category },
    }
  )

  if (fnError || !result?.sourceId) {
    redirect('/request?error=Generation failed. Please try again.')
  }

  redirect(`/source/${result.sourceId}`)
}
