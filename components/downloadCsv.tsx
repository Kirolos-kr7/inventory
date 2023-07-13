import Download from '@iconify/icons-mdi/microsoft-excel'
import { Icon } from '@iconify/react/dist/offline'
import Button from './button'

const DownloadCsv = ({
  fileName = 'File',
  disabled = false
}: {
  fileName?: string
  disabled?: boolean
}) => {
  const download = () => {
    const data: string[][] = []
    const table = document.querySelector(`table`)
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
    trigger.setAttribute('download', `${fileName}.csv`)
    trigger.click()
  }

  return (
    <Button
      className={`p-1.5 sm:p-3 h-auto min-h-fit ${disabled && 'btn-disabled'}`}
      onClick={download}
    >
      <Icon icon={Download} width={20} />
    </Button>
  )
}

export default DownloadCsv
