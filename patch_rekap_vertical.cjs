const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `      <div className="neo-card p-4 sm:p-6 w-full overflow-hidden mb-6">
        <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg mb-4 text-center sm:text-left uppercase">TOTAL REKAP SEMUA DAPUR</h3>
        
        <div className="flex flex-col xl:flex-row gap-4 items-stretch overflow-x-auto pb-2">
          
          <div className="flex-none w-full xl:w-auto xl:min-w-[280px] flex flex-col gap-2 text-xs sm:text-sm bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
            <div className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total Pagu BB</span>
              <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(totalPagu)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO SPPG</span>
              <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(totalSppg)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Sisa Pagu</span>
              <span className={\`font-black text-xs sm:text-sm \${marginPaguSppg < 0 ? 'text-red-500' : 'text-blue-custom'}\`}>Rp {formatRp(marginPaguSppg)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO Koperasi</span>
              <span className="font-black text-green-custom text-xs sm:text-sm">Rp {formatRp(totalKoperasi)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO Supplier</span>
              <span className="font-black text-red-500 text-xs sm:text-sm">Rp {formatRp(totalSupplier)}</span>
            </div>
          </div>

          <div className="flex-none w-full xl:w-auto flex gap-2">
            <div className="flex flex-col items-center justify-center text-center neo-box p-3 bg-blue-50/10 min-w-[100px]">
               <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Utama</span>
               <span className="font-black text-blue-custom text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginUtama)}</span>
               <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseUtama.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center neo-box p-3 bg-green-50/10 min-w-[100px]">
               <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Kop.</span>
               <span className="font-black text-green-custom text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginKoperasi)}</span>
               <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseKoperasi.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center neo-box p-3 bg-emerald-50/10 min-w-[100px]">
               <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Yay.</span>
               <span className="font-black text-emerald-600 text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginYayasan)}</span>
               <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseYayasan.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex-none w-full xl:w-auto flex flex-col justify-center neo-box p-3 bg-blue-50/20 border-l-4 border-blue-custom min-w-[200px]">
            <span className="text-[10px] text-gray-500 uppercase font-bold mb-1 leading-none">Insentif</span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl sm:text-2xl font-black text-blue-custom leading-none">{totalPm}</span>
              <span className="text-[10px] font-bold text-muted">PM</span>
            </div>
            <div className="border-t border-black/5 pt-1.5 flex flex-col gap-1 text-[10px] sm:text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Total Insentif</span>
                <span className="font-black text-blue-custom">Rp {formatRp(totalPmRupiah)}</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-blue-custom">Uang Masuk</span>
                <span className="font-black text-blue-custom">Rp {formatRp(totalKoperasi + totalPmRupiah)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-none w-full xl:w-auto flex gap-2">
            <div className="neo-box p-3 flex flex-col justify-center bg-blue-50/10 min-w-[160px]">
              <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Pendapatan Bersih 1</span>
              <span className="font-black text-blue-custom text-sm">Rp {formatRp(pendapatanBersihUtama)}</span>
              <span className="text-[8px] text-muted font-bold mt-0.5">Margin Utama + Insentif</span>
            </div>
            <div className="neo-box p-3 flex flex-col justify-center bg-green-50/10 min-w-[160px]">
              <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Pendapatan Bersih 2</span>
              <span className="font-black text-green-custom text-sm">Rp {formatRp(pendapatanBersihKoperasi)}</span>
              <span className="text-[8px] text-muted font-bold mt-0.5">Margin Koperasi + Insentif</span>
            </div>
          </div>
          
          <div className="flex-none w-full xl:w-auto neo-box p-3 flex flex-col justify-center bg-amber-50/30 border-l-4 border-amber-500 min-w-[220px]">
            <span className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Kalkulator Bagi Hasil</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <input 
                  type="number" 
                  value={bagiHasilPersen}
                  onChange={(e) => setBagiHasilPersen(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-12 p-1 text-sm font-black text-center border-2 border-black/10 rounded-lg focus:outline-none focus:border-amber-500 bg-white shadow-inner transition-colors"
                  min="0"
                  max="100"
                />
                <span className="ml-1 font-black text-gray-600 text-xs">%</span>
              </div>
              <div className="flex-1 flex flex-col border-l border-black/10 pl-3">
                <span className="text-[8px] text-muted font-bold mb-0.5">Hasil Pembagian:</span>
                <span className="font-black text-amber-600 text-sm leading-none">
                  Rp {formatRp(Number(bagiHasilPersen) > 0 ? (pendapatanBersihKoperasi * Number(bagiHasilPersen)) / 100 : 0)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>`;

const replacement = `      <div className="neo-card p-4 sm:p-6 w-full mb-6">
        <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg mb-4 text-center sm:text-left uppercase">TOTAL REKAP SEMUA DAPUR</h3>
        
        <div className="flex flex-col gap-4">
          
          {/* Row 1: Metrics & Margins & Insentif */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            <div className="flex flex-col gap-2 text-xs sm:text-sm bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
              <div className="flex items-center justify-between border-b border-black/5 pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total Pagu BB</span>
                <span className="font-black text-blue-custom text-xs sm:text-base">Rp {formatRp(totalPagu)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO SPPG</span>
                <span className="font-black text-blue-custom text-xs sm:text-base">Rp {formatRp(totalSppg)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Sisa Pagu</span>
                <span className={\`font-black text-xs sm:text-base \${marginPaguSppg < 0 ? 'text-red-500' : 'text-blue-custom'}\`}>Rp {formatRp(marginPaguSppg)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO Koperasi</span>
                <span className="font-black text-green-custom text-xs sm:text-base">Rp {formatRp(totalKoperasi)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total PO Supplier</span>
                <span className="font-black text-red-500 text-xs sm:text-base">Rp {formatRp(totalSupplier)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 h-full items-stretch">
              <div className="flex flex-col items-center justify-center text-center neo-box p-2 bg-blue-50/10">
                 <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Utama</span>
                 <span className="font-black text-blue-custom text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginUtama)}</span>
                 <span className="text-[7px] sm:text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseUtama.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center neo-box p-2 bg-green-50/10 border-l border-r border-black/5">
                 <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Kop.</span>
                 <span className="font-black text-green-custom text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginKoperasi)}</span>
                 <span className="text-[7px] sm:text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseKoperasi.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center neo-box p-2 bg-emerald-50/10">
                 <span className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Yay.</span>
                 <span className="font-black text-emerald-600 text-xs sm:text-sm mb-1 leading-none">Rp {formatRp(marginYayasan)}</span>
                 <span className="text-[7px] sm:text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseYayasan.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex flex-col justify-center neo-box p-3 sm:p-4 bg-blue-50/20 border-l-4 border-blue-custom">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold mb-1 leading-none">Insentif</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl sm:text-3xl font-black text-blue-custom leading-none">{totalPm}</span>
                <span className="text-xs font-bold text-muted">PM</span>
              </div>
              <div className="border-t border-black/5 pt-2 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Total Insentif <span className="lowercase font-normal text-[8px] sm:text-[9px] text-muted">(x Rp 2.000)</span></span>
                  <span className="font-black text-blue-custom text-xs sm:text-base">Rp {formatRp(totalPmRupiah)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-blue-100">
                  <span className="text-[9px] sm:text-[10px] text-blue-custom uppercase font-black">Total Uang Masuk <span className="lowercase font-normal text-[8px] sm:text-[9px] text-muted block">(PO Koperasi + Insentif)</span></span>
                  <span className="font-black text-blue-custom text-xs sm:text-base">Rp {formatRp(totalKoperasi + totalPmRupiah)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Row 2: Pendapatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <div className="neo-box p-3 sm:p-4 flex flex-col justify-center bg-blue-50/10">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Pendapatan Bersih 1</span>
              <span className="font-black text-blue-custom text-sm sm:text-lg">Rp {formatRp(pendapatanBersihUtama)}</span>
              <span className="text-[9px] sm:text-[10px] text-muted font-bold mt-1">Margin Utama + Insentif</span>
            </div>
            <div className="neo-box p-3 sm:p-4 flex flex-col justify-center bg-green-50/10">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Pendapatan Bersih 2</span>
              <span className="font-black text-green-custom text-sm sm:text-lg">Rp {formatRp(pendapatanBersihKoperasi)}</span>
              <span className="text-[9px] sm:text-[10px] text-muted font-bold mt-1">Margin Koperasi + Insentif (Tanpa Yayasan)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="neo-box p-4 sm:p-6 bg-amber-50/30 border-l-4 border-amber-500">
          <span className="text-xs sm:text-sm text-gray-600 uppercase font-bold block mb-3">Kalkulator Bagi Hasil (Berdasarkan Pendapatan Bersih 2)</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <input 
                type="number" 
                value={bagiHasilPersen}
                onChange={(e) => setBagiHasilPersen(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-20 p-2 sm:p-3 text-base sm:text-lg font-black text-center border-2 border-black/10 rounded-xl focus:outline-none focus:border-amber-500 bg-white shadow-inner transition-colors"
                min="0"
                max="100"
              />
              <span className="ml-2 font-black text-gray-600 text-sm sm:text-base">%</span>
            </div>
            <div className="flex-1 flex flex-col sm:border-l sm:border-black/10 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10">
              <span className="text-[10px] sm:text-xs text-muted font-bold mb-1">Hasil Pembagian:</span>
              <span className="font-black text-amber-600 text-lg sm:text-2xl leading-none">
                Rp {formatRp(Number(bagiHasilPersen) > 0 ? (pendapatanBersihKoperasi * Number(bagiHasilPersen)) / 100 : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
