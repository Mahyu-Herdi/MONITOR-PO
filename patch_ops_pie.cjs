const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
    /paddingAngle=\{5\}\n\s*>/g,
    `paddingAngle={5}\n                    onClick={(entry) => setSelectedOperator(entry.name)}\n                    style={{ cursor: 'pointer' }}\n                  >`
);

// Add the helper text "*Klik grafik untuk lihat rincian" for ops as well
code = code.replace(
    /<\/PieChart>\n              <\/ResponsiveContainer>\n            <\/div>\n          <\/div>\n        <\/div>/g,
    `</PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 p-2 text-[10px] sm:text-xs font-bold text-muted pointer-events-none">
                *Klik grafik untuk lihat rincian
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              {opsChartData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Pagu Ops</span>
                    <span className="font-black text-blue-custom text-xs">Rp {formatRp(totalOpsPagu)}</span>
                  </div>
                  <div className="flex flex-col text-right sm:text-left">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Sisa Pagu Ops</span>
                    <span className="font-black text-amber-600 text-xs">Rp {formatRp(totalOpsSisaPagu)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Insentif Ops</span>
                    <span className="font-black text-blue-custom text-xs">{totalOpsPm} PM <br/><span className="text-[9px] opacity-80">(Rp {formatRp(totalOpsPm * 2000)})</span></span>
                  </div>
                  <div className="flex flex-col text-right sm:text-left">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Mar. Ops</span>
                    <span className="font-black text-green-custom text-xs mb-0.5">Rp {formatRp(totalOpsMargin)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched Ops PieChart and Summary");
