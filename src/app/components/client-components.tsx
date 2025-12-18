'use client'

import { Check, Trash2, Plus } from 'lucide-react'
import { toggleHabit, deleteHabit, addHabit } from './actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useOptimistic, useTransition, useState } from 'react'

type Habit = {
  id: string
  title: string
  difficulty: string
  streak?: number
}

export function HabitItem({ 
  habit, 
  isCompleted, 
  date 
}: { 
  habit: Habit
  isCompleted: boolean
  date: string 
}) {
  const [pending, startTransition] = useTransition()
  // Optimistic UI para respuesta inmediata
  const [optimisticCompleted, toggleOptimistic] = useOptimistic(
    isCompleted,
    (state, _) => !state
  )

  const handleToggle = () => {
    startTransition(async () => {
      toggleOptimistic(null)
      await toggleHabit(habit.id, date, optimisticCompleted)
    })
  }

  const handleDelete = () => {
    if (confirm('¿Borrar hábito?')) {
      startTransition(async () => {
        await deleteHabit(habit.id)
      })
    }
  }

  return (
    <div className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          disabled={pending}
          className={cn(
            "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            optimisticCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400"
          )}
        >
          {optimisticCompleted && <Check size={16} strokeWidth={3} />}
        </button>
        <div>
          <h3 className={cn(
            "font-medium text-zinc-900 dark:text-zinc-100 transition-all",
            optimisticCompleted && "text-zinc-400 line-through"
          )}>{habit.title}</h3>
          <p className="text-xs text-zinc-500">{habit.difficulty}</p>
        </div>
      </div>
      <button 
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export function NewHabitForm() {
  const [isAdding, setIsAdding] = useState(false)

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mt-4"
      >
        <Plus size={16} />
        Nuevo Hábito
      </button>
    )
  }

  return (
    <form action={async (formData) => {
      await addHabit(formData)
      setIsAdding(false)
    }} className="mt-4 flex gap-2">
      <input 
        name="title"
        autoFocus
        placeholder="Nombre del hábito..."
        className="flex-1 bg-transparent border-b border-zinc-300 dark:border-zinc-700 px-2 py-1 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
      />
      <button 
        type="submit"
        className="text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded"
      >
        Guardar
      </button>
      <button 
        type="button" 
        onClick={() => setIsAdding(false)}
        className="text-xs text-zinc-500 px-2"
      >
        Cancelar
      </button>
    </form>
  )
}

