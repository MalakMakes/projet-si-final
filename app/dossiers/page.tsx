import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus, Calendar, User } from 'lucide-react'

const dossiers = [
  {
    id: '1',
    title: 'Succession Famille Bernard',
    client: 'Marie Bernard',
    type: 'Droit de la famille',
    date: '15 Mars 2024',
    status: 'actif',
  },
  {
    id: '2',
    title: 'Litige Commercial SARL Dupont',
    client: 'SARL Dupont',
    type: 'Droit des affaires',
    date: '10 Mars 2024',
    status: 'actif',
  },
  {
    id: '3',
    title: 'Contrat de travail - Martin',
    client: 'Jean Martin',
    type: 'Droit du travail',
    date: '5 Fév 2024',
    status: 'archive',
  },
  {
    id: '4',
    title: 'Acquisition immobilière',
    client: 'Sophie Legrand',
    type: 'Droit immobilier',
    date: '28 Jan 2024',
    status: 'actif',
  },
]

export default function DossiersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Dossiers
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gérez tous vos dossiers juridiques en cours et archivés.
            </p>
          </div>
          <Button className="bg-camel text-italian-roast hover:bg-camel/90 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau dossier
          </Button>
        </div>

        {/* Dossiers Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {dossiers.map((dossier) => (
            <Card 
              key={dossier.id}
              className="group border-border/50 bg-card transition-all hover:border-camel/30 hover:shadow-lg hover:shadow-camel/5 cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-camel/10 text-camel">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-lg text-foreground">
                        {dossier.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{dossier.type}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      dossier.status === 'actif'
                        ? 'bg-boho/20 text-camel border-boho/30'
                        : 'bg-muted text-muted-foreground border-border/50'
                    }
                  >
                    {dossier.status === 'actif' ? 'Actif' : 'Archivé'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{dossier.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{dossier.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
