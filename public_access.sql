-- 1. Mevcut kısıtlayıcı politikaları temizle (Hata almamak için)
drop policy if exists "Allow write access for authenticated users" on public.projects;
drop policy if exists "Public can insert projects" on public.projects;
drop policy if exists "Public can update projects" on public.projects;
drop policy if exists "Public can delete projects" on public.projects;

-- 2. Projects tablosunu herkese aç (Ekleme, Düzenleme, Silme)
create policy "Public can insert projects"
on public.projects for insert
with check (true);

create policy "Public can update projects"
on public.projects for update
using (true);

create policy "Public can delete projects"
on public.projects for delete
using (true);

-- 3. Messages tablosunu herkese aç (Zaten açıktı ama garanti olsun)
drop policy if exists "Public can insert messages" on public.messages;
create policy "Public can insert messages"
on public.messages for insert
with check (true);

-- 4. RLS'i etkinleştir (Güvenlik katmanı açık kalsın ama kurallarımız geçerli olsun)
alter table public.projects enable row level security;
alter table public.messages enable row level security;
