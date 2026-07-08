import { supabase } from './supabase'

// Comprime la foto en el dispositivo (max 800px, JPEG 80%) para que
// la subida sea rápida incluso con datos móviles
export function compressImage(file: File, maxDim = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('blob'))),
        'image/jpeg',
        0.8
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

// Sube la foto al bucket público y devuelve su URL, o null si falló
// (por ejemplo, sin conexión: las fotos requieren estar online)
export async function uploadProductImage(
  businessId: string,
  file: File
): Promise<string | null> {
  try {
    const blob = await compressImage(file)
    const path = `${businessId}/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}
