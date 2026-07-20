import { CustomSelect } from "./CustomSelect";
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { cn, formatRp, GAS_URL } from '../lib/utils';
import { TrendingUp, TrendingDown, Activity, Loader2, Calendar as CalendarIcon, Info } from 'lucide-react';

const colors = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

const months = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

export function PublicOverview() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(true);
  
  const currentMonth = new Date().toISOString().slice(5, 7);
  const currentYear = new Date().getFullYear().toString();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDapur, setSelectedDapur] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!GAS_URL) throw new Error("GAS_URL not set");
      const res = await fetch(GAS_URL);
      const json = await res.json();
      setData(json.distributions || []);
    } catch (err) {
      // Use fallback data for preview if fetch fails
      setData([
        { id: 1, dist_date: '2026-07-19', dapur_name: 'SPPG BABAH KRUENG', pagu: 10000000, po_sppg: 9000000, po_koperasi: 8000000, po_supplier: 7000000 },
        { id: 2, dist_date: '2026-07-19', dapur_name: 'SPPG BAROH KUTA BATEE', pagu: 15000000, po_sppg: 13000000, po_koperasi: 12000000, po_supplier: 11000000 },
        { id: 3, dist_date: '2026-07-18', dapur_name: 'SPPG TENGKU CHIK', pagu: 12000000, po_sppg: 11000000, po_koperasi: 10000000, po_supplier: 9000000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (!row.dist_date) return false;
      
      let y = '';
      let m = '';
      
      const d = new Date(row.dist_date);
      if (!isNaN(d.getTime())) {
        y = d.getFullYear().toString();
        m = (d.getMonth() + 1).toString().padStart(2, '0');
      } else if (typeof row.dist_date === 'string') {
        const parts = row.dist_date.split(/[-/ T]/);
        if (parts.length >= 3) {
           if (parts[0].length === 4) { // YYYY-MM-DD
             y = parts[0];
             m = parts[1].padStart(2, '0');
           } else { // DD/MM/YYYY
             y = parts[2];
             m = parts[1].padStart(2, '0');
           }
        }
      }
      
      return y === selectedYear && m === selectedMonth;
    });
  }, [data, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const summary: Record<string, any> = {};
    filteredData.forEach(row => {
      const dapur = row.dapur_name || 'Unknown';
      if (!summary[dapur]) {
        summary[dapur] = { 
          name: dapur, 
          marginUtama: 0,
          pagu: 0,
          po_sppg: 0,
          po_koperasi: 0,
          po_supplier: 0,
          marginKoperasi: 0,
          marginYayasan: 0
        };
      }
      summary[dapur].marginUtama += (Number(row.po_sppg) - Number(row.po_supplier));
      summary[dapur].pagu += Number(row.pagu);
      summary[dapur].po_sppg += Number(row.po_sppg);
      summary[dapur].po_koperasi += Number(row.po_koperasi);
      summary[dapur].po_supplier += Number(row.po_supplier);
      summary[dapur].marginKoperasi += (Number(row.po_sppg) - Number(row.po_koperasi));
      summary[dapur].marginYayasan += (Number(row.po_koperasi) - Number(row.po_supplier));
    });
    
    return Object.values(summary).map(d => {
      const pUtama = d.po_sppg > 0 ? (d.marginUtama / d.po_sppg) * 100 : 0;
      const pKoperasi = d.po_sppg > 0 ? (d.marginKoperasi / d.po_sppg) * 100 : 0;
      const pYayasan = d.po_sppg > 0 ? (d.marginYayasan / d.po_sppg) * 100 : 0;
      return {
        ...d,
        persentaseUtama: Number(pUtama.toFixed(2)),
        persentaseKoperasi: Number(pKoperasi.toFixed(2)),
        persentaseYayasan: Number(pYayasan.toFixed(2)),
      };
    }).sort((a, b) => b.persentaseUtama - a.persentaseUtama);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-custom animate-spin mb-4" />
        <p className="text-muted font-bold animate-pulse">Memuat data ringkasan...</p>
      </div>
    );
  }

  const selectedDapurData = selectedDapur ? chartData.find(d => d.name === selectedDapur) : null;
  const avgMargin = chartData.length > 0 ? chartData.reduce((acc, val) => acc + val.persentaseUtama, 0) / chartData.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className="neo-btn blue px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold"
        >
          {showFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </button>
      </div>

      <div className={cn("grid grid-cols-1 gap-6 items-start", selectedDapurData ? "xl:grid-cols-12" : "xl:grid-cols-1")}>
        <div className={cn("neo-card p-4 sm:p-6", selectedDapurData ? "xl:col-span-7" : "xl:col-span-12")}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-black text-blue-custom tracking-tight">Performa Margin Dapur</h2>
              <p className="text-xs font-bold text-muted mt-1">Gambaran margin utama persentase</p>
            </div>
            
            {showFilter && (
              <div className="flex items-center gap-2 neo-box p-2.5 sm:p-3 min-h-[40px] animate-in fade-in zoom-in duration-200">
                <CalendarIcon className="w-4 h-4 text-blue-custom" />
                <CustomSelect
                  value={selectedMonth}
                  onChange={(val) => setSelectedMonth(val)}
                  options={months.map(m => ({ value: m.value, label: m.label }))}
                  variant="inline"
                />
                <span className="text-gray-300">|</span>
                <CustomSelect
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val)}
                  options={[currentYear, (Number(currentYear)-1).toString()].map(y => ({ value: y, label: y }))}
                  variant="inline"
                />
              </div>
            )}
          </div>

          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 relative h-64 sm:h-80 lg:h-[28rem]" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="persentaseUtama"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="75%"
                      innerRadius="45%"
                      paddingAngle={3}
                      onClick={(entry) => setSelectedDapur(entry.name)}
                      style={{ cursor: 'pointer' }}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-muted pointer-events-none">
                  *Klik area grafik untuk detail
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="neo-box p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase">Margin Tertinggi</h4>
                      <p className="text-xs font-black text-green-700 leading-tight">{chartData[0].name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-green-700">{chartData[0].persentaseUtama}%</span>
                  </div>
                </div>

                <div className="neo-box p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase">Margin Terendah</h4>
                      <p className="text-xs font-black text-red-600 leading-tight">{chartData[chartData.length - 1].name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-600">{chartData[chartData.length - 1].persentaseUtama}%</span>
                  </div>
                </div>

                <div className="neo-box p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Activity className="w-4 h-4 text-blue-custom" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase">Rata-Rata Margin</h4>
                      <p className="text-xs font-black text-blue-custom leading-tight">Bulan Ini</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-custom">{avgMargin.toFixed(2)}%</span>
                  </div>
                </div>
                
                {!selectedDapur && (
                   <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                     <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] sm:text-xs text-blue-700 font-medium leading-tight">
                       Klik pada salah satu bagian pie chart untuk melihat rincian angka Pagu dan PO masing-masing dapur.
                     </p>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted font-bold neo-box">
              Belum ada data untuk bulan {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
            </div>
          )}
        </div>

        {selectedDapurData && (
          <div className="neo-card p-4 sm:p-6 xl:col-span-5 w-full flex flex-col justify-between animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg">Rincian: {selectedDapurData.name}</h3>
              <button 
                onClick={() => setSelectedDapur(null)}
                className="text-xs font-bold text-red-500 hover:underline px-2 py-1 bg-red-50 rounded-lg"
              >
                Tutup
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
              <div className="neo-box p-3 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total Pagu</span>
                <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(selectedDapurData.pagu)}</span>
              </div>
              <div className="neo-box p-3 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total PO SPPG</span>
                <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(selectedDapurData.po_sppg)}</span>
              </div>
              <div className="neo-box p-3 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total PO Koperasi</span>
                <span className="font-black text-green-custom text-xs sm:text-sm">Rp {formatRp(selectedDapurData.po_koperasi)}</span>
              </div>
              <div className="neo-box p-3 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Total PO Supplier</span>
                <span className="font-black text-red-500 text-xs sm:text-sm">Rp {formatRp(selectedDapurData.po_supplier)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mt-2 border-t border-black/5 pt-4">
              <div className="neo-box p-2 flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[9px] text-muted uppercase font-bold block mb-1 leading-none">Margin Utama</span>
                <span className="font-black text-blue-custom text-[10px] sm:text-xs mb-1.5 leading-none mt-1">Rp {formatRp(selectedDapurData.marginUtama)}</span>
                <span className="text-[8px] sm:text-[9px] font-bold bg-blue-50/50 text-blue-custom px-1.5 py-0.5 rounded-full leading-none shadow-sm">{selectedDapurData.persentaseUtama}%</span>
              </div>
              <div className="neo-box p-2 flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[9px] text-muted uppercase font-bold block mb-1 leading-none">Margin Kop.</span>
                <span className="font-black text-green-custom text-[10px] sm:text-xs mb-1.5 leading-none mt-1">Rp {formatRp(selectedDapurData.marginKoperasi)}</span>
                <span className="text-[8px] sm:text-[9px] font-bold bg-green-50/50 text-green-custom px-1.5 py-0.5 rounded-full leading-none shadow-sm">{selectedDapurData.persentaseKoperasi}%</span>
              </div>
              <div className="neo-box p-2 flex flex-col items-center justify-center">
                <span className="text-[8px] sm:text-[9px] text-muted uppercase font-bold block mb-1 leading-none">Margin Yay.</span>
                <span className="font-black text-emerald-600 text-[10px] sm:text-xs mb-1.5 leading-none mt-1">Rp {formatRp(selectedDapurData.marginYayasan)}</span>
                <span className="text-[8px] sm:text-[9px] font-bold bg-emerald-50/50 text-emerald-600 px-1.5 py-0.5 rounded-full leading-none shadow-sm">{selectedDapurData.persentaseYayasan}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
