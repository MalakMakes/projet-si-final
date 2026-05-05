'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, ArrowLeft, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { id: casId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [cas, setCas] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadChat() {
      const supabase = createClient()
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) return router.push('/login')
      setUser(userData)

      // Fetch profile
      const { data: prof } = await supabase.from('profils').select('*').eq('id', userData.id).single()
      setProfile(prof)

      // Fetch case details
      const { data: casData } = await supabase.from('cas').select('*, client:profils!client_id(nom_complet), avocat:profils!avocat_id(nom_complet)').eq('id', casId).single()
      setCas(casData)

      // Initial messages fetch
      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .eq('cas_id', casId)
        .order('created_at', { ascending: true })
      
      if (msgsError) {
        console.error("Fetch Messages Error:", msgsError)
      } else {
        console.log("Initial Messages:", msgs)
        setMessages(msgs || [])
      }
      setLoading(false)

      // Subscribe to real-time messages
      const channel = supabase
        .channel(`chat:${casId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `cas_id=eq.${casId}` 
        }, (payload) => {
          console.log("New Realtime Message:", payload.new)
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    loadChat()
  }, [casId, router])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    const supabase = createClient()
    const msg = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      cas_id: casId,
      sender_id: user.id,
      content: msg
    })

    if (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-camel" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar profile={profile} />
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="font-serif text-lg font-semibold">{cas?.titre}</h1>
            <p className="text-xs text-muted-foreground">Chat avec {profile?.role === 'client' ? cas?.avocat?.nom_complet : cas?.client?.nom_complet}</p>
          </div>
          <div className="w-20"></div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic">
                Commencez la discussion...
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-camel/20 text-camel text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "max-w-[70%] px-4 py-2 rounded-2xl text-sm",
                      isMe 
                        ? "bg-camel text-italian-roast rounded-br-none" 
                        : "bg-muted text-foreground rounded-bl-none border border-border/50"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input 
                placeholder="Votre message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-background border-border/50 focus:border-camel/50"
              />
              <Button type="submit" className="bg-camel text-italian-roast hover:bg-camel/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  )
}
