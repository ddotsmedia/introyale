// Facts Register rendering rule: only verified facts render; anything else is null (SPEC §5.2, D13).
export type FactRow = {
  key: string
  status: 'unverified' | 'verified' | 'retired'
  displayText?: string | null
  value?: string | null
}

export function pickVerifiedFact(rows: FactRow[], key: string): string | null {
  const row = rows.find((r) => r.key === key && r.status === 'verified')
  return row ? (row.displayText ?? row.value ?? null) : null
}
