'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { createCase } from '../actions'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PostCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<{ nom_complet: string, role: string } | null>(null)
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    async function getProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profils')
          .select('nom_complet, role')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          if (data.role === 'avocat') {
            router.push('/dashboard')
            toast.error("Les avocats ne peuvent pas créer de dossiers.")
          }
        }
      } else {
        router.push('/login')
      }
    }
    getProfile()
  }, [router])
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    // Capture data early before any async calls
    const formData = new FormData(event.currentTarget)

    try {
      const supabase = createClient()
      const fileUrls: string[] = []

      console.log("Starting file uploads for", files.length, "files...")

      // 1. Upload files to Storage
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `cases/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('case-files')
          .upload(filePath, file)

        if (uploadError) {
          console.error("Storage Upload Error:", uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('case-files')
          .getPublicUrl(filePath)
          
        fileUrls.push(publicUrl)
      }

      console.log("Files uploaded successfully. Creating case record...")

      // 2. Create the case record
      const result = await createCase(formData, fileUrls)

      if (result?.error) {
        console.error("Database Error:", result.error)
        toast.error(result.error)
      } else {
        toast.success('Votre dossier a été publié avec succès')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error("Submission Catch Block Error:", error)
      toast.error(error.message || 'Une erreur est survenue lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      
      <main className="container mx-auto px-6 py-12">
        <Card className="max-w-2xl mx-auto border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Publier mon dossier</CardTitle>
            <CardDescription>
              Décrivez votre cas en détail pour qu'un avocat puisse vous assister.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du cas</Label>
                <Input id="titre" name="titre" placeholder="Ex: Litige locatif, Divorce, etc." required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Expliquez votre situation..." 
                  className="min-h-[150px]"
                  required 
                />
              </div>

              <div className="space-y-4">
                <Label>Documents et fichiers</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Cliquez pour uploader</span> or glissez-déposez
                      </p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="grid gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 shrink-0 text-camel" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-camel text-italian-roast hover:bg-camel/90 font-medium py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publication en cours...
                    </>
                  ) : (
                    'Publier le dossier'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1 py-6"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
