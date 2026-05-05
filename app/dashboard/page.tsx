'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { MetricCard } from '@/components/metric-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FolderOpen, FileText, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ConsultationsTable } from '@/components/consultations-table'
export default function DashboardPage() {
  const [profile, setProfile] = useState<{ nom_complet: string, role: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [appointmentsCount, setAppointmentsCount] = useState(0)
  const [loadingCases, setLoadingCases] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user: userData } } = await supabase.auth.getUser()
    if (userData) {
      setUser(userData)
      const { data } = await supabase
        .from('profils')
        .select('nom_complet, role')
        .eq('id', userData.id)
        .single()
      
      if (data) {
        setProfile(data)
        
        // 2. Fetch cases based on role
        let query = supabase
          .from('cas')
          .select('*, client:profils!client_id(nom_complet), avocat:profils!avocat_id(nom_complet, email), candidatures(id, avocat_id)')
          .order('created_at', { ascending: false })
        
        if (data.role === 'client') {
          query = query.eq('client_id', userData.id)
        }

        const { data: casesData } = await query
        setCases(casesData || [])

        // 3. Fetch Upcoming Appointments Count
        const { count: appCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .or(`client_id.eq.${userData.id},avocat_id.eq.${userData.id}`)
          .eq('statut', 'confirmed')
          .gte('scheduled_at', new Date().toISOString())
        
        setAppointmentsCount(appCount || 0)
      }
    }
    setLoadingCases(false)
  }

  if (loadingCases) {
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
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenue, {profile?.nom_complet || 'Utilisateur'}. Voici un aperçu de votre activité.
          </p>
        </div>

        <div className="grid gap-8">
          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Dossiers"
                value={cases.length.toString()}
                icon={Users}
                trend={{ value: 0, label: 'depuis le début' }}
              />
              <MetricCard
                title="Dossiers Actifs"
                value={cases.filter(c => c.statut === 'cloture').length.toString()}
                icon={FolderOpen}
                trend={{ value: 0, label: 'en cours' }}
              />
              <MetricCard
                title="RDV à venir"
                value={appointmentsCount.toString()}
                icon={FileText}
                trend={{ value: 0, label: 'confirmés' }}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Mes dossiers récents
              </h2>
              {profile?.role === 'client' && (
                <Button asChild className="bg-camel text-italian-roast hover:bg-camel/90">
                  <Link href="/dashboard/post-case">Postuler un nouveau dossier</Link>
                </Button>
              )}
            </div>
            <ConsultationsTable 
              cases={cases.slice(0, 5)} 
              role={profile?.role}
              currentUserId={user?.id}
              onDeleteSuccess={loadData}
            />
          </section>

          <section>
            <Card className="bg-camel/5 border-camel/20">
              <CardHeader>
                <CardTitle className="text-camel">Accès Rapide</CardTitle>
                <CardDescription>
                  Gérez vos dossiers en cours dans l'onglet "Dossiers" ou recherchez de nouvelles opportunités dans "Réservations".
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button asChild variant="outline" className="border-camel text-camel hover:bg-camel/10">
                  <Link href="/dossiers">Voir mes dossiers</Link>
                </Button>
                <Button asChild variant="outline" className="border-camel text-camel hover:bg-camel/10">
                  <Link href="/reservations">Voir les réservations</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
