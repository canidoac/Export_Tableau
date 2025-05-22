// Variables globales
let tableau
let worksheet
let dataTable
let gapi // Declare gapi

// Inicializar la extensión de Tableau
document.addEventListener("DOMContentLoaded", () => {
  tableau = window.tableau

  tableau.extensions
    .initializeAsync()
    .then(() => {
      // Obtener la hoja de trabajo activa
      if (tableau.extensions.dashboardContent.dashboard.worksheets.length > 0) {
        worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0]
        updateStatus(`Conectado a: ${worksheet.name}`)

        // Cargar información de datos
        loadDataInfo()
      } else {
        updateStatus("No se encontraron hojas de trabajo")
        document.getElementById("dataInfo").textContent = "No hay datos disponibles"
      }

      // Configurar event listeners
      document.getElementById("exportCSV").addEventListener("click", exportToCSV)
      document.getElementById("exportGSheets").addEventListener("click", toggleGSheetsOptions)
      document.getElementById("createSheet").addEventListener("click", exportToGSheets)
    })
    .catch((error) => {
      updateStatus("Error al inicializar: " + error.message, true)
    })
})

// Cargar información de los datos disponibles
function loadDataInfo() {
  worksheet
    .getSummaryDataAsync()
    .then((data) => {
      dataTable = data

      const rowCount = data.totalRowCount
      const columnCount = data.columns.length

      document.getElementById("dataInfo").textContent = `Datos disponibles: ${rowCount} filas, ${columnCount} columnas`
    })
    .catch((error) => {
      document.getElementById("dataInfo").textContent = "Error al cargar datos: " + error.message
    })
}

// Actualizar el estado de la extensión
function updateStatus(message, isError = false) {
  const statusElement = document.getElementById("status")
  statusElement.textContent = message

  if (isError) {
    statusElement.classList.add("text-red-500")
    statusElement.classList.remove("text-gray-500")
  } else {
    statusElement.classList.add("text-gray-500")
    statusElement.classList.remove("text-red-500")
  }
}

// Mostrar mensaje de estado de exportación
function showExportStatus(message, isError = false) {
  const statusElement = document.getElementById("exportStatus")
  statusElement.textContent = message
  statusElement.classList.remove("hidden", "bg-green-100", "text-green-800", "bg-red-100", "text-red-800")

  if (isError) {
    statusElement.classList.add("bg-red-100", "text-red-800")
  } else {
    statusElement.classList.add("bg-green-100", "text-green-800")
  }
}

// Exportar datos a CSV
function exportToCSV() {
  if (!dataTable) {
    showExportStatus("No hay datos disponibles para exportar", true)
    return
  }

  try {
    const includeHeaders = document.getElementById("includeHeaders").checked
    const includeAllColumns = document.getElementById("includeAllColumns").checked

    // Convertir datos a CSV
    let csvContent = ""

    // Añadir encabezados si es necesario
    if (includeHeaders) {
      const headers = dataTable.columns.map((column) => `"${column.fieldName}"`)
      csvContent += headers.join(",") + "\n"
    }

    // Añadir filas de datos
    dataTable.data.forEach((row) => {
      const rowValues = row.map((cell) => {
        // Escapar comillas y envolver en comillas si es necesario
        const value = cell.value !== null ? String(cell.value) : ""
        return `"${value.replace(/"/g, '""')}"`
      })
      csvContent += rowValues.join(",") + "\n"
    })

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    // Crear nombre de archivo basado en el nombre de la hoja de trabajo
    const fileName = `${worksheet.name}_export_${new Date().toISOString().slice(0, 10)}.csv`

    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showExportStatus(`Datos exportados exitosamente a ${fileName}`)
  } catch (error) {
    showExportStatus("Error al exportar a CSV: " + error.message, true)
  }
}

// Mostrar/ocultar opciones de Google Sheets
function toggleGSheetsOptions() {
  const options = document.getElementById("gsheetOptions")
  options.classList.toggle("hidden")

  // Si se muestra, inicializar la API de Google
  if (!options.classList.contains("hidden")) {
    initGoogleAPI()
  }
}

// Inicializar la API de Google
function initGoogleAPI() {
  // Cargar la API de Google
  gapi.load("client:auth2", initClient)
}

// Inicializar el cliente de Google
function initClient() {
  // Nota: En una implementación real, estas credenciales deberían estar seguras
  // y no incluidas directamente en el código
  gapi.client
    .init({
      apiKey: "TU_API_KEY",
      clientId: "TU_CLIENT_ID",
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
      scope: "https://www.googleapis.com/auth/spreadsheets",
    })
    .then(() => {
      // Escuchar eventos de inicio de sesión
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)

      // Manejar el estado de inicio de sesión inicial
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
    })
    .catch((error) => {
      showExportStatus("Error al inicializar Google API: " + error.message, true)
    })
}

// Actualizar estado de inicio de sesión
function updateSigninStatus(isSignedIn) {
  if (!isSignedIn) {
    // Si no ha iniciado sesión, solicitar inicio de sesión
    gapi.auth2.getAuthInstance().signIn()
  }
}

// Exportar datos a Google Sheets
function exportToGSheets() {
  if (!dataTable) {
    showExportStatus("No hay datos disponibles para exportar", true)
    return
  }

  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    showExportStatus("Debe iniciar sesión en Google para exportar a Sheets", true)
    gapi.auth2.getAuthInstance().signIn()
    return
  }

  try {
    const sheetName = document.getElementById("sheetName").value || "Datos de Tableau"
    const includeHeaders = document.getElementById("includeHeaders").checked

    // Preparar datos para Google Sheets
    const values = []

    // Añadir encabezados si es necesario
    if (includeHeaders) {
      const headers = dataTable.columns.map((column) => column.fieldName)
      values.push(headers)
    }

    // Añadir filas de datos
    dataTable.data.forEach((row) => {
      const rowValues = row.map((cell) => cell.value)
      values.push(rowValues)
    })

    // Crear una nueva hoja de cálculo
    gapi.client.sheets.spreadsheets
      .create({
        properties: {
          title: `${worksheet.name} - Exportación ${new Date().toLocaleDateString()}`,
        },
        sheets: [
          {
            properties: {
              title: sheetName,
            },
          },
        ],
      })
      .then((response) => {
        const spreadsheetId = response.result.spreadsheetId

        // Actualizar la hoja con los datos
        return gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: "RAW",
          resource: {
            values: values,
          },
        })
      })
      .then((response) => {
        const spreadsheetUrl =
          response.result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${response.result.spreadsheetId}`

        showExportStatus(
          `Datos exportados exitosamente a Google Sheets. <a href="${spreadsheetUrl}" target="_blank" class="underline">Abrir hoja</a>`,
        )
        document.getElementById("exportStatus").innerHTML =
          `Datos exportados exitosamente a Google Sheets. <a href="${spreadsheetUrl}" target="_blank" class="underline">Abrir hoja</a>`
      })
      .catch((error) => {
        showExportStatus("Error al exportar a Google Sheets: " + error.message, true)
      })
  } catch (error) {
    showExportStatus("Error al exportar a Google Sheets: " + error.message, true)
  }
}
