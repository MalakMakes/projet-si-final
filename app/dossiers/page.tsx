'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { FolderOpen, Plus, Loader2, MessageSquare, Briefcase, Scale, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { closeCase } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/confirm-modal'

export default function DossiersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'cloture' | 'termine'>('all')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [caseToClose, setCaseToClose] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) return router.push('/login')
      setUser(userData)

      // Fetch Profile
      const { data: prof } = await supabase.from('profils').select('*').eq('id', userData.id).single()
      setProfile(prof)

      // Fetch Active & Closed Cases
      let query = supabase
        .from('cas')
        .select('*, client:profils!client_id(nom_complet), avocat:profils!avocat_id(nom_complet, email)')
        .in('statut', ['cloture', 'termine'])
        .order('created_at', { ascending: false })
      
      if (prof.role === 'client') {
        query = query.eq('client_id', userData.id)
      } else {
        query = query.eq('avocat_id', userData.id)
      }

      const { data: casesData } = await query
      setCases(casesData || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleClose = async (casId: string) => {
    setCaseToClose(casId)
    setIsConfirmOpen(true)
  }

  const confirmClose = async () => {
    if (!caseToClose) return
    
    setClosing(true)
    const result = await closeCase(caseToClose)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Dossier clôturé avec succès')
      // Update local state without removing
      setCases(prev => prev.map(c => c.id === caseToClose ? { ...c, statut: 'termine' } : c))
      setIsConfirmOpen(false)
    }
    setClosing(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-camel" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      
      <main className="container mx-auto px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Dossiers Actifs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos dossiers juridiques en cours de traitement.
            </p>
          </div>
          {profile?.role === 'client' && (
            <Button asChild className="bg-camel text-italian-roast hover:bg-camel/90 font-medium">
              <Link href="/dashboard/post-case">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau dossier
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
            size="sm"
          >
            Tous ({cases.length})
          </Button>
          <Button 
            variant={filter === 'cloture' ? 'default' : 'outline'} 
            onClick={() => setFilter('cloture')}
            className={filter === 'cloture' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
            size="sm"
          >
            Actifs ({cases.filter(c => c.statut === 'cloture').length})
          </Button>
          <Button 
            variant={filter === 'termine' ? 'default' : 'outline'} 
            onClick={() => setFilter('termine')}
            className={filter === 'termine' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
            size="sm"
          >
            Terminés ({cases.filter(c => c.statut === 'termine').length})
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.filter(c => filter === 'all' ? true : c.statut === filter).length > 0 ? (
            cases.filter(c => filter === 'all' ? true : c.statut === filter).map((item) => (
              <Card key={item.id} className="group border-border/50 bg-card transition-all hover:border-camel/30 hover:shadow-lg hover:shadow-camel/5">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-camel/10 text-camel">
                        <Scale className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-lg text-foreground line-clamp-1">
                          {item.titre}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {profile?.role === 'client' ? `Avocat: Me. ${item.avocat?.nom_complet}` : `Client: ${item.client?.nom_complet}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={item.statut === 'termine' ? 'bg-muted text-muted-foreground' : 'bg-camel text-italian-roast'}>
                      {item.statut === 'termine' ? 'Terminé' : 'Actif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {item.description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1 bg-camel text-italian-roast hover:bg-camel/90">
                        <Link href={`/dashboard/chat/${item.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 border-border/50">
                        <Link href={`/dashboard/appointments?caseId=${item.id}`}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          RDV
                        </Link>
                      </Button>
                    </div>
                    {item.statut !== 'termine' && (
                      <Button 
                        onClick={() => handleClose(item.id)}
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Clôturer le dossier
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border/50">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Aucun dossier actif pour le moment.</p>
            </div>
          )}
        </div>

        <ConfirmModal 
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={confirmClose}
          loading={closing}
          title="Clôturer le dossier"
          description="Êtes-vous sûr de vouloir clôturer ce dossier ? Cette action marquera le dossier comme terminé."
          confirmText="Confirmer la clôture"
        />
      </main>
    </div>
  )
}
