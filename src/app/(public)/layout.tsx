import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Preloader from '@/components/Preloader'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Preloader />
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </>
    )
}
