'use client'

import { Plus, Briefcase, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ConsultationsTable } from '@/components/consultations-table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ConsultationsPage() {
  const [profile, setProfile] = useState<{ nom_complet: string, role: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const handleApply = async (casId: string) => {
    setApplyingId(casId)
    const { applyToCase } = await import('../dashboard/actions')
    const result = await applyToCase(casId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Votre candidature a été envoyée !')
      // Refresh cases locally
      setCases(prev => prev.map(c => 
        c.id === casId 
          ? { ...c, candidatures: [...(c.candidatures || []), { avocat_id: user?.id }] } 
          : c
      ))
    }
    setApplyingId(null)
  }

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: userData } } = await supabase.auth.getUser()
      
      if (userData) {
        setUser(userData)
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profils')
          .select('nom_complet, role')
          .eq('id', userData.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          
          // Fetch Cases (all for avocat, own for client)
          let query = supabase
            .from('cas')
            .select('*, client:profils!client_id(nom_complet)')
            .order('created_at', { ascending: false })
          
          if (profileData.role === 'client') {
            query = query.eq('client_id', userData.id)
          }

          const { data: casesData, error: casesError } = await query
          
          if (casesError) {
            console.error("Consultations Fetch Error:", casesError)
          } else {
            console.log("Consultations: Fetched", casesData?.length, "cases")
            setCases(casesData || [])
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

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
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              {profile?.role === 'avocat' ? 'Dossiers clients' : 'Mes Dossiers'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {profile?.role === 'avocat' 
                ? 'Consultez les dossiers publiés par les clients.' 
                : 'Suivez et gérez tous vos dossiers juridiques.'}
            </p>
          </div>
          {profile?.role === 'client' && (
            <Button asChild className="bg-camel text-italian-roast hover:bg-camel/90 font-medium">
              <Link href="/dashboard/post-case">
                <Plus className="mr-2 h-4 w-4" />
                Publier un dossier
              </Link>
            </Button>
          )}
        </div>

        {/* Consultations Table (Now displaying Cases) */}
        <ConsultationsTable 
          cases={cases} 
          role={profile?.role} 
          currentUserId={user?.id}
          onApply={handleApply}
        />
      </main>
    </div>
  )
}
