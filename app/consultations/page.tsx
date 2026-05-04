'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { ConsultationsTable } from '@/components/consultations-table'
import { ConsultationModal } from '@/components/consultation-modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ConsultationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Consultations
            </h1>
            <p className="mt-2 text-muted-foreground">
              Suivez et gérez toutes vos consultations clients.
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-camel text-italian-roast hover:bg-camel/90 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle consultation
          </Button>
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
