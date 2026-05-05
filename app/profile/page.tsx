'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from './actions'
import { User, ShieldCheck, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<{ nom_complet: string; role: string; email: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profils')
          .select('nom_complet, role, email')
          .eq('id', user.id)
          .single()
        
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    
    const formData = new FormData(event.currentTarget)
    const result = await updateProfile(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Profil mis à jour avec succès')
      // Update local state
      setProfile(prev => prev ? { ...prev, nom_complet: formData.get('nom_complet') as string } : null)
    }
    setSaving(false)
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
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl font-semibold mb-8 text-foreground">Mon Profil</h1>
          
          <div className="grid gap-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de compte et vos préférences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom_complet" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nom Complet
                    </Label>
                    <Input 
                      id="nom_complet" 
                      name="nom_complet" 
                      defaultValue={profile?.nom_complet} 
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 opacity-80">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email (Non modifiable)
                    </Label>
                    <Input 
                      value={profile?.email} 
                      disabled 
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2 opacity-80">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      Type de Compte
                    </Label>
                    <div className="px-3 py-2 rounded-md bg-muted/50 text-sm font-medium capitalize border border-border/50">
                      {profile?.role || 'Client'}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full sm:w-auto bg-camel text-italian-roast hover:bg-camel/90 font-medium"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Sauvegarder les modifications'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
