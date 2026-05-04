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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

interface ConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConsultationModal({ open, onOpenChange }: ConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-tamarind border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            Nouvelle consultation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez une nouvelle consultation pour un client existant ou nouveau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-foreground">
              Nom du client
            </Label>
            <Input
              id="client"
              placeholder="Ex: Jean Martin"
              required
              className="bg-italian-roast/50 border-border/50 focus:border-camel placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez brièvement l'objet de la consultation..."
              required
              rows={4}
              className="bg-italian-roast/50 border-border/50 focus:border-camel placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents" className="text-sm font-medium text-foreground">
              Documents juridiques
            </Label>
            <div className="relative">
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="bg-italian-roast/50 border-border/50 file:bg-camel/10 file:text-camel file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md file:text-sm file:font-medium hover:file:bg-camel/20 cursor-pointer"
              />
              <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: PDF, DOC, DOCX
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50 text-foreground hover:bg-muted hover:text-foreground"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-camel text-italian-roast hover:bg-camel/90 font-medium"
            >
              {isSubmitting ? 'Création...' : 'Créer la consultation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
