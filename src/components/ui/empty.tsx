export default function Empty({ text = 'Tidak ada data' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <div className="text-4xl">📭</div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}
