'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calendar } from 'lucide-react'
import { scheduleAppointment } from '@/app/dashboard/actions'
import { toast } from 'sonner'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cases: any[]
  currentUserId: string
  onSuccess: () => void
  preselectedCaseId?: string
}

export function AppointmentModal({
  open,
  onOpenChange,
  cases,
  currentUserId,
  onSuccess,
  preselectedCaseId
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (preselectedCaseId) {
      setSelectedCaseId(preselectedCaseId)
    }
  }, [preselectedCaseId, open])

  const handleSchedule = async () => {
    if (!selectedCaseId || !date || !time) {
      return toast.error('Veuillez remplir tous les champs obligatoires')
    }

    setLoading(true)
    const selectedCase = cases.find(c => c.id === selectedCaseId)
    
    const result = await scheduleAppointment({
      cas_id: selectedCaseId,
      client_id: selectedCase.client_id,
      avocat_id: selectedCase.avocat_id,
      scheduled_at: `${date}T${time}:00Z`,
      notes
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rendez-vous programmé !')
      onSuccess()
      onOpenChange(false)
      // Reset form
      setSelectedCaseId('')
      setDate('')
      setTime('')
      setNotes('')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/50 bg-italian-roast text-foreground">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-camel">Programmer un rendez-vous</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fixez une date pour votre prochaine consultation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Dossier concerné</Label>
            <select 
              className="w-full h-10 px-3 rounded-md bg-background border border-border/50 text-sm focus:ring-1 focus:ring-camel outline-none"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="">Sélectionnez un dossier actif</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.titre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-border/50" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure</Label>
              <Input 
                id="time" 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-background border-border/50" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
            <Textarea 
              id="notes" 
              placeholder="Sujets à aborder, documents à préparer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border/50 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border/50 hover:bg-muted"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={loading}
            className="bg-camel text-italian-roast hover:bg-camel/90"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            Confirmer le RDV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
