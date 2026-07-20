import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { cn, formatRp, GAS_URL } from '../lib/utils';
import { Loader2, Calendar as CalendarIcon, Info, LogOut, X, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import { CustomSelect } from "./CustomSelect";

const colors = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

const opsColors = [
  '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'
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

interface PublicOverviewProps {
  onLogout?: () => void;
}

export function PublicOverview({ onLogout }: PublicOverviewProps) {
  const [data, setData] = useState<any[]>([]);
  const [opsData, setOpsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const currentMonth = new Date().toISOString().slice(5, 7);
  const currentYear = new Date().getFullYear().toString();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDapur, setSelectedDapur] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      if (!GAS_URL) throw new Error("GAS_URL not set");
      const res = await fetch(GAS_URL);
      if (!res.ok) {
        let errMsg = `HTTP error! status: ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) {
            errMsg = errJson.message;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const json = await res.json();
      setData(json.distributions || []);
      setOpsData(json.opsDistributions || json.ops_distributions || []);
    } catch (err: any) {
      console.error("Fetch error in PublicOverview:", err);
      setFetchError(err.message || String(err));
      setData([]);
      setOpsData([]);
    } finally {
      setLoading(false);
    }
  };

  const parseNumber = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const num = Number(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const parsePM = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const num = Number(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Filter main distributions based on selected month & year
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

  // Filter operations distributions based on selected month & year
  const filteredOpsData = useMemo(() => {
    return opsData.filter(row => {
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
  }, [opsData, selectedMonth, selectedYear]);

  // Main distribution metrics per dapur
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
          marginYayasan: 0,
          pm: 0
        };
      }
      summary[dapur].marginUtama += (Number(row.po_sppg) - Number(row.po_supplier));
      summary[dapur].pagu += Number(row.pagu);
      summary[dapur].po_sppg += Number(row.po_sppg);
      summary[dapur].po_koperasi += Number(row.po_koperasi);
      summary[dapur].po_supplier += Number(row.po_supplier);
      summary[dapur].marginKoperasi += (Number(row.po_sppg) - Number(row.po_koperasi));
      summary[dapur].marginYayasan += (Number(row.po_koperasi) - Number(row.po_supplier));
      summary[dapur].pm += (Number(row.pm) || 0);
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

  // Main distribution overall rekap
  const globalStats = useMemo(() => {
    let totalPagu = 0, totalPOSPPG = 0, totalPOKoperasi = 0, totalPOSupplier = 0, totalPM = 0;
    filteredData.forEach(row => {
      totalPagu += Number(row.pagu) || 0;
      totalPOSPPG += Number(row.po_sppg) || 0;
      totalPOKoperasi += Number(row.po_koperasi) || 0;
      totalPOSupplier += Number(row.po_supplier) || 0;
      totalPM += Number(row.pm) || 0;
    });
    
    const marginUtama = totalPOSPPG - totalPOSupplier;
    const marginKoperasi = totalPOSPPG - totalPOKoperasi;
    const marginYayasan = totalPOKoperasi - totalPOSupplier;
    const sisaPagu = totalPagu - totalPOSPPG;
    const insentifRp = totalPM * 2000;
    const uangMasukKoperasi = totalPOKoperasi + insentifRp;

    const pendapatanBersihUtama = marginUtama + insentifRp;
    const pendapatanBersihKoperasi = marginKoperasi + insentifRp;
    
    const pUtama = totalPOSPPG > 0 ? (marginUtama / totalPOSPPG) * 100 : 0;
    const pKoperasi = totalPOSPPG > 0 ? (marginKoperasi / totalPOSPPG) * 100 : 0;
    const pYayasan = totalPOSPPG > 0 ? (marginYayasan / totalPOSPPG) * 100 : 0;

    return {
      totalPagu, totalPOSPPG, totalPOKoperasi, totalPOSupplier, totalPM,
      marginUtama, marginKoperasi, marginYayasan, sisaPagu, insentifRp, uangMasukKoperasi,
      pendapatanBersihUtama, pendapatanBersihKoperasi,
      pUtama: pUtama.toFixed(2), pKoperasi: pKoperasi.toFixed(2), pYayasan: pYayasan.toFixed(2)
    };
  }, [filteredData]);

  // Ops calculations
  const totalOpsPagu = useMemo(() => filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.pagu_ops), 0), [filteredOpsData]);
  const totalOpsMargin = useMemo(() => filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.margin_ops), 0), [filteredOpsData]);
  const totalOpsSisaPagu = useMemo(() => filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.sisa_pagu_ops), 0), [filteredOpsData]);
  const totalOpsPm = useMemo(() => filteredOpsData.reduce((acc, curr) => acc + parsePM(curr.pm), 0), [filteredOpsData]);

  const opsChartData = useMemo(() => {
    const opsChartDataMap = filteredOpsData.reduce((acc: Record<string, any>, curr) => {
      const d = curr.operator_name || 'Tanpa Nama';
      if (!acc[d]) acc[d] = {
        name: d,
        pagu_ops: 0,
        margin_ops: 0,
        sisa_pagu_ops: 0,
        pm: 0,
        count: 0
      };
      acc[d].pagu_ops += parseNumber(curr.pagu_ops);
      acc[d].margin_ops += parseNumber(curr.margin_ops);
      acc[d].sisa_pagu_ops += parseNumber(curr.sisa_pagu_ops);
      acc[d].pm += parsePM(curr.pm);
      acc[d].count += 1;
      return acc;
    }, {});

    return Object.values(opsChartDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);
  }, [filteredOpsData]);

  const opsDapurData = useMemo(() => {
    const opsDapurDataMap = filteredOpsData.reduce((acc: Record<string, any>, curr) => {
      const d = curr.nama_sppg || curr.dapur_name || 'Tanpa Nama Dapur';
      if (!acc[d]) acc[d] = {
        name: d,
        margin_ops: 0,
        pm: 0
      };
      acc[d].margin_ops += parseNumber(curr.margin_ops);
      acc[d].pm += parsePM(curr.pm);
      return acc;
    }, {});
    return Object.values(opsDapurDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);
  }, [filteredOpsData]);

  // Transaction Lists for popup details
  const detailedData = useMemo(() => {
    return selectedDapur ? filteredData.filter(d => d.dapur_name === selectedDapur) : [];
  }, [filteredData, selectedDapur]);

  const detailedOpsData = useMemo(() => {
    return selectedOperator ? filteredOpsData.filter(d => (d.operator_name || 'Tanpa Nama') === selectedOperator) : [];
  }, [filteredOpsData, selectedOperator]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-custom animate-spin mb-4" />
        <p className="text-muted font-bold animate-pulse">Memuat data ringkasan...</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return dateStr;
    }
  };

  const handleViewFile = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 relative">
      {fetchError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 font-bold text-xs sm:text-sm animate-in fade-in duration-200">
          <p className="font-extrabold uppercase">Gagal Mengambil Data dari Spreadsheet!</p>
          <p className="font-normal mt-1">Detail Error: {fetchError}</p>
          <p className="font-normal mt-1 opacity-80">Pastikan Google Apps Script (GAS) Anda telah di-deploy sebagai <b>Web App</b> dengan setelan akses <b>"Anyone" (Siapa saja)</b>.</p>
        </div>
      )}

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="neo-btn red px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar Aplikasi
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className="neo-btn blue px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm"
        >
          {showFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </button>
      </div>

      {showFilter && (
        <div className="neo-box p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3 sm:gap-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-blue-custom font-bold text-sm sm:text-base">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Rentang Waktu Rekapitulasi:
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <CustomSelect
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              options={months.map(m => ({ value: m.value, label: m.label }))}
              variant="default"
            />
            <span className="text-gray-300 font-bold">/</span>
            <CustomSelect
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              options={[currentYear, (Number(currentYear)-1).toString()].map(y => ({ value: y, label: y }))}
              variant="default"
            />
          </div>
        </div>
      )}

      {/* DUAL CHARTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        
        {/* CHART 1: GRAFIK MARGIN BAHAN BAKU */}
        <div className="neo-card p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg">GRAFIK MARGIN BAHAN BAKU</h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-64 sm:h-80 xl:h-[24rem] w-full relative">
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
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`Rp ${formatRp(value as number)} (${props.payload.persentaseUtama}%)`, name]} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              {chartData.length > 0 && (
                <div className="flex flex-col gap-4">
                  {/* Row 1: Metrics & Margins & Insentif */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    <div className="flex flex-col gap-2 text-[11px] sm:text-xs bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
                      <div className="flex items-center justify-between border-b border-black/5 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Pagu BB</span>
                        <span className="font-black text-blue-custom">Rp {formatRp(globalStats.totalPagu)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/5 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO SPPG</span>
                        <span className="font-black text-blue-custom">Rp {formatRp(globalStats.totalPOSPPG)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/5 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Sisa Pagu</span>
                        <span className={`font-black ${globalStats.sisaPagu < 0 ? 'text-red-500' : 'text-blue-custom'}`}>Rp {formatRp(globalStats.sisaPagu)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/5 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO Koperasi</span>
                        <span className="font-black text-green-custom">Rp {formatRp(globalStats.totalPOKoperasi)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-black/5 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO Supplier</span>
                        <span className="font-black text-red-500">Rp {formatRp(globalStats.totalPOSupplier)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center neo-box p-3 bg-blue-50/20">
                      <span className="text-[10px] text-gray-500 uppercase font-bold mb-1 leading-none">Insentif</span>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl sm:text-2xl font-black text-blue-custom leading-none">{globalStats.totalPM}</span>
                        <span className="text-xs font-bold text-muted">Pm</span>
                      </div>
                      <div className="border-t border-black/5 pt-2 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Total Insentif <span className="lowercase font-normal text-[8px] sm:text-[9px] text-muted">(x Rp 2.000)</span></span>
                          <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(globalStats.insentifRp)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-blue-100">
                          <span className="text-[9px] sm:text-[10px] text-blue-custom uppercase font-black">Total Uang Masuk <span className="lowercase font-normal text-[8px] text-muted block">(PO Kop. + Insentif)</span></span>
                          <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(globalStats.uangMasukKoperasi)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 sm:gap-2 h-full items-stretch bg-gray-50/30 p-2 rounded-xl border border-black/5">
                    <div className="flex flex-col items-center justify-center text-center">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Utama</span>
                       <span className="font-black text-blue-custom text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(globalStats.marginUtama)}</span>
                       <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{Number(globalStats.pUtama).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-black/5">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Kop.</span>
                       <span className="font-black text-green-custom text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(globalStats.marginKoperasi)}</span>
                       <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{Number(globalStats.pKoperasi).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Yay.</span>
                       <span className="font-black text-emerald-600 text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(globalStats.marginYayasan)}</span>
                       <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{Number(globalStats.pYayasan).toFixed(1)}%</span>
                    </div>
                  </div>

                  </div>
              )}
              {chartData.length === 0 && (
                <div className="text-center p-4 text-muted text-sm font-bold">
                  Belum ada data distribusi.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHART 2: GRAFIK MARGIN OPS PER OPERATOR */}
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
                    {opsChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={opsColors[index % opsColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value) => `Rp ${formatRp(Number(value))}`} 
                     contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "4px 4px 0px rgba(0,0,0,0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-2 sm:gap-3 w-full">
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
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Jumlah PM Ops</span>
                      <span className="font-black text-blue-custom text-xs">{totalOpsPm} Pm <br/><span className="text-[9px] opacity-80">(Rp {formatRp(totalOpsPm * 2000)})</span></span>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Total Keseluruhan Mar. Ops</span>
                      <span className="font-black text-green-custom text-xs mb-0.5">Rp {formatRp(totalOpsMargin)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 bg-green-50/30 p-3 rounded-xl border border-green-100 max-h-[160px] overflow-y-auto custom-scrollbar">
                    <h4 className="font-extrabold text-[10px] sm:text-xs text-green-700 uppercase mb-2 sticky top-0 bg-green-50/90 backdrop-blur-sm py-1">Total Margin Per Dapur</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {opsDapurData.map((d: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex justify-between items-center bg-white p-2 rounded-lg border border-black/5 shadow-sm"
                        >
                          <span className="font-bold text-[10px] sm:text-xs text-gray-700 truncate pr-2">{d.name}</span>
                          <div className="text-right whitespace-nowrap">
                             <div className="font-black text-green-custom text-xs">Rp {formatRp(d.margin_ops)}</div>
                             <div className="text-[9px] font-bold text-muted">{d.pm} Pm</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {opsChartData.length === 0 && (
                <div className="text-center p-4 text-muted text-sm font-bold">
                  Belum ada data distribusi ops.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
