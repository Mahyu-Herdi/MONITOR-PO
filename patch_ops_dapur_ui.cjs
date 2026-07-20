const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `            <div className="flex flex-col gap-2 sm:gap-3 w-full">
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
            </div>`;

const replacement = `            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              {opsChartData.length > 0 && (
                <>
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
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Keseluruhan Mar. Ops</span>
                      <span className="font-black text-green-custom text-xs mb-0.5">Rp {formatRp(totalOpsMargin)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 bg-green-50/30 p-3 rounded-xl border border-green-100 max-h-[160px] overflow-y-auto custom-scrollbar">
                    <h4 className="font-extrabold text-[10px] sm:text-xs text-green-700 uppercase mb-2 sticky top-0 bg-green-50/90 backdrop-blur-sm py-1">Total Margin Ops Per Kelurahan/Dapur</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {opsDapurData.map((d: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-black/5 shadow-sm">
                          <span className="font-bold text-[10px] sm:text-xs text-gray-700 truncate pr-2">{d.name}</span>
                          <div className="text-right whitespace-nowrap">
                             <div className="font-black text-green-custom text-xs">Rp {formatRp(d.margin_ops)}</div>
                             <div className="text-[9px] font-bold text-muted">{d.pm} PM</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
