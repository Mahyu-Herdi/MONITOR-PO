const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// I'll replace everything below the Bagi Hasil card with the new layout, properly formatted.
// This time I'll just write it manually from the data variables to ensure perfect JSX.

let startStr = '              <span className="font-black text-amber-600 text-sm sm:text-xl leading-none">\n                Rp {formatRp(Number(bagiHasilPersen) > 0 ? (pendapatanBersihKoperasi * Number(bagiHasilPersen)) / 100 : 0)}\n              </span>\n            </div>\n          </div>\n        </div>\n      </div>';

let endStr = '{selectedDapur && (';

let startIndex = code.indexOf(startStr) + startStr.length;
let endIndex = code.indexOf(endStr);

let newStructure = `
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        {/* GRAFIK BAHAN BAKU */}
        <div className="neo-card p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg">GRAFIK MARGIN BAHAN BAKU</h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-64 sm:h-80 xl:h-[24rem] w-full relative" id="pie-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="marginUtama"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    innerRadius="45%"
                    paddingAngle={2}
                    onClick={(entry) => setSelectedDapur(entry.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [\`Rp \${formatRp(value as number)} (\${props.payload.persentaseUtama}%)\`, name]} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 p-2 text-[10px] sm:text-xs font-bold text-muted pointer-events-none">
                *Klik grafik untuk lihat rincian
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              {chartData.length > 0 && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Pagu</span>
                      <span className="font-black text-blue-custom text-xs">Rp {formatRp(totalPagu)}</span>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Sisa Pagu</span>
                      <span className="font-black text-amber-600 text-xs">Rp {formatRp(marginPaguSppg)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Insentif</span>
                      <span className="font-black text-blue-custom text-xs">{totalPm} PM <br/><span className="text-[9px] opacity-80">(Rp {formatRp(totalPm * 2000)})</span></span>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Mar. Utama</span>
                      <span className="font-black text-blue-custom text-xs mb-0.5">Rp {formatRp(marginUtama)}</span>
                      <div><span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full">{persentaseUtama.toFixed(1)}%</span></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Mar. Koperasi</span>
                      <span className="font-black text-green-custom text-xs mb-0.5">Rp {formatRp(marginKoperasi)}</span>
                      <div><span className="text-[8px] font-bold bg-green-100 text-green-700 px-1 py-0.5 rounded-full">{persentaseKoperasi.toFixed(1)}%</span></div>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Mar. Yayasan</span>
                      <span className="font-black text-emerald-600 text-xs mb-0.5">Rp {formatRp(marginYayasan)}</span>
                      <div><span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-full">{persentaseYayasan.toFixed(1)}%</span></div>
                    </div>
                  </div>
                </>
              )}
              {chartData.length === 0 && (
                <div className="text-center p-4 text-muted text-sm font-bold">
                  Belum ada data distribusi.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRAFIK OPS */}
        <div className="neo-card p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <h3 className="font-extrabold text-green-700 text-sm sm:text-lg">GRAFIK MARGIN OPS PER OPERATOR</h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-64 sm:h-80 xl:h-[24rem] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={opsChartData}
                    dataKey="margin_ops"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="50%"
                    paddingAngle={5}
                  >
                    {opsChartData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={opsColors[index % opsColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value) => \`Rp \${formatRp(Number(value))}\`} 
                     contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "4px 4px 0px rgba(0,0,0,0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        {/* TABEL BAHAN BAKU */}
        <div className="neo-card p-3 sm:p-6 overflow-hidden">
          <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg mb-3 sm:mb-4 text-center sm:text-left">TABEL REKAPITULASI TOTAL PER DAPUR</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {chartData.map((row, i) => {
              return (
                <div 
                  key={row.name} 
                  className="neo-box p-2.5 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors flex flex-col justify-between"
                  onClick={() => setSelectedDapur(row.name)}
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-4 border-b border-black/5 pb-2 sm:pb-3">
                    <div>
                      <div className="font-bold text-blue-custom text-xs sm:text-sm leading-none mb-1">{row.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-muted font-semibold leading-none">{row.count} Transaksi</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDapur(row.name); }}
                      className="px-2 py-1 bg-blue-100 text-blue-custom rounded-lg font-bold text-[9px] sm:text-xs hover:bg-blue-200 transition-colors shadow-sm leading-none"
                    >
                      Rincian
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex flex-col items-center justify-center neo-box p-3 sm:p-4 bg-blue-50/20 border border-blue-100">
                       <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1">Margin Utama</span>
                       <span className="font-black text-blue-custom text-base sm:text-xl block mb-1">Rp {formatRp(row.marginUtama)}</span>
                       <span className="text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md inline-block">{row.persentaseUtama}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {chartData.length === 0 && (
              <div className="p-8 text-center text-muted font-bold neo-box col-span-2">Belum ada data distribusi.</div>
            )}
          </div>
          
          <div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">
            *Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.
          </div>
        </div>

        {/* TABEL OPS */}
        <div className="neo-card p-3 sm:p-6 overflow-hidden">
          <h3 className="font-extrabold text-green-700 text-sm sm:text-lg mb-3 sm:mb-4 text-center sm:text-left">TABEL REKAPITULASI OPS PER OPERATOR</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {opsChartData.map((row, i) => (
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
        </div>
      </div>
      
      `;

let newCode = code.substring(0, startIndex) + newStructure + '\n      ' + code.substring(endIndex);

fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
console.log("Success manually rewriting layout!");
