-- Admin panelinin mesajları okuyabilmesi için gerekli SQL komutları

-- 1. ADIM: Mevcut kısıtlayıcı politikayı kaldırın (Hata verirse önemsemeyin)
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;

-- 2. ADIM: Mesajları okumak için yeni izin verin
CREATE POLICY "Enable read access for all users"
ON public.messages FOR SELECT
USING (true);

-- Not: Bu işlemden sonra Admin panelindeki Mesajlar sayfasına gidip sayfayı yenileyin.
