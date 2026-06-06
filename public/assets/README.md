# Guía de assets

## Uso de nombres
- `logo.svg`: marca principal para el header y favicons.
- `icon-book.svg`: icono de biblioteca / libros para botones y etiquetas.

## Reglas de uso
- Usa `--color-primary` para acciones principales y enlaces activos.
- Usa `--color-muted` para textos secundarios y descripciones.
- Mantén los assets en formato SVG para íconos y logos, esto facilita la escala y la optimización.

## Estructura
- `assets/` contiene solo recursos de interfaz reutilizables.
- No coloques imágenes de datos user-generated en esta carpeta.

## Accesibilidad
- Siempre incluye `alt` descriptivo en imágenes de contenido.
- Para logos decorativos usa `alt=""` y `aria-hidden="true"` si no aportan contenido adicional.

## Paleta y tipografía
- Usa `--color-primary` para acciones principales y botones de llamada a la acción.
- Usa `--color-secondary` para enlaces secundarios y detalles suaves.
- Usa `--color-success`, `--color-warning` y `--color-danger` para estados de validación.
- Usa `--color-text` para textos principales y `--color-muted` para textos de apoyo.
- Encabezados y títulos deben usar `Cormorant Garamond`.
- Textos de formulario y contenido continuo deben usar `Inter` o la fuente del sistema.
- Mantén buen contraste en botones y mensajes para accesibilidad.
