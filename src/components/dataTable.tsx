import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

interface DataTableProps {
  data: Record<string, any>[]
  headers: { key: string; label: string }[]
  label: string
  onClick?: (data: Record<string, any>, index: number) => void
  width?: string
}

const DataTable = ({
  data,
  headers,
  label,
  onClick,
  width,
}: DataTableProps) => (
  <TableContainer component={Paper} sx={{ width: width ?? '100%' }}>
    <Table aria-label={label}>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h.key}>{h.label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow
            key={index}
            hover={!!onClick}
            onClick={onClick ? () => onClick(row, index) : undefined}
            sx={onClick ? { cursor: 'pointer' } : undefined}
          >
            {headers.map((h) => (
              <TableCell key={h.key}>{row[h.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export { DataTable }
