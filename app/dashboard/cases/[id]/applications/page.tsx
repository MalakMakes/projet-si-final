'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { acceptAvocat, reopenCase } from '../../../actions'
import { Check, Loader2, ArrowLeft, User, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/confirm-modal'
import Link from 'next/link'

export default function CaseApplicationsPage() {
  const { id: casId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [cas, setCas] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false)
  const [reopening, setReopening] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return router.push('/login')

      // Fetch Profile
      const { data: profileData } = await supabase.from('profils').select('*').eq('id', user.id).single()
      setProfile(profileData)

      // Fetch Case Details
      const { data: casData } = await supabase.from('cas').select('*').eq('id', casId).single()
      setCas(casData)

      // Fetch Applications with Avocat details
      const { data: appsData } = await supabase
        .from('candidatures')
        .select('*, avocat:profils(*)')
        .eq('cas_id', casId)
        .order('created_at', { ascending: false })
      
      if (appsData) setApplications(appsData)
      setLoading(false)
    }
    loadData()
  }, [casId, router])

  const handleAccept = async (avocatId: string) => {
    setAcceptingId(avocatId)
    const result = await acceptAvocat(casId as string, avocatId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Avocat sélectionné ! Le dossier est maintenant clôturé.')
      router.push('/dashboard')
    }
    setAcceptingId(null)
  }

  const handleReopen = async () => {
    setReopening(true)
    const result = await reopenCase(casId as string)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Dossier rouvert ! Vous pouvez maintenant choisir un autre avocat.')
      // Refresh local state
      setCas((prev: any) => prev ? ({ ...prev, avocat_id: null, statut: 'ouvert' }) : null)
      setIsReopenModalOpen(false)
    }
    setReopening(false)
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
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-8 hover:bg-muted">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </Button>

          <div className="mb-10">
            <h1 className="font-serif text-3xl font-semibold mb-2">{cas?.titre}</h1>
            <p className="text-muted-foreground mb-6">
              {applications.length} avocat(s) ont postulé pour vous aider.
            </p>

            {cas?.avocat_id && (
              <Card className="bg-destructive/10 border-destructive/20 mb-8">
                <CardHeader className="py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <CardTitle className="text-base text-destructive">Avocat déjà assigné</CardTitle>
                      <CardDescription className="text-destructive/80">
                        Vous avez déjà choisi un avocat pour ce dossier. Pour en changer, vous devez d'abord rouvrir le dossier.
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsReopenModalOpen(true)}
                      variant="outline" 
                      className="ml-auto border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Réouvrir
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="grid gap-6">
            {applications.length > 0 ? (
              applications.map((app) => (
                <Card key={app.id} className="border-border/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <Avatar className="h-12 w-12 border-2 border-camel/20">
                      <AvatarFallback className="bg-camel/10 text-camel">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{app.avocat?.nom_complet}</CardTitle>
                      <CardDescription>{app.avocat?.email}</CardDescription>
                    </div>
                    <Button 
                      onClick={() => handleAccept(app.avocat_id)}
                      disabled={!!acceptingId || !!cas?.avocat_id}
                      className={cas?.avocat_id === app.avocat_id ? "bg-green-600 text-white" : "bg-camel text-italian-roast hover:bg-camel/90"}
                    >
                      {cas?.avocat_id === app.avocat_id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Avocat choisi
                        </>
                      ) : acceptingId === app.avocat_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Choisir cet avocat
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="bg-muted/30 pt-4 border-t border-border/50">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Message :</p>
                      <p className="text-foreground bg-background p-3 rounded-md border border-border/50">
                        {app.message || "Aucun message fourni."}
                      </p>
                    </div>
                    <p className="text-xs italic text-muted-foreground">
                      Postulé le {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-xl border-border/50 bg-muted/20">
                <p className="text-muted-foreground text-lg">Aucune candidature pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        <ConfirmModal 
          open={isReopenModalOpen}
          onOpenChange={setIsReopenModalOpen}
          onConfirm={handleReopen}
          loading={reopening}
          title="Réouvrir le dossier"
          description="Êtes-vous sûr de vouloir rouvrir ce dossier ? Cela annulera l'assignation de l'avocat actuel et vous permettra d'en choisir un autre."
          confirmText="Réouvrir"
        />
      </main>
    </div>
  )
}
