-- Policies for 'cas' (Dossiers)
-- Allow clients to delete their own dossiers
CREATE POLICY "Clients can delete their own cases" 
ON public.cas 
FOR DELETE 
USING (auth.uid() = client_id);

-- Policies for 'appointments' (Rendez-vous)
-- Allow clients or avocats to delete appointments they are part of
CREATE POLICY "Users can delete their own appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.uid() = client_id OR auth.uid() = avocat_id);

-- Ensure cascading deletes for candidatures if a case is deleted
-- (This should usually be handled by the Foreign Key constraint: ON DELETE CASCADE)
-- But if you need a policy for manual deletion:
CREATE POLICY "Users can delete candidatures of their cases" 
ON public.candidatures 
FOR DELETE 
USING (
  auth.uid() = avocat_id OR 
  EXISTS (
    SELECT 1 FROM public.cas 
    WHERE id = candidatures.cas_id AND client_id = auth.uid()
  )
);
