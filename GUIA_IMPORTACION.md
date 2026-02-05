# Guía de Importación Masiva de Productos

Esta guía te ayudará a transformar tu Excel en el formato correcto para importarlo a Supabase y actualizar las categorías.

## 1. Actualización de Categoría "Afrodisíacos"
Antes de importar nuevos productos, actualicemos los existentes en la base de datos para que usen el nuevo nombre "Vigorizzanti".

Ve al **SQL Editor** en tu panel de Supabase y ejecuta este script:

```sql
UPDATE products
SET category = 'Vigorizzanti'
WHERE category = 'Afrodisiacos';
```

## 2. Preparar el Excel (CSV)
Supabase requiere que el archivo sea `.csv` (Valores Separados por Comas).
Asegúrate de que la primera fila de tu Excel tenga **EXACTAMENTE** estos nombres de columnas (en minúsculas y guiones bajos):

| Columna Excel (Header) | Descripción | Ejemplo |
|------------------------|-------------|---------|
| `name` | Nombre del producto | Aceite de Masaje |
| `subtitle` | Subtítulo corto | Relax y Aroma |
| `category` | **Vigorizzanti**, **Olio commestibile**, **Gioco**, Fragancias, etc. | Vigorizzanti |
| `price` | Precio (solo números, usar punto para decimales) | 25.50 |
| `stock` | Cantidad disponible | 50 |
| `code` | Código SKU | REF-001 |
| `brand` | Marca | Sexitive |
| `description` | Descripción principal | Un aceite suave... |
| `description_additional` | Descripción larga (para acordeón) | Detalles extra... |
| `size_ml` | Tamaño (ej. 100ml o Talle) | 100ml |
| `usage` | Modo de uso (texto) | Aplicar suavemente... |
| `ingredients` | Ingredientes | Aqua, Glycerin... |
| `tips` | Consejos Perla Negra | Usar con música... |
| `sensation` | Sensación (bullets) | Calior • Suave |
| `image_url` | **OPCIONAL**. Dejar vacío para que el sistema asigne la imagen por defecto según la categoría. | |

### Notas:
- **Imágenes:** Si dejas la columna `image_url` vacía, mi código asignará automáticamente la imagen de lujo correspondiente (`gioco.png`, `olio.png`, etc.) que ya subiste.
- **Formato:** Al guardar en Excel, elige "Guardar como" -> "CSV (delimitado por comas) (*.csv)".

## 3. Importar a Supabase
1. Ve a tu proyecto en Supabase -> **Table Editor**.
2. Selecciona la tabla `products`.
3. Haz clic en **Insert** -> **Import Data from CSV**.
4. Arrastra tu archivo `.csv`.
5. Revisa que las columnas coincidan y haz clic en **Import**.

## 4. Verificación
Una vez importado, ve a tu sitio web (Productos) y verifica:
- Que los productos nuevos de "Gioco" tengan la imagen de los dados/cartas.
- Que los aceites tengan la imagen dorada.
- Que los antiguos "Afrodisíacos" ahora digan "Vigorizzanti".
