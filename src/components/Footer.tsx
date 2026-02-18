export default function Footer() {
  return (
    <footer className="border-t border-cream-300 bg-cream-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="font-display font-bold text-forest-900">Christ University</p>
            <p className="text-xs text-forest-600 mt-1">Excellence and Service</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-forest-600">
              &copy; {new Date().getFullYear()} Newsletter Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}