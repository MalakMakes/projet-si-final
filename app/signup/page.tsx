import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { signup } from "../login/actions"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg border-muted/60">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-base">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="nom_complet">Full Name</Label>
              <Input 
                id="nom_complet" 
                name="nom_complet" 
                type="text" 
                placeholder="John Doe" 
                required 
              />
            </div>
            
            <div className="space-y-3 text-left">
              <Label>I am a...</Label>
              <RadioGroup name="role" defaultValue="client" className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="role-client" />
                  <Label htmlFor="role-client" className="font-normal cursor-pointer">Client seeking legal advice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avocat" id="role-avocat" />
                  <Label htmlFor="role-avocat" className="font-normal cursor-pointer">Avocat (Lawyer)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                minLength={6}
              />
            </div>
            
            {message && (
              <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                {message}
              </div>
            )}
            
            <Button className="w-full text-base py-6 mt-2 transition-all hover:scale-[1.02]" type="submit">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t p-6 bg-muted/10">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
