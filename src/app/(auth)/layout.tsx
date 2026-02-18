export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-christ-silver p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-christ-blue tracking-tighter mb-3">
                        CHRIST <span className="text-christ-gold">CHRONICLE</span>
                    </h1>
                    <p className="text-christ-dark/60 font-serif italic text-lg">
                        Department of Professional Studies
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
