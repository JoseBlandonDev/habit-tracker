import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { HabitItem, NewHabitForm } from './components/client-components'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const displayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })

  // Cargar hábitos
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: true })

  // Cargar logs de hoy
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('completed_at', today)

  const completedIds = new Set(logs?.map(l => l.habit_id))

  // Calcular progreso
  const total = habits?.length || 0
  const completed = logs?.length || 0
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <p className="text-zinc-500 dark:text-zinc-400 capitalize">{displayDate}</p>
          <h1 className="text-3xl font-bold mt-1">Mi Progreso</h1>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2 text-zinc-500">
              <span>{completed} de {total} completados</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Habit List */}
        <div className="space-y-3">
          {habits?.map(habit => (
            <HabitItem 
              key={habit.id}
              habit={habit}
              isCompleted={completedIds.has(habit.id)}
              date={today}
            />
          ))}
          
          {habits?.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No tienes hábitos activos</p>
            </div>
          )}
        </div>

        <NewHabitForm />
        
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <form action="/auth/signout" method="post">
            <button className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
