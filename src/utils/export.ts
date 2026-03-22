import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) return
  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('l', 'mm', 'a4')
  const width = pdf.internal.pageSize.getWidth()
  const height = (canvas.height * width) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(filename)
}

export function exportToMarkdown(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`
  const separator = `| ${headers.map(() => '---').join(' | ')} |`
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n')
  return `${headerRow}\n${separator}\n${dataRows}`
}
