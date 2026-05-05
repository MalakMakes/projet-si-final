'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Send } from 'lucide-react'

interface ApplicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (message: string) => Promise<void>
  caseTitle: string
}

export function ApplicationModal({
  open,
  onOpenChange,
  onConfirm,
  caseTitle,
}: ApplicationModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(message)
      onOpenChange(false)
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/50 bg-italian-roast text-foreground">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-camel">Postuler au dossier</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Vous postulez pour : <span className="font-medium text-foreground">{caseTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Votre message au client
            </Label>
            <Textarea
              id="message"
              placeholder="Expliquez brièvement pourquoi vous êtes le bon avocat pour ce dossier..."
              className="min-h-[120px] bg-background border-border/50 focus:border-camel/50 focus:ring-camel/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground italic">
              Le client pourra voir votre profil et ce message avant de vous choisir.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border/50 hover:bg-muted"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-camel text-italian-roast hover:bg-camel/90"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Envoyer ma candidature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
