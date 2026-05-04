'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, FileText, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Consultation {
  id: string
  client: string
  date: string
  status: 'en_cours' | 'cloture'
}

const consultations: Consultation[] = [
  { id: '1', client: 'Marie Laurent', date: '28 Avr 2024', status: 'en_cours' },
  { id: '2', client: 'Pierre Dubois', date: '25 Avr 2024', status: 'cloture' },
  { id: '3', client: 'Sophie Martin', date: '22 Avr 2024', status: 'en_cours' },
  { id: '4', client: 'Jean-Paul Petit', date: '20 Avr 2024', status: 'cloture' },
  { id: '5', client: 'Isabelle Moreau', date: '18 Avr 2024', status: 'en_cours' },
]

const statusConfig = {
  en_cours: {
    label: 'En cours',
    className: 'bg-boho/20 text-camel border-boho/30 hover:bg-boho/30',
  },
  cloture: {
    label: 'Clôturé',
    className: 'bg-rubine/20 text-foreground/80 border-rubine/30 hover:bg-rubine/30',
  },
}

export function ConsultationsTable() {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div className="border-b border-border/50 px-6 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Consultations récentes
        </h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Client</TableHead>
            <TableHead className="text-muted-foreground font-medium">Date</TableHead>
            <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.map((consultation) => (
            <TableRow 
              key={consultation.id} 
              className="border-border/30 hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium text-foreground">
                {consultation.client}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {consultation.date}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium',
                    statusConfig[consultation.status].className
                  )}
                >
                  {statusConfig[consultation.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-tamarind border-border/50"
                  >
                    <DropdownMenuItem className="text-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
