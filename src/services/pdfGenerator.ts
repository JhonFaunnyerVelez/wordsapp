import jsPDF from 'jspdf'

export interface WrongAnswer {
  word: string
  translation: string
  userAnswer: string
}

export function generatePDF(wrongAnswers: WrongAnswer[], mode: 'es-en' | 'en-es' | null) {
  const doc = new jsPDF()
  
  // Configuración del PDF optimizada
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15 // Reducido de 20 a 15
  
  // Título más compacto
  doc.setFontSize(16) // Reducido de 18 a 16
  doc.setFont('helvetica', 'bold')
  const title = mode === 'es-en' ? 'Palabras para Estudiar - Español → Inglés' : 
                mode === 'en-es' ? 'Palabras para Estudiar - Inglés → Español' :
                'Palabras para Estudiar'
  doc.text(title, margin, margin + 8)
  
  // Información más compacta
  doc.setFontSize(10) // Reducido de 12 a 10
  doc.setFont('helvetica', 'normal')
  doc.text(`Total: ${wrongAnswers.length} palabras`, margin, margin + 18)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, margin + 26)
  
  // Línea separadora más fina
  doc.setLineWidth(0.3) // Reducido de 0.5 a 0.3
  doc.line(margin, margin + 32, pageWidth - margin, margin + 32)
  
  // Variables optimizadas para más contenido
  let yPosition = margin + 40 // Reducido de 55 a 40
  const lineHeight = 6 // Reducido de 8 a 6
  const maxHeight = pageHeight - margin - 15 // Más espacio para contenido
  
  // Encabezados más compactos
  doc.setFontSize(9) // Reducido de 10 a 9
  doc.setFont('helvetica', 'bold')
  
  // Columnas optimizadas para mejor uso del espacio
  const col1 = margin + 8  // Número
  const col2 = margin + 25 // Palabra original
  const col3 = margin + 85 // Traducción correcta
  const col4 = margin + 145 // Tu respuesta
  
  // Encabezados en una sola línea
  doc.text('#', col1, yPosition)
  doc.text('Palabra', col2, yPosition)
  doc.text('Correcta', col3, yPosition)
  doc.text('Tu Respuesta', col4, yPosition)
  
  yPosition += 10 // Reducido de 15 a 10
  
  // Línea debajo de encabezados más fina
  doc.setLineWidth(0.2)
  doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3)
  
  // Contenido optimizado - orden descendente (más reciente primero)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8) // Reducido de 9 a 8
  
  // Invertir el array para mostrar las más recientes primero
  const reversedAnswers = [...wrongAnswers].reverse()
  
  reversedAnswers.forEach((item, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > maxHeight) {
      doc.addPage()
      yPosition = margin + 20
    }
    
    // Número de palabra más pequeño (orden original)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    const originalIndex = wrongAnswers.length - index // Convertir índice invertido al original
    doc.text(`${originalIndex}`, col1, yPosition)
    
    // Palabra original - más ancha
    doc.setFont('helvetica', 'normal')
    const wordText = doc.splitTextToSize(item.word, 55) // Aumentado de 50 a 55
    doc.text(wordText, col2, yPosition)
    
    // Traducción correcta
    const correctText = doc.splitTextToSize(item.translation, 55) // Aumentado de 50 a 55
    doc.text(correctText, col3, yPosition)
    
    // Respuesta del usuario (en rojo para indicar error)
    doc.setTextColor(255, 0, 0) // Rojo
    const userText = doc.splitTextToSize(item.userAnswer, 55) // Aumentado de 50 a 55
    doc.text(userText, col4, yPosition)
    doc.setTextColor(0, 0, 0) // Volver a negro
    
    // Calcular la altura máxima de las cuatro columnas
    const wordHeight = wordText.length * lineHeight
    const correctHeight = correctText.length * lineHeight
    const userHeight = userText.length * lineHeight
    const maxItemHeight = Math.max(wordHeight, correctHeight, userHeight)
    
    yPosition += maxItemHeight + 2 // Reducido de 5 a 2
    
    // Línea separadora más sutil (solo cada 5 palabras para ahorrar espacio)
    if (index < reversedAnswers.length - 1 && (index + 1) % 5 === 0) {
      doc.setLineWidth(0.1)
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, yPosition - 1, pageWidth - margin, yPosition - 1)
      doc.setDrawColor(0, 0, 0) // Volver a negro
      yPosition += 2
    }
  })
  
  // Pie de página más compacto
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7) // Reducido de 8 a 7
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150) // Más sutil
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 25,
      pageHeight - 8
    )
    doc.text(
      'AppWords',
      margin,
      pageHeight - 8
    )
    doc.setTextColor(0, 0, 0) // Volver a negro
  }
  
  // Descargar el PDF
  const fileName = mode === 'es-en' ? 'palabras-para-estudiar-español-ingles.pdf' :
                   mode === 'en-es' ? 'palabras-para-estudiar-ingles-español.pdf' :
                   'palabras-para-estudiar.pdf'
  
  doc.save(fileName)
}
