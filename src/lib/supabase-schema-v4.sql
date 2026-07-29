-- Brota — Schema v4: hardening de seguridad del catálogo público
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de v1, v2 y v3.

-- ===========================================================
-- 1. NO FILTRAR EL COSTO DE LAS VARIANTES EN EL CATÁLOGO PÚBLICO
-- ===========================================================
-- catalog_products devolvía la columna `variants` completa, y cada
-- variante incluye `costPrice` (el costo del producto). Cualquier
-- visitante del catálogo podía ver el margen del negocio abriendo las
-- herramientas de desarrollador del navegador. Se reconstruye el JSON
-- sacando `costPrice` de cada variante antes de devolverlo.
drop function if exists public.catalog_products(text);
create or replace function public.catalog_products(p_slug text)
returns table (id uuid, name text, sale_price numeric, stock integer, image_url text, variants jsonb)
language sql stable security definer set search_path = public
as $$
  select
    p.id, p.name, p.sale_price, p.stock, p.image_url,
    case
      when p.variants is null then null
      else (
        select jsonb_agg(v - 'costPrice')
        from jsonb_array_elements(p.variants) v
      )
    end as variants
  from products p
  join businesses b on b.id = p.business_id
  where b.slug = p_slug
  order by p.name;
$$;

grant execute on function public.catalog_products(text) to anon, authenticated;

-- ===========================================================
-- 2. LIMITAR TIPO Y TAMAÑO DE ARCHIVO EN EL BUCKET PÚBLICO
-- ===========================================================
-- Las políticas de Storage ya restringen quién puede subir (solo el
-- dueño del negocio, a su propia carpeta), pero no qué puede subir.
-- Esto limita el bucket a imágenes reales de hasta 5MB, para que nadie
-- pueda subir archivos arbitrarios (HTML, ejecutables, etc.) al bucket
-- público ni agotar espacio con archivos gigantes.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880 -- 5 MB
where id = 'product-images';
