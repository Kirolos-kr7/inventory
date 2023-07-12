export const downloadCsvFile = (tableId: string) => {
  const data: string[][] = []
  const table = document.querySelector(`#${tableId}`)
  if (!table) return

  const rows = Array.from(table.querySelectorAll('tr'))

  rows.forEach((row) => {
    const rowData = Array.from(row.querySelectorAll('td, th'))
    data.push(rowData.map((el) => el.textContent || '0'))
  })

  let csvContent = data.join('\n')

  const trigger = document.createElement('a')
  var blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8'
  })
  var url = URL.createObjectURL(blob)
  trigger.href = url
  trigger.setAttribute('download', `${tableId.toUpperCase()}.csv`)
  trigger.click()
}
