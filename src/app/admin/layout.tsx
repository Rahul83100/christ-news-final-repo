export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col w-full min-h-screen bg-christ-silver font-sans text-christ-dark overflow-x-hidden">
            {children}
        </div>
    )
}
