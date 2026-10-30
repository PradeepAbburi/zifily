create policy "Providers can upload own portfolio images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and auth.uid() = (storage.foldername(name))[1]::uuid);

create policy "Providers can view own portfolio images"
  on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and auth.uid() = (storage.foldername(name))[1]::uuid);

create policy "Providers can update own portfolio images"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and auth.uid() = (storage.foldername(name))[1]::uuid);

create policy "Providers can delete own portfolio images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and auth.uid() = (storage.foldername(name))[1]::uuid);