'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCase(formData: FormData, fileUrls: string[]) {
  const supabase = await createClient()
  
  const titre = formData.get('titre') as string
  const description = formData.get('description') as string

  if (!titre || !description) {
    return { error: 'Title and description are required' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if user is a client
  const { data: profile } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') {
    return { error: 'Only clients can create cases' }
  }

  const { error } = await supabase
    .from('cas')
    .insert({
      client_id: user.id,
      titre,
      description,
      file_urls: fileUrls,
      statut: 'ouvert'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCase(casId: string) {
  const supabase = await createClient()
  
  // 1. Delete related appointments
  await supabase.from('appointments').delete().eq('cas_id', casId)
  
  // 2. Delete related candidatures
  await supabase.from('candidatures').delete().eq('cas_id', casId)

  // 3. Delete the case itself
  const { error } = await supabase
    .from('cas')
    .delete()
    .eq('id', casId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dossiers')
  revalidatePath('/reservations')
  return { success: true }
}

export async function applyToCase(casId: string, message?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('candidatures')
    .insert({
      cas_id: casId,
      avocat_id: user.id,
      message: message || ''
    })

  if (error) {
    if (error.code === '23505') return { error: 'Vous avez déjà postulé à ce dossier' }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function acceptAvocat(casId: string, avocatId: string) {
  const supabase = await createClient()
  
  // 1. Check if already has an avocat
  const { data: cas } = await supabase
    .from('cas')
    .select('avocat_id, statut')
    .eq('id', casId)
    .single()

  if (cas?.avocat_id) {
    return { error: 'Ce dossier a déjà un avocat assigné. Veuillez le rouvrir avant de changer.' }
  }

  const { error } = await supabase
    .from('cas')
    .update({ 
      avocat_id: avocatId,
      statut: 'cloture' 
    })
    .eq('id', casId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${casId}/applications`)
  revalidatePath('/dossiers')
  return { success: true }
}

export async function reopenCase(casId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('cas')
    .update({ 
      avocat_id: null,
      statut: 'ouvert' 
    })
    .eq('id', casId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/cases/${casId}/applications`)
  revalidatePath('/dossiers')
  return { success: true }
}

export async function scheduleAppointment(data: {
  cas_id: string
  client_id: string
  avocat_id: string
  scheduled_at: string
  notes?: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointments')
    .insert({
      cas_id: data.cas_id,
      client_id: data.client_id,
      avocat_id: data.avocat_id,
      scheduled_at: data.scheduled_at,
      notes: data.notes,
      statut: 'pending'
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/appointments')
  return { success: true }
}

export async function confirmAppointment(appId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointments')
    .update({ statut: 'confirmed' })
    .eq('id', appId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/appointments')
  return { success: true }
}

export async function deleteAppointment(appId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/appointments')
  return { success: true }
}

export async function closeCase(casId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('cas')
    .update({ statut: 'termine' })
    .eq('id', casId)

  if (error) return { error: error.message }

  revalidatePath('/dossiers')
  revalidatePath('/dashboard')
  return { success: true }
}



