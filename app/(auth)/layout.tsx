export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf5] to-[#e6f4ec] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#1B6B4A] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🐟</span>
            </div>
            <span className="text-2xl font-bold text-[#1B6B4A]">StockBoard</span>
          </div>
          <p className="text-sm text-gray-500">Live livestock availability for the aquarium hobby</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
