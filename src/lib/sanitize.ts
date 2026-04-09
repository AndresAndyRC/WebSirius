/**
 * Server-safe HTML sanitizer para contenido de Supabase renderizado con set:html
 * Elimina tags y atributos peligrosos sin requerir un DOM
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Eliminar tags peligrosos con su contenido
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  clean = clean.replace(/<object[\s\S]*?<\/object>/gi, '');
  clean = clean.replace(/<embed[\s\S]*?>/gi, '');
  clean = clean.replace(/<form[\s\S]*?<\/form>/gi, '');
  clean = clean.replace(/<input[\s\S]*?>/gi, '');

  // Eliminar event handlers on*
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Eliminar URLs javascript: y data: en href/src
  clean = clean.replace(/href\s*=\s*["']\s*javascript:/gi, 'href="');
  clean = clean.replace(/src\s*=\s*["']\s*javascript:/gi, 'src="');
  clean = clean.replace(/href\s*=\s*["']\s*data:/gi, 'href="');

  return clean;
}
