'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppointmentModal } from '@/components/appointment-modal'
import { confirmAppointment, deleteAppointment } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Trash2 } from 'lucide-react'

export default function AppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get('caseId')
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeCases, setActiveCases] = useState<any[]>([])
  const [selectedCaseInfo, setSelectedCaseInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [appToDelete, setAppToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user: userData } } = await supabase.auth.getUser()
    if (!userData) return router.push('/login')
    setUser(userData)

    const { data: prof } = await supabase.from('profils').select('*').eq('id', userData.id).single()
    setProfile(prof)

    // Fetch appointments
    let query = supabase
      .from('appointments')
      .select('*, cas:cas(id, titre), client:profils!client_id(nom_complet), avocat:profils!avocat_id(nom_complet)')
      .order('scheduled_at', { ascending: true })
    
    if (caseId) {
      query = query.eq('cas_id', caseId)
    } else {
      query = query.or(`client_id.eq.${userData.id},avocat_id.eq.${userData.id}`)
    }
    
    const { data: apps } = await query
    setAppointments(apps || [])

    // Fetch active cases for the modal
    if (caseId) {
      const { data: specificCase } = await supabase.from('cas').select('*').eq('id', caseId).single()
      setSelectedCaseInfo(specificCase)
    }

    const { data: cases } = await supabase
      .from('cas')
      .select('*')
      .eq('statut', 'cloture')
      .or(`client_id.eq.${userData.id},avocat_id.eq.${userData.id}`)

    setActiveCases(cases || [])
    setLoading(false)
  }

  const handleConfirm = async (appId: string) => {
    console.log("Attempting to confirm appointment:", appId)
    const result = await confirmAppointment(appId)
    if (result.error) {
      console.error("Confirm Appointment Error:", result.error)
      toast.error(result.error)
    } else {
      console.log("Appointment confirmed successfully")
      toast.success('Rendez-vous confirmé !')
      loadData()
    }
  }

  const handleDelete = async (appId: string) => {
    setAppToDelete(appId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!appToDelete) return
    
    setDeleting(true)
    const result = await deleteAppointment(appToDelete)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rendez-vous supprimé')
      setAppointments(prev => prev.filter(a => a.id !== appToDelete))
      setIsDeleteModalOpen(false)
    }
    setDeleting(false)
  }

  useEffect(() => {
    loadData()
  }, [router])

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
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {caseId && selectedCaseInfo ? `RDV : ${selectedCaseInfo.titre}` : 'Mes Rendez-vous'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {caseId ? 'Rendez-vous programmés pour ce dossier spécifique.' : 'Suivez vos consultations juridiques programmées.'}
            </p>
            {caseId && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-camel hover:text-camel/80 mt-2"
                onClick={() => router.push('/dashboard/appointments')}
              >
                ← Voir tous mes rendez-vous
              </Button>
            )}
          </div>
          {profile?.role === 'avocat' && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-camel text-italian-roast hover:bg-camel/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Programmer un RDV
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          {appointments.length > 0 ? (
            appointments.map((app) => (
              <Card key={app.id} className="border-border/50 bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{app.cas?.titre}</CardTitle>
                    <CardDescription>
                      {profile?.role === 'client' ? `Avec Me. ${app.avocat?.nom_complet}` : `Avec M. ${app.client?.nom_complet}`}
                    </CardDescription>
                  </div>
                  <Badge variant={app.statut === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                    {app.statut}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-2 text-camel">
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-medium">{new Date(app.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-camel">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{new Date(app.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex gap-2">
                    {app.statut === 'pending' && profile?.role === 'client' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirm(app.id)}
                        className="bg-camel text-italian-roast hover:bg-camel/90"
                      >
                        Confirmer
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(app.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border/50">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Aucun rendez-vous prévu pour le moment.</p>
            </div>
          )}
        </div>

        <AppointmentModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          cases={activeCases}
          currentUserId={user?.id}
          onSuccess={loadData}
          preselectedCaseId={caseId || undefined}
        />

        <ConfirmModal 
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={confirmDelete}
          loading={deleting}
          title="Supprimer le rendez-vous"
          description="Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible."
          confirmText="Supprimer"
        />
      </main>
    </div>
  )
}
