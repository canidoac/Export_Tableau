# Tableau Data Export Extension

Esta extensión de Tableau permite a los usuarios exportar datos de visualizaciones de Tableau a archivos CSV o directamente a Google Sheets.

## Características

- Exportación de datos a archivos CSV
- Exportación directa a Google Sheets
- Opciones para incluir/excluir encabezados
- Interfaz de usuario intuitiva y fácil de usar

## Requisitos

- Tableau Desktop 2018.2 o posterior
- Tableau Server 2018.2 o posterior (para extensiones alojadas)
- Navegador web moderno (Chrome, Firefox, Edge)
- Para la funcionalidad de Google Sheets:
  - Cuenta de Google
  - Proyecto de Google Cloud con API de Google Sheets habilitada

## Instalación

1. Descarga los archivos de la extensión
2. Coloca los archivos en un servidor web o ejecuta un servidor local
3. En Tableau, ve a "Dashboard" > "Extension" y selecciona el archivo .trex

## Configuración para Google Sheets

Para utilizar la funcionalidad de Google Sheets, necesitarás:

1. Crear un proyecto en Google Cloud Console
2. Habilitar la API de Google Sheets
3. Crear credenciales OAuth 2.0
4. Reemplazar 'TU_API_KEY' y 'TU_CLIENT_ID' en el archivo app.js con tus credenciales

## Uso

1. Añade la extensión a tu dashboard de Tableau
2. Selecciona la hoja de trabajo que contiene los datos que deseas exportar
3. Elige el formato de exportación (CSV o Google Sheets)
4. Configura las opciones de exportación
5. Haz clic en el botón de exportación

## Solución de problemas

- **La extensión no carga**: Verifica que el servidor esté ejecutándose y que la URL en el archivo .trex sea correcta
- **Error al exportar a Google Sheets**: Asegúrate de que las credenciales de Google sean correctas y que hayas iniciado sesión en tu cuenta de Google

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
