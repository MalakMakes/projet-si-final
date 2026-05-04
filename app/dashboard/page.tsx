'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { MetricCard } from '@/components/metric-card'
import { ConsultationsTable } from '@/components/consultations-table'
import { ConsultationModal } from '@/components/consultation-modal'
import { Button } from '@/components/ui/button'
import { Users, FolderOpen, FileText, Plus } from 'lucide-react'

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenue, Me. Dupont. Voici un aperçu de votre activité.
          </p>
        </div>

        {/* Metrics Section */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Consultations"
            value="124"
            icon={Users}
            trend={{ value: 12, label: 'ce mois' }}
          />
          <MetricCard
            title="Dossiers Actifs"
            value="38"
            icon={FolderOpen}
            trend={{ value: 5, label: 'cette semaine' }}
          />
          <MetricCard
            title="Documents en attente"
            value="7"
            icon={FileText}
            trend={{ value: -2, label: 'depuis hier' }}
          />
        </div>

        {/* Actions Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-camel text-italian-roast hover:bg-camel/90 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle consultation
            </Button>
          </div>
        </div>

        {/* Consultations Table */}
        <ConsultationsTable />

        {/* New Consultation Modal */}
        <ConsultationModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </main>
    </div>
  )
}
