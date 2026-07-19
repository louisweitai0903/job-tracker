const STATUS_STYLES: Record<string, string> = {
  Applied: 'bg-[#f8f9fa] text-[#45474c] border border-[#c5c6cd]',
  Interviewing: 'bg-[#d8e2ff] text-[#001a42]',
  Offered: 'bg-[#d1e7dd] text-[#0f5132]',
  Rejected: 'bg-[#ffdad6] text-[#93000a]',
  Withdrawn: 'bg-[#eceef0] text-[#45474c]',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-surface-container-highest text-on-surface-variant'
  return (
    <span className={`inline-flex items-center ${cls} px-sm py-1 rounded text-label-sm font-semibold whitespace-nowrap`}>
      {status}
    </span>
  )
}
