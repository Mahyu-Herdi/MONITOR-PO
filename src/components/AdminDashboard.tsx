import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { formatRp, GAS_URL, parseRp } from '../lib/utils';
import { useAlert } from "./AlertProvider";
import { FileText, FileSpreadsheet, X, Calendar as CalendarIcon, TrendingUp, TrendingDown, Activity, Edit2, Trash2, Save, XCircle, Loader2 } from 'lucide-react';

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  if (isNaN(d.getTime())) return dateStr;
  return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export function AdminDashboard() {
  const { showAlert } = useAlert();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDapur, setSelectedDapur] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showFilter, setShowFilter] = useState(true);

  const handleViewFile = (url: string) => {
    let embedUrl = url;
    if (url.includes('drive.google.com/file/d/')) {
      embedUrl = url.replace(/\/view.*$/, '/preview');
    }
    setPreviewUrl(embedUrl);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    setIsSaving(true);
    try {
      if (GAS_URL) {
        const formDataParams = new URLSearchParams();
        formDataParams.append('action', 'delete');
        formDataParams.append('id', id.toString());
        
        await fetch(GAS_URL, {
          method: 'POST',
          body: formDataParams
        });
      }
      
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      showAlert('Gagal menghapus data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStart = (row: any) => {
    setEditingId(row.id);
    setEditForm({
      pagu: formatRp(row.pagu || 0),
      po_sppg: formatRp(row.po_sppg || 0),
      po_koperasi: formatRp(row.po_koperasi || 0),
      po_supplier: formatRp(row.po_supplier || 0)
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseRp(value);
    
    setEditForm((prev: any) => ({
      ...prev,
      [name]: numberValue === 0 && value === '' ? '' : formatRp(numberValue)
    }));
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    try {
      if (GAS_URL) {
        const formDataParams = new URLSearchParams();
        formDataParams.append('action', 'update');
        formDataParams.append('id', editingId!.toString());
        formDataParams.append('pagu', parseRp(editForm.pagu).toString());
        formDataParams.append('po_sppg', parseRp(editForm.po_sppg).toString());
        formDataParams.append('po_koperasi', parseRp(editForm.po_koperasi).toString());
        formDataParams.append('po_supplier', parseRp(editForm.po_supplier).toString());
        
        await fetch(GAS_URL, {
          method: 'POST',
          body: formDataParams
        });
      }
      
      setData(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            pagu: parseRp(editForm.pagu),
            po_sppg: parseRp(editForm.po_sppg),
            po_koperasi: parseRp(editForm.po_koperasi),
            po_supplier: parseRp(editForm.po_supplier)
          };
        }
        return item;
      }));
      setEditingId(null);
    } catch (err) {
      showAlert('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!GAS_URL) {
      setLoading(false);
      setData([
        { id: 1, dist_date: '2026-07-19', operator_name: 'DUMMY OPERATOR', dapur_name: 'SPPG BABAH KRUENG', pagu: 10000000, po_sppg: 9000000, po_koperasi: 8000000, po_supplier: 7000000 },
        { id: 2, dist_date: '2026-07-19', operator_name: 'DUMMY OPERATOR', dapur_name: 'SPPG BAROH KUTA BATEE', pagu: 15000000, po_sppg: 13000000, po_koperasi: 12000000, po_supplier: 11000000 }
      ]);
      return;
    }

    fetch(GAS_URL)
      .then(res => res.json())
      .then(json => {
        setData(json.distributions || []);
        setLoading(false);
      })
      .catch(err => {
        setData([
          { id: 1, dist_date: '2026-07-19', operator_name: 'DUMMY OPERATOR', dapur_name: 'SPPG BABAH KRUENG', pagu: 10000000, po_sppg: 9000000, po_koperasi: 8000000, po_supplier: 7000000 },
          { id: 2, dist_date: '2026-07-19', operator_name: 'DUMMY OPERATOR', dapur_name: 'SPPG BAROH KUTA BATEE', pagu: 15000000, po_sppg: 13000000, po_koperasi: 12000000, po_supplier: 11000000 }
        ]);
        setLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    const getLocalYYYYMMDD = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return data.filter(curr => {
      const itemDate = getLocalYYYYMMDD(curr.dist_date);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate && !endDate) {
        return itemDate === startDate;
      } else if (!startDate && endDate) {
        return itemDate === endDate;
      }
      return true;
    });
  }, [data, startDate, endDate]);

  if (loading) {
    return <div className="p-8 text-center font-bold text-muted">Memuat data...</div>;
  }

  // Calculate Summary metrics globally
  const totalPagu = filteredData.reduce((acc, curr) => acc + curr.pagu, 0);
  const totalSppg = filteredData.reduce((acc, curr) => acc + curr.po_sppg, 0);
  const totalKoperasi = filteredData.reduce((acc, curr) => acc + curr.po_koperasi, 0);
  const totalSupplier = filteredData.reduce((acc, curr) => acc + curr.po_supplier, 0);
  
  // Margins
  const marginPaguSppg = totalPagu - totalSppg; // Sisa Pagu
  const marginKoperasi = totalSppg - totalKoperasi; // Laba Koperasi
  const marginYayasan = totalKoperasi - totalSupplier; // Laba Yayasan
  const marginUtama = totalSppg - totalSupplier; // Margin Utama
  
  const persentaseKoperasi = totalSppg > 0 ? (marginKoperasi / totalSppg) * 100 : 0;
  const persentaseYayasan = totalSppg > 0 ? (marginYayasan / totalSppg) * 100 : 0;
  const persentaseUtama = totalSppg > 0 ? (marginUtama / totalSppg) * 100 : 0;

  // Chart Data preparation (group by dapur)
  const chartDataMap = filteredData.reduce((acc: Record<string, any>, curr) => {
    const d = curr.dapur_name;
    if (!acc[d]) acc[d] = { 
      name: d, 
      pagu: 0, 
      po_sppg: 0, 
      po_koperasi: 0, 
      po_supplier: 0, 
      marginKoperasi: 0, 
      marginYayasan: 0,
      marginUtama: 0,
      count: 0 
    };
    acc[d].pagu += curr.pagu;
    acc[d].po_sppg += curr.po_sppg;
    acc[d].po_koperasi += curr.po_koperasi;
    acc[d].po_supplier += curr.po_supplier;
    acc[d].marginKoperasi += (curr.po_sppg - curr.po_koperasi);
    acc[d].marginYayasan += (curr.po_koperasi - curr.po_supplier);
    acc[d].marginUtama += (curr.po_sppg - curr.po_supplier);
    acc[d].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(chartDataMap).map((d: any) => ({
    ...d,
    persentaseUtama: d.po_sppg > 0 ? ((d.marginUtama / d.po_sppg) * 100).toFixed(2) : 0,
    persentaseKoperasi: d.po_sppg > 0 ? ((d.marginKoperasi / d.po_sppg) * 100).toFixed(2) : 0,
    persentaseYayasan: d.po_sppg > 0 ? ((d.marginYayasan / d.po_sppg) * 100).toFixed(2) : 0
  })).sort((a: any, b: any) => b.marginUtama - a.marginUtama);
  const colors = ['#e74c3c','#3498db','#f1c40f','#2ecc71','#9b59b6','#e67e22'];

  const detailedData = selectedDapur ? filteredData.filter(d => d.dapur_name === selectedDapur) : [];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className="neo-btn blue px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold"
        >
          {showFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </button>
      </div>

      {showFilter && (
        <div className="neo-box p-4 sm:p-5 flex flex-col md:flex-row items-center gap-3 sm:gap-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-blue-custom font-bold text-sm sm:text-base">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Filter Rentang Waktu:
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2.5 sm:p-3 rounded-xl border-none outline-none font-bold text-xs sm:text-sm bg-white shadow-sm w-full sm:w-auto min-h-[40px]"
            />
            <span className="font-bold text-muted whitespace-nowrap text-xs sm:text-sm">S/D <span className="text-[10px] sm:text-xs font-normal opacity-70">(Kosongkan untuk 1 hari)</span></span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2.5 sm:p-3 rounded-xl border-none outline-none font-bold text-xs sm:text-sm bg-white shadow-sm w-full sm:w-auto min-h-[40px]"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-600 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-6">
        <div className="neo-box p-2 sm:p-5 flex flex-col items-center justify-center text-center min-h-[60px] sm:min-h-0">
          <h4 className="text-[8px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-0.5 sm:mb-2 leading-none">Total Pagu BB</h4>
          <h2 className="text-[11px] sm:text-2xl font-black text-blue-custom tracking-tight leading-none mt-1">Rp {formatRp(totalPagu)}</h2>
        </div>
        <div className="neo-box p-2 sm:p-5 flex flex-col items-center justify-center text-center min-h-[60px] sm:min-h-0">
          <h4 className="text-[8px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-0.5 sm:mb-2 leading-none">Total PO SPPG</h4>
          <h2 className="text-[11px] sm:text-2xl font-black text-blue-custom tracking-tight leading-none mt-1">Rp {formatRp(totalSppg)}</h2>
        </div>
        <div className="neo-box p-2 sm:p-5 flex flex-col items-center justify-center text-center min-h-[60px] sm:min-h-0">
          <h4 className="text-[8px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-0.5 sm:mb-2 leading-none">Total PO Koperasi</h4>
          <h2 className="text-[11px] sm:text-2xl font-black text-green-custom tracking-tight leading-none mt-1">Rp {formatRp(totalKoperasi)}</h2>
        </div>
        <div className="neo-box p-2 sm:p-5 flex flex-col items-center justify-center text-center min-h-[60px] sm:min-h-0">
          <h4 className="text-[8px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-0.5 sm:mb-2 leading-none">Total PO Supplier</h4>
          <h2 className="text-[11px] sm:text-2xl font-black text-red-500 tracking-tight leading-none mt-1">Rp {formatRp(totalSupplier)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="neo-box p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-blue-custom text-[10px] sm:text-sm mb-1 tracking-tight leading-none">SISA PAGU</h3>
          <p className="text-[9px] sm:text-xs font-medium text-muted mb-2 sm:mb-4 tracking-wide leading-none">Pagu BB - PO SPPG</p>
          <h1 className="text-sm sm:text-3xl font-black text-blue-custom tracking-tighter leading-none mt-1">Rp {formatRp(marginPaguSppg)}</h1>
        </div>
        <div className="neo-box p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-blue-custom text-[10px] sm:text-sm mb-1 tracking-tight leading-none">MARGIN UTAMA</h3>
          <p className="text-[9px] sm:text-xs font-medium text-muted mb-2 sm:mb-4 tracking-wide leading-none">SPPG - Supplier</p>
          <h1 className="text-sm sm:text-3xl font-black text-blue-custom tracking-tighter leading-none mt-1">Rp {formatRp(marginUtama)}</h1>
          <div className="inline-block px-2 sm:px-4 py-1 sm:py-1.5 mt-2 sm:mt-4 bg-blue-50/50 text-blue-custom rounded-full font-bold text-[10px] sm:text-xs shadow-sm leading-none">
            {persentaseUtama.toFixed(1)}%
          </div>
        </div>
        <div className="neo-box p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-green-custom text-[10px] sm:text-sm mb-1 tracking-tight leading-none">MARGIN KOPERASI</h3>
          <p className="text-[9px] sm:text-xs font-medium text-muted mb-2 sm:mb-4 tracking-wide leading-none">SPPG - Koperasi</p>
          <h1 className="text-sm sm:text-3xl font-black text-green-custom tracking-tighter leading-none mt-1">Rp {formatRp(marginKoperasi)}</h1>
          <div className="inline-block px-2 sm:px-4 py-1 sm:py-1.5 mt-2 sm:mt-4 bg-green-50/50 text-green-custom rounded-full font-bold text-[10px] sm:text-xs shadow-sm leading-none">
            {persentaseKoperasi.toFixed(1)}%
          </div>
        </div>
        <div className="neo-box p-4 sm:p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-emerald-600 text-[10px] sm:text-sm mb-1 tracking-tight leading-none">MARGIN YAYASAN</h3>
          <p className="text-[9px] sm:text-xs font-medium text-muted mb-2 sm:mb-4 tracking-wide leading-none">Koperasi - Supplier</p>
          <h1 className="text-sm sm:text-3xl font-black text-emerald-600 tracking-tighter leading-none mt-1">Rp {formatRp(marginYayasan)}</h1>
          <div className="inline-block px-2 sm:px-4 py-1 sm:py-1.5 mt-2 sm:mt-4 bg-emerald-50/50 text-emerald-600 rounded-full font-bold text-[10px] sm:text-xs shadow-sm leading-none">
            {persentaseYayasan.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="neo-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg">GRAFIK MARGIN UTAMA PER DAPUR</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="h-64 sm:h-80 lg:h-[28rem] w-full relative lg:col-span-2" id="pie-chart-container">
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
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [`Rp ${formatRp(value)} (${props.payload.persentaseUtama}%)`, name]} />
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
                <div className="neo-box p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Margin Tertinggi</h4>
                      <p className="text-[10px] sm:text-xs font-black text-green-700 leading-tight">{chartData[0].name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-green-700">{chartData[0].persentaseUtama}%</span>
                  </div>
                </div>

                <div className="neo-box p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Margin Terendah</h4>
                      <p className="text-[10px] sm:text-xs font-black text-red-600 leading-tight">{chartData[chartData.length - 1].name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-red-600">{chartData[chartData.length - 1].persentaseUtama}%</span>
                  </div>
                </div>

                <div className="neo-box p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-custom" />
                    </div>
                    <div>
                      <h4 className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Rata-Rata Margin</h4>
                      <p className="text-[10px] sm:text-xs font-black text-blue-custom leading-tight">Seluruh Dapur</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-blue-custom">{persentaseUtama.toFixed(2)}%</span>
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

      {selectedDapur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg">
          <div className="neo-card !shadow-none border border-black/10 p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedDapur(null)}
              className="absolute top-4 right-4 p-2 bg-red-100 text-red-custom rounded-full hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-extrabold text-blue-custom text-2xl mb-6 pr-12">Rincian: {selectedDapur}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {detailedData.map((row, i) => {
                const rMarUtm = row.po_sppg - row.po_supplier;
                const rMarKop = row.po_sppg - row.po_koperasi;
                const rMarYay = row.po_koperasi - row.po_supplier;
                const pKop = row.po_sppg > 0 ? ((rMarKop / row.po_sppg) * 100).toFixed(2) : 0;
                const pYay = row.po_sppg > 0 ? ((rMarYay / row.po_sppg) * 100).toFixed(2) : 0;
                const pUtm = row.po_sppg > 0 ? ((rMarUtm / row.po_sppg) * 100).toFixed(2) : 0;

                if (editingId === row.id) {
                  return (
                    <div key={row.id} className="neo-box p-3 sm:p-4 relative bg-yellow-50/50">
                      <div className="flex justify-between items-start mb-2 border-b border-black/5 pb-1.5">
                         <div>
                            <div className="font-bold text-blue-custom text-xs sm:text-sm leading-none mb-1">{formatDate(row.dist_date)}</div>
                            <div className="text-[10px] sm:text-xs text-muted font-semibold leading-none">Edit Data Transaksi</div>
                         </div>
                         <div className="flex gap-2">
                            <button disabled={isSaving} onClick={handleEditSave} className="p-1 sm:p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 min-w-[32px] flex items-center justify-center" title="Simpan">
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin"/> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
                            </button>
                            <button disabled={isSaving} onClick={() => setEditingId(null)} className="p-1 sm:p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 min-w-[32px] flex items-center justify-center" title="Batal">
                              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                            </button>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">Pagu</label>
                          <input type="text" name="pagu" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editForm.pagu} onChange={handleCurrencyChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO SPPG</label>
                          <input type="text" name="po_sppg" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editForm.po_sppg} onChange={handleCurrencyChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO Koperasi</label>
                          <input type="text" name="po_koperasi" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-green-custom outline-none min-h-[40px]" value={editForm.po_koperasi} onChange={handleCurrencyChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO Supplier</label>
                          <input type="text" name="po_supplier" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-red-500 outline-none min-h-[40px]" value={editForm.po_supplier} onChange={handleCurrencyChange} />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={row.id} className="neo-box p-4 relative">
                    <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-2">
                      <div>
                        <div className="font-bold text-blue-custom text-sm">{formatDate(row.dist_date)}</div>
                        <div className="text-xs text-muted font-semibold">{row.operator_name}</div>
                      </div>
                      <div className="flex gap-2">
                        {row.file_sppg && (
                          <button onClick={() => handleViewFile(row.file_sppg)} className="p-1.5 bg-blue-100 text-blue-custom rounded-lg hover:bg-blue-200" title="PO SPPG">
                            <FileText className="w-4 h-4"/>
                          </button>
                        )}
                        {row.file_koperasi && (
                          <button onClick={() => handleViewFile(row.file_koperasi)} className="p-1.5 bg-green-100 text-green-custom rounded-lg hover:bg-green-200" title="PO Koperasi">
                            <FileSpreadsheet className="w-4 h-4"/>
                          </button>
                        )}
                        {row.file_supplier && (
                          <button onClick={() => handleViewFile(row.file_supplier)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="PO Supplier">
                            <FileSpreadsheet className="w-4 h-4"/>
                          </button>
                        )}
                        <div className="w-px h-6 bg-black/10 mx-1"></div>
                        <button onClick={() => handleEditStart(row)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200" title="Edit">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-sm mb-2">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">Pagu BB</span>
                        <span className="font-semibold text-blue-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.pagu)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">Sisa Pagu</span>
                        <span className="font-semibold text-amber-600 text-xs sm:text-sm leading-none">Rp {formatRp(row.pagu - row.po_sppg)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">PO SPPG</span>
                        <span className="font-semibold text-blue-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.po_sppg)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">PO Koperasi</span>
                        <span className="font-semibold text-green-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.po_koperasi)}</span>
                      </div>
                      <div className="col-span-2 text-center mt-1">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">PO Supplier</span>
                        <span className="font-semibold text-red-500 text-xs sm:text-sm leading-none">Rp {formatRp(row.po_supplier)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center neo-box p-1.5 sm:p-2">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">Mar. Utama</span>
                        <span className="font-black text-blue-custom text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(rMarUtm)}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded-md inline-block leading-none">{pUtm}%</span>
                      </div>
                      <div className="flex flex-col items-center justify-center border-l border-r border-black/5">
                        <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">Mar. Koperasi</span>
                        <span className="font-black text-green-600 text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(rMarKop)}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold bg-green-100 text-green-700 px-1 py-0.5 rounded-md inline-block leading-none">{pKop}%</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5 leading-none">Mar. Yayasan</span>
                        <span className="font-black text-emerald-600 text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(rMarYay)}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-md inline-block leading-none">{pYay}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {detailedData.length === 0 && (
                <div className="p-8 text-center text-muted font-bold neo-box">Tidak ada data.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="neo-card p-3 sm:p-6 overflow-hidden">
        <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg mb-3 sm:mb-4 text-center sm:text-left">TABEL REKAPITULASI TOTAL PER DAPUR</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {chartData.map((row: any, i) => {
            const sisaPagu = row.pagu - row.po_sppg;
            return (
              <div 
                key={row.name} 
                className="neo-box p-2.5 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => setSelectedDapur(row.name)}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-4 border-b border-black/5 pb-2 sm:pb-3">
                  <div>
                    <div className="font-bold text-blue-custom text-sm sm:text-base leading-none mb-1">{row.name}</div>
                    <div className="text-[10px] sm:text-xs text-muted font-semibold leading-none">{row.count} Transaksi</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDapur(row.name); }}
                    className="px-2 py-1 bg-blue-100 text-blue-custom rounded-lg font-bold text-[9px] sm:text-xs hover:bg-blue-200 transition-colors shadow-sm leading-none"
                  >
                    Rincian
                  </button>
                </div>
                
                <div className="flex flex-col gap-2 text-sm mb-3 sm:mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block leading-none">Total Pagu</span>
                    <span className="font-black text-blue-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.pagu)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block leading-none">PO SPPG</span>
                    <span className="font-black text-blue-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.po_sppg)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block leading-none">Sisa Pagu</span>
                    <span className={`font-black text-xs sm:text-sm leading-none ${sisaPagu < 0 ? 'text-red-500' : 'text-blue-custom'}`}>Rp {formatRp(sisaPagu)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block leading-none">PO Koperasi</span>
                    <span className="font-black text-green-custom text-xs sm:text-sm leading-none">Rp {formatRp(row.po_koperasi)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block leading-none">PO Supplier</span>
                    <span className="font-black text-red-500 text-xs sm:text-sm leading-none">Rp {formatRp(row.po_supplier)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center neo-box p-1.5 sm:p-2">
                  <div className="flex flex-col items-center justify-center">
                     <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Mar. Utama</span>
                     <span className="font-black text-blue-custom text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(row.marginUtama)}</span>
                     <span className="text-[8px] sm:text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded-md inline-block leading-none">{row.persentaseUtama}%</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-r border-black/5">
                     <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Mar. Koperasi</span>
                     <span className="font-black text-green-600 text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(row.marginKoperasi)}</span>
                     <span className="text-[8px] sm:text-[9px] font-bold bg-green-100 text-green-700 px-1 py-0.5 rounded-md inline-block leading-none">{row.persentaseKoperasi}%</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                     <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Mar. Yayasan</span>
                     <span className="font-black text-emerald-600 text-[10px] sm:text-xs block leading-none mb-1">Rp {formatRp(row.marginYayasan)}</span>
                     <span className="text-[8px] sm:text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-md inline-block leading-none">{row.persentaseYayasan}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          {chartData.length === 0 && (
            <div className="p-8 text-center text-muted font-bold neo-box">Belum ada data distribusi.</div>
          )}
        </div>

        <div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">
          *Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
              <h3 className="font-extrabold text-blue-custom">Pratinjau Dokumen</h3>
              <div className="flex items-center gap-2">
                <a href={previewUrl.replace('/preview', '/view')} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-blue-600">Buka di Tab Baru</a>
                <button onClick={() => setPreviewUrl(null)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X className="w-5 h-5"/></button>
              </div>
            </div>
            <div className="flex-1 w-full bg-gray-200 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full border-none" allow="autoplay" title="Preview Dokumen"></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
