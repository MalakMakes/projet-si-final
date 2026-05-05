'use client'

import { useState } from 'react'

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
import { MoreHorizontal, Eye, FileText, Trash2, MessageSquare, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { deleteCase } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import { ConfirmModal } from './confirm-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { CaseDetailsModal } from './case-details-modal'

interface Case {
  id: string
  titre: string
  description: string
  statut: string
  created_at: string
  file_urls: string[]
  client?: { nom_complet: string }
  candidatures?: { id: string; avocat_id: string }[]
}

interface ConsultationsTableProps {
  cases: Case[]
  role?: string | null
  currentUserId?: string | null
  onApply?: (casId: string) => Promise<void>
  onDeleteSuccess?: () => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ouvert: {
    label: 'Ouvert',
    className: 'bg-boho/20 text-camel border-boho/30 hover:bg-boho/30',
  },
  cloture: {
    label: 'Clôturé',
    className: 'bg-rubine/20 text-foreground/80 border-rubine/30 hover:bg-rubine/30',
  },
}

export function ConsultationsTable({ cases, role, currentUserId, onApply, onDeleteSuccess }: ConsultationsTableProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleShowDetails = (item: any) => {
    setSelectedItem(item)
    setIsDetailsOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    const result = await deleteCase(itemToDelete)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Dossier supprimé')
      onDeleteSuccess?.()
      setIsDeleteModalOpen(false)
    }
    setDeleting(false)
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden shadow-sm">

      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent bg-muted/20">
            <TableHead className="text-muted-foreground font-medium pl-6">Titre du dossier</TableHead>
            {role === 'avocat' && (
              <TableHead className="text-muted-foreground font-medium">Client</TableHead>
            )}
            <TableHead className="text-muted-foreground font-medium">Date</TableHead>
            <TableHead className="text-muted-foreground font-medium">Statut</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length > 0 ? (
            cases.map((item) => {
              const hasApplied = item.candidatures?.some((c: any) => c.avocat_id === currentUserId)
              
              return (
                <TableRow 
                  key={item.id} 
                  className="border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground pl-6">
                    <div className="flex flex-col">
                      <span>{item.titre}</span>
                      {role === 'client' && (
                        <span className="text-xs text-camel mt-1 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.candidatures?.length || 0} avocat(s) ont postulé
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {role === 'avocat' && (
                    <TableCell className="text-foreground">
                      {item.client?.nom_complet || 'Inconnu'}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-medium capitalize',
                        statusConfig[item.statut]?.className || statusConfig['ouvert'].className
                      )}
                    >
                      {statusConfig[item.statut]?.label || item.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {role === 'avocat' && item.statut === 'ouvert' && (
                        <Button 
                          variant={hasApplied ? "outline" : "ghost"}
                          size="sm" 
                          className={cn("h-8", hasApplied ? "text-muted-foreground" : "text-camel hover:text-camel hover:bg-camel/10")}
                          onClick={() => !hasApplied && onApply?.(item.id)}
                          disabled={hasApplied}
                        >
                          {hasApplied ? 'Postulé' : 'Postuler'}
                        </Button>
                      )}
                      {role === 'avocat' && (
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-camel">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-muted-foreground hover:text-camel"
                        onClick={() => handleShowDetails(item)}
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {role === 'client' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="text-camel hover:bg-camel/10"
                            asChild
                            title={`Voir candidatures (${item.candidatures?.length || 0})`}
                          >
                            <Link href={`/dashboard/cases/${item.id}/applications`}>
                              <Users className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="text-destructive hover:bg-destructive/10"
                            title="Supprimer"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={role === 'avocat' ? 5 : 4} className="h-32 text-center text-muted-foreground">
                Aucun dossier trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CaseDetailsModal 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedItem}
      />

      <ConfirmModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Supprimer le dossier"
        description="Êtes-vous sûr de vouloir supprimer ce dossier ? Toutes les candidatures et documents associés seront également supprimés. Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  )
}
