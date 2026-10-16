export default function MeetingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-meeting-bg text-white">
      {children}
    </div>
  )
}
