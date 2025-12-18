'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addHabit(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const user = await supabase.auth.getUser()

  if (!title || !user.data.user) return

  await supabase.from('habits').insert({
    title,
    user_id: user.data.user.id,
    difficulty: 'Medium',
    frequency_type: 'daily'
  })

  revalidatePath('/')
}

export async function toggleHabit(habitId: string, date: string, isCompleted: boolean) {
  const supabase = await createClient()
  
  if (isCompleted) {
    // Si ya estaba completado, lo borramos (desmarcar)
    // Buscamos el log para esa fecha y ese hábito
    await supabase.from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('completed_at', date)
  } else {
    // Si no estaba completado, lo insertamos
    await supabase.from('habit_logs').insert({
      habit_id: habitId,
      completed_at: date
    })
  }

  revalidatePath('/')
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  await supabase.from('habits').delete().eq('id', habitId)
  revalidatePath('/')
}

