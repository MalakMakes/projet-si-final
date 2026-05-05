'use client'

import { Plus, Briefcase, Loader2, MessageSquare, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ConsultationsTable } from '@/components/consultations-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationModal } from '@/components/application-modal'
import { applyToCase } from '../dashboard/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CaseDetailsModal } from '@/components/case-details-modal'

export default function ReservationsPage() {
  const [profile, setProfile] = useState<{ id: string, nom_complet: string, role: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState<{ id: string, titre: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [caseForDetails, setCaseForDetails] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'ouvert' | 'cloture' | 'termine'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  const handleApply = async (casId: string) => {
    const caseItem = cases.find(c => c.id === casId)
    if (caseItem) {
      setSelectedCase({ id: casId, titre: caseItem.titre })
      setIsModalOpen(true)
    }
  }

  const confirmApply = async (message: string) => {
    if (!selectedCase) return

    setApplyingId(selectedCase.id)
    const result = await applyToCase(selectedCase.id, message)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Votre candidature a été envoyée !')
      setCases(prev => prev.map(c => 
        c.id === selectedCase.id 
          ? { ...c, candidatures: [...(c.candidatures || []), { avocat_id: user?.id, message }] } 
          : c
      ))
    }
    setApplyingId(null)
  }

  const handleShowDetails = (item: any) => {
    setCaseForDetails(item)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: userData } } = await supabase.auth.getUser()
      
      if (userData) {
        setUser(userData)
        const { data: profileData } = await supabase
          .from('profils')
          .select('id, nom_complet, role')
          .eq('id', userData.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          
          let query = supabase
            .from('cas')
            .select('*, client:profils!client_id(nom_complet), candidatures(id, avocat_id, message)')
            .in('statut', ['ouvert', 'cloture', 'termine'])
            .order('created_at', { ascending: false })
          
          if (profileData.role === 'client') {
            query = query.eq('client_id', userData.id)
          }

          const { data: casesData } = await query
          if (casesData) setCases(casesData)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.statut === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB
  })

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
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
              {profile?.role === 'avocat' ? 'Opportunités' : 'Mes Réservations'}
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              {profile?.role === 'avocat' 
                ? 'Trouvez de nouveaux clients et proposez vos services.' 
                : 'Gérez vos demandes de consultation et vos dossiers.'}
            </p>
          </div>
          {profile?.role === 'client' && (
            <Button asChild className="bg-camel text-italian-roast hover:bg-camel/90 font-medium px-8 py-6">
              <Link href="/dashboard/post-case">
                <Plus className="mr-2 h-5 w-5" />
                Nouveau dossier
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un dossier..." 
                className="pl-10 bg-card/50 border-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={sortBy === 'newest' ? 'default' : 'outline'} 
                onClick={() => setSortBy('newest')}
                className={sortBy === 'newest' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
                size="sm"
              >
                Plus récent
              </Button>
              <Button 
                variant={sortBy === 'oldest' ? 'default' : 'outline'} 
                onClick={() => setSortBy('oldest')}
                className={sortBy === 'oldest' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
                size="sm"
              >
                Plus ancien
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'} 
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
              size="sm"
            >
              Tous
            </Button>
            <Button 
              variant={statusFilter === 'ouvert' ? 'default' : 'outline'} 
              onClick={() => setStatusFilter('ouvert')}
              className={statusFilter === 'ouvert' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
              size="sm"
            >
              Ouverts ({cases.filter(c => c.statut === 'ouvert').length})
            </Button>
            <Button 
              variant={statusFilter === 'cloture' ? 'default' : 'outline'} 
              onClick={() => setStatusFilter('cloture')}
              className={statusFilter === 'cloture' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
              size="sm"
            >
              Actifs ({cases.filter(c => c.statut === 'cloture').length})
            </Button>
            <Button 
              variant={statusFilter === 'termine' ? 'default' : 'outline'} 
              onClick={() => setStatusFilter('termine')}
              className={statusFilter === 'termine' ? 'bg-camel text-italian-roast' : 'border-border/50 text-muted-foreground'}
              size="sm"
            >
              Terminés ({cases.filter(c => c.statut === 'termine').length})
            </Button>
          </div>
        </div>

        {/* Avocat Feed (Grid View) */}
        {profile?.role === 'avocat' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {filteredCases.map((item) => {
              const hasApplied = item.candidatures?.some((c: any) => c.avocat_id === user?.id)
              
              return (
                <Card key={item.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="bg-camel/10 text-camel border-camel/20">
                        {item.statut}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="mt-3 text-xl line-clamp-1">{item.titre}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>Client: {item.client?.nom_complet || 'Anonyme'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-camel hover:text-camel hover:bg-camel/10"
                          onClick={() => handleShowDetails(item)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                        <Button 
                          size="sm" 
                          variant={hasApplied ? "outline" : "secondary"}
                          onClick={() => handleApply(item.id)}
                          disabled={applyingId === item.id || hasApplied || item.statut === 'cloture'}
                        >
                          {applyingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : hasApplied ? (
                            'Postulé'
                          ) : (
                            'Postuler'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Client Table View */}
        {profile?.role === 'client' && (
          <ConsultationsTable 
            cases={filteredCases} 
            role={profile?.role} 
            currentUserId={user?.id}
          />
        )}

        {filteredCases.length === 0 && (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border/50">
            <p className="text-muted-foreground text-lg italic">Aucun résultat trouvé.</p>
          </div>
        )}

        <ApplicationModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConfirm={confirmApply}
          caseTitle={selectedCase?.titre || ''}
        />

        <CaseDetailsModal 
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          item={caseForDetails}
        />
      </main>
    </div>
  )
}
