const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `{opsChartData.map((row: any, i) => (
              <div key={row.name} className="neo-box p-2.5 sm:p-4 hover:bg-black/5 transition-colors flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2 sm:mb-4 border-b border-black/5 pb-2 sm:pb-3">
                  <div>
                    <h4 className="font-black text-sm sm:text-lg text-gray-800 flex items-center gap-2">
                      <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full" style={{ backgroundColor: opsColors[i % opsColors.length] }}></span>
                      {row.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs font-bold text-muted mt-0.5">{row.count} Transaksi Ops</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex flex-col items-center justify-center neo-box p-3 sm:p-4 bg-amber-50/20 border border-amber-100">
                     <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Total Sisa Pagu</span>
                     <span className="font-black text-amber-600 text-base sm:text-xl block mb-1">Rp {formatRp(row.sisa_pagu_ops)}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center neo-box p-3 sm:p-4 bg-green-50/20 border border-green-100">
                     <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Total Margin Ops</span>
                     <span className="font-black text-green-custom text-base sm:text-xl block mb-1">Rp {formatRp(row.margin_ops)}</span>
                  </div>
                </div>
              </div>
            ))}
            {opsChartData.length === 0 && (
              <div className="p-8 text-center text-muted font-bold neo-box col-span-2">Belum ada data operasional.</div>
            )}
          </div>
        </div>`;

const replacement = `{opsChartData.map((row: any, i) => (
              <div 
                key={row.name} 
                className="neo-box p-2.5 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors flex flex-col justify-between"
                onClick={() => setSelectedOperator(row.name)}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-4 border-b border-black/5 pb-2 sm:pb-3">
                  <div>
                    <h4 className="font-black text-sm sm:text-lg text-gray-800 flex items-center gap-2">
                      <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full" style={{ backgroundColor: opsColors[i % opsColors.length] }}></span>
                      {row.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs font-bold text-muted mt-0.5">{row.count} Transaksi Ops</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedOperator(row.name); }}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-[9px] sm:text-xs hover:bg-green-200 transition-colors shadow-sm leading-none"
                  >
                    Rincian
                  </button>
                </div>
                
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex flex-col items-center justify-center neo-box p-3 sm:p-4 bg-amber-50/20 border border-amber-100">
                     <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Total Sisa Pagu</span>
                     <span className="font-black text-amber-600 text-base sm:text-xl block mb-1">Rp {formatRp(row.sisa_pagu_ops)}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center neo-box p-3 sm:p-4 bg-green-50/20 border border-green-100">
                     <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Total Margin Ops</span>
                     <span className="font-black text-green-custom text-base sm:text-xl block mb-1">Rp {formatRp(row.margin_ops)}</span>
                  </div>
                </div>
              </div>
            ))}
            {opsChartData.length === 0 && (
              <div className="p-8 text-center text-muted font-bold neo-box col-span-2">Belum ada data operasional.</div>
            )}
          </div>
          
          <div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">
            *Klik kartu atau baris operator untuk melihat rincian dan mengunduh dokumen.
          </div>
        </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched Ops Table");
