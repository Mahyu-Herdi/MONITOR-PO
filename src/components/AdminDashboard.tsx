import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { formatRp, GAS_URL, parseRp, parseNumber, parsePM } from '../lib/utils';
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
  const { showAlert, showConfirm } = useAlert();
  const [data, setData] = useState<any[]>([]);
  const [opsData, setOpsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDapur, setSelectedDapur] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editingOpsId, setEditingOpsId] = useState<string | number | null>(null);
  const [editOpsForm, setEditOpsForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionTargetId, setActionTargetId] = useState<string | number | null>(null);
  const [showFilter, setShowFilter] = useState(true);
  const [bagiHasilPersen, setBagiHasilPersen] = useState<number | ''>(0);

  const handleViewFile = (url: string) => {
    let embedUrl = url;
    if (url.includes('drive.google.com/file/d/')) {
      embedUrl = url.replace(/\/view.*$/, '/preview');
    }
    setPreviewUrl(embedUrl);
  };

  const handleDelete = (id: string | number) => {
    showConfirm('Apakah Anda yakin ingin menghapus data distribusi ini?', async () => {
      setIsSaving(true);
      setActionTargetId(id);
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
        showAlert('Data berhasil dihapus', 'success');
      } catch (err) {
        showAlert('Gagal menghapus data', 'error');
      } finally {
        setIsSaving(false);
        setActionTargetId(null);
      }
    });
  };

  const handleDeleteOps = (id: string | number) => {
    showConfirm('Apakah Anda yakin ingin menghapus data operasional ini?', async () => {
      setIsSaving(true);
      setActionTargetId(id);
      try {
        if (GAS_URL) {
          const formDataParams = new URLSearchParams();
          formDataParams.append('action', 'delete_ops');
          formDataParams.append('id', id.toString());
          
          await fetch(GAS_URL, {
            method: 'POST',
            body: formDataParams
          });
        }
        
        setOpsData(prev => prev.filter(item => item.id !== id));
        showAlert('Data operasional berhasil dihapus', 'success');
      } catch (err) {
        showAlert('Gagal menghapus data operasional', 'error');
      } finally {
        setIsSaving(false);
        setActionTargetId(null);
      }
    });
  };

  const handleEditStart = (row: any) => {
    setEditingId(row.id);
    setEditForm({
      pagu: formatRp(row.pagu || 0),
      po_sppg: formatRp(row.po_sppg || 0),
      po_koperasi: formatRp(row.po_koperasi || 0),
      po_supplier: formatRp(row.po_supplier || 0),
      pm: row.pm || 0
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pm') {
      setEditForm((prev: any) => ({
        ...prev,
        pm: value === '' ? '' : Math.max(0, parseInt(value) || 0)
      }));
    } else {
      const numberValue = parseRp(value);
      setEditForm((prev: any) => ({
        ...prev,
        [name]: numberValue === 0 && value === '' ? '' : formatRp(numberValue)
      }));
    }
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setActionTargetId(editingId);
    try {
      if (GAS_URL) {
        const formDataParams = new URLSearchParams();
        formDataParams.append('action', 'update');
        formDataParams.append('id', editingId!.toString());
        formDataParams.append('pagu', parseRp(editForm.pagu).toString());
        formDataParams.append('po_sppg', parseRp(editForm.po_sppg).toString());
        formDataParams.append('po_koperasi', parseRp(editForm.po_koperasi).toString());
        formDataParams.append('po_supplier', parseRp(editForm.po_supplier).toString());
        formDataParams.append('pm', (Number(editForm.pm) || 0).toString());
        
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
            po_supplier: parseRp(editForm.po_supplier),
            pm: Number(editForm.pm) || 0
          };
        }
        return item;
      }));
      setEditingId(null);
    } catch (err) {
      showAlert('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
      setActionTargetId(null);
    }
  };

  const handleOpsEditStart = (row: any) => {
    setEditingOpsId(row.id);
    setEditOpsForm({
      harga_beli: formatRp(row.harga_beli),
      harga_jual: formatRp(row.harga_jual),
      pm: row.pm || 0
    });
  };

  const handleOpsEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name !== 'pm') {
      value = formatRp(parseRp(value));
    }
    setEditOpsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpsEditSave = async () => {
    setIsSaving(true);
    setActionTargetId(editingOpsId);
    try {
      if (GAS_URL) {
        const formDataParams = new URLSearchParams();
        formDataParams.append('action', 'update_ops');
        formDataParams.append('id', editingOpsId!.toString());
        formDataParams.append('harga_beli', parseRp(editOpsForm.harga_beli).toString());
        formDataParams.append('harga_jual', parseRp(editOpsForm.harga_jual).toString());
        formDataParams.append('pm', (Number(editOpsForm.pm) || 0).toString());
        
        await fetch(GAS_URL, {
          method: 'POST',
          body: formDataParams
        });
      }
      
      setOpsData(prev => prev.map(item => {
        if (item.id === editingOpsId) {
          const hb = parseRp(editOpsForm.harga_beli);
          const hj = parseRp(editOpsForm.harga_jual);
          const pm = Number(editOpsForm.pm) || 0;
          const pagu_ops = hj * pm;
          const po_ops = hb * pm;
          const margin_ops = pagu_ops - po_ops;
          
          return {
            ...item,
            harga_beli: hb,
            harga_jual: hj,
            pm: pm,
            pagu_ops: pagu_ops,
            sisa_pagu_ops: pagu_ops - po_ops,
            margin_ops: margin_ops
          };
        }
        return item;
      }));
      setEditingOpsId(null);
    } catch (err) {
      showAlert('Gagal menyimpan data ops');
    } finally {
      setIsSaving(false);
      setActionTargetId(null);
    }
  };

  useEffect(() => {
    if (!GAS_URL) {
      setLoading(false);
      setFetchError("GAS_URL belum diset!");
      setData([]);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const loadData = async () => {
      try {
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
        console.error("Fetch error in AdminDashboard:", err);
        setFetchError(err.message || String(err));
        setData([]);
        setOpsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // Calculate Summary metrics globally
  const totalPagu = filteredData.reduce((acc, curr) => acc + parseNumber(curr.pagu), 0);
  const totalSppg = filteredData.reduce((acc, curr) => acc + parseNumber(curr.po_sppg), 0);
  const totalKoperasi = filteredData.reduce((acc, curr) => acc + parseNumber(curr.po_koperasi), 0);
  const totalSupplier = filteredData.reduce((acc, curr) => acc + parseNumber(curr.po_supplier), 0);
  const totalPm = filteredData.reduce((acc, curr) => acc + parsePM(curr.pm), 0);
  const totalPmRupiah = totalPm * 2000;
  
  // Margins
  const marginPaguSppg = totalPagu - totalSppg; // Sisa Pagu
  const marginKoperasi = totalSppg - totalKoperasi; // Laba Koperasi
  const marginYayasan = totalKoperasi - totalSupplier; // Laba Yayasan
  const marginUtama = totalSppg - totalSupplier; // Margin Utama
  
  const persentaseKoperasi = totalSppg > 0 ? (marginKoperasi / totalSppg) * 100 : 0;
  const persentaseYayasan = totalSppg > 0 ? (marginYayasan / totalSppg) * 100 : 0;
  const persentaseUtama = totalSppg > 0 ? (marginUtama / totalSppg) * 100 : 0;

  const pendapatanBersihUtama = marginUtama + totalPmRupiah;
  const pendapatanBersihKoperasi = marginKoperasi + totalPmRupiah;

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
      pm: 0,
      count: 0 
    };
    acc[d].pagu += parseNumber(curr.pagu);
    acc[d].po_sppg += parseNumber(curr.po_sppg);
    acc[d].po_koperasi += parseNumber(curr.po_koperasi);
    acc[d].po_supplier += parseNumber(curr.po_supplier);
    acc[d].marginKoperasi += (parseNumber(curr.po_sppg) - parseNumber(curr.po_koperasi));
    acc[d].marginYayasan += (parseNumber(curr.po_koperasi) - parseNumber(curr.po_supplier));
    acc[d].marginUtama += (parseNumber(curr.po_sppg) - parseNumber(curr.po_supplier));
    acc[d].pm += parsePM(curr.pm);
    acc[d].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(chartDataMap).map((d: any) => ({
    ...d,
    persentaseUtama: d.po_sppg > 0 ? ((d.marginUtama / d.po_sppg) * 100).toFixed(2) : 0,
    persentaseKoperasi: d.po_sppg > 0 ? ((d.marginKoperasi / d.po_sppg) * 100).toFixed(2) : 0,
    persentaseYayasan: d.po_sppg > 0 ? ((d.marginYayasan / d.po_sppg) * 100).toFixed(2) : 0
  })).sort((a: any, b: any) => b.marginUtama - a.marginUtama);
  
  const filteredOpsData = useMemo(() => {
    const getLocalYYYYMMDD = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return opsData.filter(curr => {
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
  }, [opsData, startDate, endDate]);

  if (loading) {
    return <div className="p-8 text-center font-bold text-muted">Memuat data...</div>;
  }

  const totalOpsPagu = filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.pagu_ops), 0);
  const totalOpsMargin = filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.margin_ops), 0);
  const totalOpsSisaPagu = filteredOpsData.reduce((acc, curr) => acc + parseNumber(curr.sisa_pagu_ops), 0);
  const totalOpsPm = filteredOpsData.reduce((acc, curr) => acc + parsePM(curr.pm), 0);

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

  const opsChartData = Object.values(opsChartDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);

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
  const opsDapurData = Object.values(opsDapurDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);

  const colors = ['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'];
  const opsColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];

  const detailedData = selectedDapur ? filteredData.filter(d => d.dapur_name === selectedDapur) : [];
  const detailedOpsData = selectedOperator ? filteredOpsData.filter(d => (d.operator_name || 'Tanpa Nama') === selectedOperator) : [];

  return (
    <div className="space-y-6 relative">
      {fetchError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 font-bold text-xs sm:text-sm animate-in fade-in duration-200">
          <p className="font-extrabold uppercase">Gagal Mengambil Data dari Spreadsheet!</p>
          <p className="font-normal mt-1">Detail Error: {fetchError}</p>
          <p className="font-normal mt-1 opacity-80">Pastikan Google Apps Script (GAS) Anda telah di-deploy sebagai <b>Web App</b> dengan setelan akses <b>"Anyone" (Siapa saja)</b>.</p>
        </div>
      )}

      {/* FILTER RENTANG WAKTU (Always visible at the very top) */}
      <div className="neo-box p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-blue-50/5 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 justify-start">
          <div className="flex items-center gap-2 text-blue-custom font-extrabold text-xs sm:text-sm shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Filter Rentang Waktu:
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 sm:p-2.5 rounded-xl border border-black/10 outline-none font-bold text-xs bg-white shadow-sm w-full sm:w-auto min-h-[36px]"
            />
            <span className="font-bold text-muted whitespace-nowrap text-[10px] sm:text-xs">S/D <span className="text-[9px] font-normal opacity-70">(Kosongkan untuk 1 hari)</span></span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 sm:p-2.5 rounded-xl border border-black/10 outline-none font-bold text-xs bg-white shadow-sm w-full sm:w-auto min-h-[36px]"
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

        {/* MARGIN UTAMA, KOPERASI, YAYASAN */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 items-center bg-white/50 p-2 rounded-xl border border-black/5 shrink-0 w-full lg:w-auto min-w-[280px] sm:min-w-[360px]">
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-black leading-none mb-1">Mar. Utama</span>
            <span className="font-black text-blue-custom text-[10px] sm:text-xs leading-none">Rp {formatRp(marginUtama)}</span>
            <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md inline-block leading-none mt-1">{persentaseUtama.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-black/5 px-1">
            <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-black leading-none mb-1">Mar. Kop.</span>
            <span className="font-black text-green-custom text-[10px] sm:text-xs leading-none">Rp {formatRp(marginKoperasi)}</span>
            <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md inline-block leading-none mt-1">{persentaseKoperasi.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-black leading-none mb-1">Mar. Yay.</span>
            <span className="font-black text-emerald-600 text-[10px] sm:text-xs leading-none">Rp {formatRp(marginYayasan)}</span>
            <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md inline-block leading-none mt-1">{persentaseYayasan.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS (Total Pagu, PO SPPG, Sisa Pagu, PO Koperasi, PO Supplier & Insentif) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Total Pagu BB List Box */}
        <div className="flex flex-col gap-2 text-xs bg-gray-50/50 p-3 rounded-xl border border-black/5 shadow-inner">
          <div className="flex items-center justify-between border-b border-black/5 pb-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total Pagu BB</span>
            <span className="font-black text-blue-custom">Rp {formatRp(totalPagu)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-black/5 pb-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO SPPG</span>
            <span className="font-black text-blue-custom">Rp {formatRp(totalSppg)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-black/5 pb-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Sisa Pagu</span>
            <span className={`font-black ${marginPaguSppg < 0 ? 'text-red-500' : 'text-blue-custom'}`}>Rp {formatRp(marginPaguSppg)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-black/5 pb-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO Koperasi</span>
            <span className="font-black text-green-custom">Rp {formatRp(totalKoperasi)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-black/5 pb-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total PO Supplier</span>
            <span className="font-black text-red-500">Rp {formatRp(totalSupplier)}</span>
          </div>
        </div>

        {/* Insentif Box */}
        <div className="flex flex-col justify-between neo-box p-3 bg-blue-50/15">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold mb-1 block leading-none">Insentif</span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl sm:text-2xl font-black text-blue-custom leading-none">{totalPm}</span>
              <span className="text-xs font-bold text-muted">Pm</span>
            </div>
          </div>
          <div className="border-t border-black/5 pt-2 flex flex-col gap-1.5 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Total Insentif <span className="lowercase font-normal text-[8px] sm:text-[9px] text-muted">(x Rp 2.000)</span></span>
              <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(totalPmRupiah)}</span>
            </div>
            <div className="flex justify-between items-center bg-white/50 p-1.5 rounded-lg border border-blue-100">
              <span className="text-[9px] sm:text-[10px] text-blue-custom uppercase font-black">Total Uang Masuk <span className="lowercase font-normal text-[8px] text-muted block">(PO Kop. + Insentif)</span></span>
              <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp(totalKoperasi + totalPmRupiah)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PENDAPATAN BERSIH SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="neo-box p-3 flex flex-col justify-center bg-blue-50/15">
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-black block mb-0.5">Pendapatan Bersih 1</span>
          <span className="font-black text-blue-custom text-sm sm:text-base">Rp {formatRp(pendapatanBersihUtama)}</span>
          <span className="text-[8px] sm:text-[9px] text-muted font-bold mt-0.5">Margin Utama + Insentif</span>
        </div>
        <div className="neo-box p-3 flex flex-col justify-center bg-green-50/15">
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-black block mb-0.5">Pendapatan Bersih 2</span>
          <span className="font-black text-green-custom text-sm sm:text-base">Rp {formatRp(pendapatanBersihKoperasi + totalOpsMargin)}</span>
          <span className="text-[8px] sm:text-[9px] text-muted font-bold mt-0.5">Margin Koperasi + Insentif + Margin Ops</span>
        </div>
      </div>

      {/* KALKULATOR BAGI HASIL */}
      <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="neo-box p-3 sm:p-4 bg-amber-50/20">
          <span className="text-[10px] sm:text-xs text-gray-700 uppercase font-black block mb-2">Kalkulator Bagi Hasil</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Input Persen */}
            <div className="flex items-center shrink-0">
              <span className="text-[11px] sm:text-xs font-bold text-gray-500 mr-2">Persentase:</span>
              <input 
                type="number" 
                value={bagiHasilPersen}
                onChange={(e) => setBagiHasilPersen(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-16 p-1 sm:p-1.5 text-xs sm:text-sm font-black text-center border border-black/15 rounded-lg focus:outline-none focus:border-amber-500 bg-white shadow-inner transition-colors"
                min="0"
                max="100"
              />
              <span className="ml-1.5 font-black text-gray-600 text-xs sm:text-sm">%</span>
            </div>
            
            {/* Output Results */}
            <div className="flex-1 sm:border-l sm:border-black/10 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 flex flex-col justify-center">
              <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-wider">Bagi Hasil (Koperasi + Insentif + Margin Ops):</span>
              <span className="font-black text-amber-600 text-sm sm:text-base leading-tight">
                Rp {formatRp(Number(bagiHasilPersen) > 0 ? ((pendapatanBersihKoperasi + totalOpsMargin) * Number(bagiHasilPersen)) / 100 : 0)}
              </span>
              <span className="text-[8px] text-gray-400 font-bold">(Basis total: Rp {formatRp(pendapatanBersihKoperasi + totalOpsMargin)})</span>
            </div>
          </div>
        </div>
      </div>

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
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`Rp ${formatRp(value as number)} (${props.payload.persentaseUtama}%)`, name]} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 p-2 text-[10px] sm:text-xs font-bold text-muted pointer-events-none">
                *Klik grafik untuk lihat rincian
              </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              {chartData.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 h-full items-stretch bg-gray-50/30 p-2 rounded-xl border border-black/5">
                    <div className="flex flex-col items-center justify-center text-center">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Utama</span>
                       <span className="font-black text-blue-custom text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(marginUtama)}</span>
                       <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseUtama.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center border-l border-black/5">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Kop.</span>
                       <span className="font-black text-green-custom text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(marginKoperasi)}</span>
                       <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseKoperasi.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                       <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-bold mb-1 leading-none">Mar. Yay.</span>
                       <span className="font-black text-emerald-600 text-[10px] sm:text-xs mb-1 leading-none">Rp {formatRp(marginYayasan)}</span>
                       <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md inline-block leading-none">{persentaseYayasan.toFixed(1)}%</span>
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
                    onClick={(entry) => setSelectedOperator(entry.name)}
                    style={{ cursor: 'pointer' }}
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
              <div className="absolute top-0 right-0 p-2 text-[10px] sm:text-xs font-bold text-muted pointer-events-none">
                *Klik grafik untuk lihat rincian
              </div>
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
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-black/5 shadow-sm">
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
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        {/* TABEL BAHAN BAKU */}
        <div className="neo-card p-3 sm:p-6 overflow-hidden">
          <h3 className="font-extrabold text-blue-custom text-sm sm:text-lg mb-3 sm:mb-4 text-center sm:text-left">TABEL REKAPITULASI TOTAL BAHAN BAKU (BB) PER DAPUR</h3>
          
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
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs border-b border-black/5 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Pagu:</span>
                        <span className="font-black text-blue-custom">Rp {formatRp(row.pagu)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Sisa Pagu:</span>
                        <span className={`font-black ${row.pagu - row.po_sppg < 0 ? 'text-red-500' : 'text-amber-600'}`}>Rp {formatRp(row.pagu - row.po_sppg)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Insentif:</span>
                        <span className="font-black text-blue-custom">{row.pm} Pm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Nominal:</span>
                        <span className="font-black text-blue-custom">Rp {formatRp(row.pm * 2000)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center bg-gray-50 p-2 rounded-lg border border-black/5">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase mb-0.5">Mar. Utama</span>
                        <span className="font-black text-blue-custom text-[9px] sm:text-[10px] mb-0.5">Rp {formatRp(row.marginUtama)}</span>
                        <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full">{row.persentaseUtama}%</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-black/5">
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase mb-0.5">Mar. Kop.</span>
                        <span className="font-black text-green-custom text-[9px] sm:text-[10px] mb-0.5">Rp {formatRp(row.marginKoperasi)}</span>
                        <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1 py-0.5 rounded-full">{row.persentaseKoperasi}%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase mb-0.5">Mar. Yay.</span>
                        <span className="font-black text-emerald-600 text-[9px] sm:text-[10px] mb-0.5">Rp {formatRp(row.marginYayasan)}</span>
                        <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-full">{row.persentaseYayasan}%</span>
                      </div>
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
            {opsChartData.map((row: any, i) => (
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
                
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs border-b border-black/5 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Pagu Ops:</span>
                      <span className="font-black text-blue-custom">Rp {formatRp(row.pagu_ops)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Sisa Pagu:</span>
                      <span className={`font-black ${row.sisa_pagu_ops < 0 ? 'text-red-500' : 'text-amber-600'}`}>Rp {formatRp(row.sisa_pagu_ops)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Jumlah PM:</span>
                      <span className="font-black text-blue-custom">{row.pm} Pm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Nominal:</span>
                      <span className="font-black text-blue-custom">Rp {formatRp(row.pm * 2000)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center bg-green-50/30 p-2.5 rounded-lg border border-green-100/50">
                     <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold mb-1">Margin Ops</span>
                     <span className="font-black text-green-custom text-sm sm:text-base">Rp {formatRp(row.margin_ops)}</span>
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
                          <input type="text" name="pagu" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editForm.pagu} onChange={handleEditChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO SPPG</label>
                          <input type="text" name="po_sppg" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editForm.po_sppg} onChange={handleEditChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO Koperasi</label>
                          <input type="text" name="po_koperasi" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-green-custom outline-none min-h-[40px]" value={editForm.po_koperasi} onChange={handleEditChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PO Supplier</label>
                          <input type="text" name="po_supplier" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-red-500 outline-none min-h-[40px]" value={editForm.po_supplier} onChange={handleEditChange} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">Insentif (Jumlah PM)</label>
                          <input type="number" name="pm" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editForm.pm} onChange={handleEditChange} />
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
                        {row.file_sppg_url && (
                          <button onClick={() => handleViewFile(row.file_sppg_url)} className="p-1.5 bg-blue-100 text-blue-custom rounded-lg hover:bg-blue-200" title="PO SPPG">
                            <FileText className="w-4 h-4"/>
                          </button>
                        )}
                        {row.file_koperasi_url && (
                          <button onClick={() => handleViewFile(row.file_koperasi_url)} className="p-1.5 bg-green-100 text-green-custom rounded-lg hover:bg-green-200" title="PO Koperasi">
                            <FileSpreadsheet className="w-4 h-4"/>
                          </button>
                        )}
                        {row.file_supplier_url && (
                          <button onClick={() => handleViewFile(row.file_supplier_url)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="PO Supplier">
                            <FileSpreadsheet className="w-4 h-4"/>
                          </button>
                        )}
                        <div className="w-px h-6 bg-black/10 mx-1"></div>
                        <button onClick={() => handleEditStart(row)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200" title="Edit">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button disabled={isSaving} onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center min-w-[32px]" title="Hapus">
                          {isSaving && actionTargetId === row.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">Pagu</span>
                        <span className="font-black text-gray-800">Rp {formatRp(row.pagu)}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">PO SPPG</span>
                        <span className="font-black text-blue-custom">Rp {formatRp(row.po_sppg)}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">PO Koperasi</span>
                        <span className="font-black text-green-custom">Rp {formatRp(row.po_koperasi)}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">PO Supplier</span>
                        <span className="font-black text-red-500">Rp {formatRp(row.po_supplier)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-black/5 grid grid-cols-3 gap-1 text-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-bold">Mar. Utama</span>
                        <span className="font-black text-[10px] text-blue-custom">Rp {formatRp(rMarUtm)}</span>
                        <span className="text-[8px] font-bold text-blue-600">{pUtm}%</span>
                      </div>
                      <div className="flex flex-col border-l border-black/10">
                        <span className="text-[9px] text-gray-500 font-bold">Mar. Kop</span>
                        <span className="font-black text-[10px] text-green-custom">Rp {formatRp(rMarKop)}</span>
                        <span className="text-[8px] font-bold text-green-600">{pKop}%</span>
                      </div>
                      <div className="flex flex-col border-l border-black/10">
                        <span className="text-[9px] text-gray-500 font-bold">Mar. Yay</span>
                        <span className="font-black text-[10px] text-emerald-600">Rp {formatRp(rMarYay)}</span>
                        <span className="text-[8px] font-bold text-emerald-600">{pYay}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {detailedData.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted font-bold neo-box">
                  Data tidak ditemukan untuk dapur ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg">
          <div className="neo-card !shadow-none border border-black/10 p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedOperator(null)}
              className="absolute top-4 right-4 p-2 bg-red-100 text-red-custom rounded-full hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-extrabold text-green-700 text-2xl mb-6 pr-12">Rincian Ops: {selectedOperator}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {detailedOpsData.map((row, i) => {
                if (editingOpsId === row.id) {
                  return (
                    <div key={row.id} className="neo-box p-3 sm:p-4 relative bg-yellow-50/50">
                      <div className="flex justify-between items-start mb-2 border-b border-black/5 pb-1.5">
                         <div>
                            <div className="font-bold text-green-700 text-xs sm:text-sm leading-none mb-1">{formatDate(row.dist_date)}</div>
                            <div className="text-[10px] sm:text-xs text-muted font-semibold leading-none">{row.nama_sppg || row.dapur_name}</div>
                         </div>
                         <div className="flex gap-2">
                            <button disabled={isSaving} onClick={handleOpsEditSave} className="p-1 sm:p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 min-w-[32px] flex items-center justify-center" title="Simpan">
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin"/> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
                            </button>
                            <button disabled={isSaving} onClick={() => setEditingOpsId(null)} className="p-1 sm:p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 min-w-[32px] flex items-center justify-center" title="Batal">
                              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                            </button>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">Harga Beli</label>
                          <input type="text" name="harga_beli" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-amber-600 outline-none min-h-[40px]" value={editOpsForm.harga_beli} onChange={handleOpsEditChange} />
                        </div>
                        <div>
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">Harga Jual</label>
                          <input type="text" name="harga_jual" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-green-custom outline-none min-h-[40px]" value={editOpsForm.harga_jual} onChange={handleOpsEditChange} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold block mb-1 leading-none">PM</label>
                          <input type="number" name="pm" className="neo-input w-full p-2 sm:p-3 text-xs sm:text-sm rounded-xl font-bold text-blue-custom outline-none min-h-[40px]" value={editOpsForm.pm} onChange={handleOpsEditChange} />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={row.id} className="neo-box p-4 relative">
                    <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-2">
                      <div>
                        <div className="font-bold text-green-700 text-sm">{formatDate(row.dist_date)}</div>
                        <div className="text-xs text-muted font-semibold">{row.nama_sppg || row.dapur_name}</div>
                      </div>
                      <div className="flex gap-2">
                        {row.file_ops_url && (
                          <button onClick={() => handleViewFile(row.file_ops_url)} className="p-1.5 bg-blue-100 text-blue-custom rounded-lg hover:bg-blue-200" title="File Ops">
                            <FileText className="w-4 h-4"/>
                          </button>
                        )}
                        <div className="w-px h-6 bg-black/10 mx-1"></div>
                        <button onClick={() => handleOpsEditStart(row)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200" title="Edit">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button disabled={isSaving} onClick={() => handleDeleteOps(row.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center min-w-[32px]" title="Hapus">
                          {isSaving && actionTargetId === row.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex justify-between border-b border-black/5 pb-1 col-span-2">
                        <span className="text-muted font-bold">PM</span>
                        <span className="font-black text-blue-custom">{row.pm}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">Harga Beli</span>
                        <span className="font-black text-amber-600">Rp {formatRp(row.harga_beli)}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-muted font-bold">Harga Jual</span>
                        <span className="font-black text-green-custom">Rp {formatRp(row.harga_jual)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-black/5 grid grid-cols-3 gap-1 text-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-bold">Pagu Ops</span>
                        <span className="font-black text-[10px] text-gray-800">Rp {formatRp(row.pagu_ops)}</span>
                      </div>
                      <div className="flex flex-col border-l border-black/10">
                        <span className="text-[9px] text-gray-500 font-bold">Sisa Pagu Ops</span>
                        <span className="font-black text-[10px] text-amber-600">Rp {formatRp(row.sisa_pagu_ops)}</span>
                      </div>
                      <div className="flex flex-col border-l border-black/10">
                        <span className="text-[9px] text-gray-500 font-bold">Mar. Ops</span>
                        <span className="font-black text-[10px] text-green-custom">Rp {formatRp(row.margin_ops)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {detailedOpsData.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted font-bold neo-box">
                  Data tidak ditemukan untuk operator ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
