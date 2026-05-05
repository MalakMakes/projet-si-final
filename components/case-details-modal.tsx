'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, Scale, Calendar, User } from 'lucide-react'

interface CaseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
}

export function CaseDetailsModal({
  open,
  onOpenChange,
  item
}: CaseDetailsModalProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border/50 bg-italian-roast text-foreground max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-camel/10 text-camel">
              <Scale className="h-5 w-5" />
            </div>
            <DialogTitle className="font-serif text-2xl text-camel">{item.titre}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(item.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Client: {item.client?.nom_complet || 'Anonyme'}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-camel flex items-center gap-2">
              Description du dossier
            </h4>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-sm leading-relaxed whitespace-pre-wrap">
              {item.description}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-camel flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents joints ({item.file_urls?.length || 0})
            </h4>
            <div className="grid gap-2">
              {item.file_urls && item.file_urls.length > 0 ? (
                item.file_urls.map((url: string, index: number) => {
                  const fileName = url.split('/').pop() || `Document ${index + 1}`
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-background border border-border/50 hover:border-camel/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-camel" />
                        <span className="text-sm font-medium truncate max-w-[300px]">{fileName}</span>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-8 text-camel hover:text-camel hover:bg-camel/10">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Ouvrir
                        </a>
                      </Button>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground italic px-4">Aucun document joint à ce dossier.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
