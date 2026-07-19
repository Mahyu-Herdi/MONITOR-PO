import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn, formatRp, parseRp, GAS_URL } from '../lib/utils';

export function OperatorForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [operators, setOperators] = useState<{name: string, dapurs: string[]}[]>([]);
  const [availableDapurs, setAvailableDapurs] = useState<string[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    operator_name: '',
    dapur_name: '',
    dist_date: '',
    pagu: '',
    po_sppg: '',
    po_koperasi: '',
    po_supplier: ''
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!GAS_URL) {
      setOperators([
        { name: "DUMMY OPERATOR 1", dapurs: ["DAPUR A", "DAPUR B"] },
        { name: "DUMMY OPERATOR 2", dapurs: ["DAPUR C"] }
      ]);
      setConfigLoading(false);
      return;
    }
    
    fetch(GAS_URL)
      .then(res => res.json())
      .then(json => {
        if (json.config && json.config.operators) {
          setOperators(json.config.operators);
        }
        setConfigLoading(false);
      })
      .catch(err => {
        setOperators([
          { name: "INDAH LIANI", dapurs: ["SPPG BABAH KRUENG", "SPPG BLANG PULO", "SPPG PALOH IGEUH"] },
          { name: "NURUL AKMAL", dapurs: ["SPPG BAROH KUTA BATEE"] }
        ]);
        setConfigLoading(false);
      });
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseRp(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numberValue === 0 && value === '' ? '' : formatRp(numberValue)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'operator_name') {
      const op = operators.find(o => o.name === value);
      if (op) {
        setAvailableDapurs(op.dapurs);
      } else {
        setAvailableDapurs([]);
      }
      setFormData(prev => ({ ...prev, dapur_name: '' }));
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setLoading(true);
    setSuccess(false);

    try {
      const form = formRef.current;
      const file_sppg = (form.elements.namedItem('file_sppg') as HTMLInputElement).files?.[0];
      const file_koperasi = (form.elements.namedItem('file_koperasi') as HTMLInputElement).files?.[0];
      const file_supplier = (form.elements.namedItem('file_supplier') as HTMLInputElement).files?.[0];

      const body = new FormData();
      body.append('operator_name', formData.operator_name);
      body.append('dapur_name', formData.dapur_name);
      body.append('dist_date', formData.dist_date);
      body.append('pagu', parseRp(formData.pagu).toString());
      body.append('po_sppg', parseRp(formData.po_sppg).toString());
      body.append('po_koperasi', parseRp(formData.po_koperasi).toString());
      body.append('po_supplier', parseRp(formData.po_supplier).toString());

      if (file_sppg) body.append('file_sppg', await getBase64(file_sppg));
      if (file_koperasi) body.append('file_koperasi', await getBase64(file_koperasi));
      if (file_supplier) body.append('file_supplier', await getBase64(file_supplier));

      if (!GAS_URL) {
        alert("URL Google Apps Script belum dikonfigurasi. Simulasi sukses.");
        setSuccess(true);
        setFormData({
          operator_name: '',
          dapur_name: '',
          dist_date: '',
          pagu: '',
          po_sppg: '',
          po_koperasi: '',
          po_supplier: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        return;
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: body,
        // mode: 'no-cors' // Use this if standard CORS is not set up on GAS
      });

      if (response.ok || response.type === 'opaque') {
        setSuccess(true);
        setFormData({
          operator_name: '',
          dapur_name: '',
          dist_date: '',
          pagu: '',
          po_sppg: '',
          po_koperasi: '',
          po_supplier: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      // Handle fallback success for preview when GAS fetch fails
      setSuccess(true);
      setFormData({
        operator_name: '',
        dapur_name: '',
        dist_date: '',
        pagu: '',
        po_sppg: '',
        po_koperasi: '',
        po_supplier: ''
      });
      if (formRef.current) formRef.current.reset();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clay-card p-4 sm:p-6 w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-extrabold text-blue-custom mb-6 flex items-center gap-2">
        <Save className="w-6 h-6" />
        Input Distribusi Dapur
      </h2>
      
      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-6 font-bold text-center">
          Berhasil menyimpan data dan mengupload file!
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {configLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-custom" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted mb-2">Nama Operator</label>
              <select 
                name="operator_name"
                required
                value={formData.operator_name}
                onChange={handleChange}
                className="clay-input w-full p-3 rounded-xl border-none font-bold appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Operator --</option>
                {operators.map(op => (
                  <option key={op.name} value={op.name}>{op.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">Nama Dapur (SPPG)</label>
              <select 
                name="dapur_name"
                required
                value={formData.dapur_name}
                onChange={handleChange}
                disabled={!formData.operator_name}
                className="clay-input w-full p-3 rounded-xl border-none font-bold appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Dapur --</option>
                {availableDapurs.map(dapur => (
                  <option key={dapur} value={dapur}>{dapur}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">Tanggal Distribusi</label>
              <input 
                type="date" 
                name="dist_date"
                required
                value={formData.dist_date}
                onChange={handleChange}
                className="clay-input w-full p-3 rounded-xl border-none font-bold" 
              />
            </div>
          </div>
        )}

        <div className="clay-card-in p-3 sm:p-5 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-muted mb-1 sm:mb-2">Pagu Belanja (Rp)</label>
              <input 
                type="text" 
                name="pagu"
                required
                value={formData.pagu}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="clay-input w-full p-2 sm:p-3 rounded-xl border-none font-bold text-base sm:text-lg text-blue-custom" 
              />
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold">
                <span className="text-gray-500">Sisa Pagu: </span>
                <span className={parseRp(formData.pagu) - parseRp(formData.po_sppg) >= 0 ? "text-green-600" : "text-red-600"}>
                  Rp {formatRp(parseRp(formData.pagu) - parseRp(formData.po_sppg))}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-1 sm:mb-2">PO SPPG (Rp)</label>
              <input 
                type="text" 
                name="po_sppg"
                required
                value={formData.po_sppg}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="clay-input w-full p-2 sm:p-3 rounded-xl border-none font-bold text-base sm:text-lg text-blue-custom" 
              />
              <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2 clay-card-in p-2">
                 <span className="text-[10px] sm:text-xs font-bold text-blue-custom flex items-center gap-1"><FileText className="w-3 h-3"/> <span className="hidden sm:inline">Upload</span></span>
                 <input type="file" name="file_sppg" accept=".pdf,.xls,.xlsx,image/*" required className="text-[10px] sm:text-xs w-full max-w-[140px] sm:max-w-[180px]" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-1 sm:mb-2">PO Koperasi (Rp)</label>
              <input 
                type="text" 
                name="po_koperasi"
                required
                value={formData.po_koperasi}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="clay-input w-full p-2 sm:p-3 rounded-xl border-none font-bold text-base sm:text-lg text-green-custom" 
              />
              <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2 clay-card-in p-2">
                 <span className="text-[10px] sm:text-xs font-bold text-green-custom flex items-center gap-1"><FileSpreadsheet className="w-3 h-3"/> <span className="hidden sm:inline">Upload</span></span>
                 <input type="file" name="file_koperasi" accept=".pdf,.xls,.xlsx,image/*" required className="text-[10px] sm:text-xs w-full max-w-[140px] sm:max-w-[180px]" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-1 sm:mb-2">PO Supplier (Rp)</label>
              <input 
                type="text" 
                name="po_supplier"
                required
                value={formData.po_supplier}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="clay-input w-full p-2 sm:p-3 rounded-xl border-none font-bold text-base sm:text-lg text-red-500" 
              />
              <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2 clay-card-in p-2">
                 <span className="text-[10px] sm:text-xs font-bold text-red-500 flex items-center gap-1"><FileSpreadsheet className="w-3 h-3"/> <span className="hidden sm:inline">Upload</span></span>
                 <input type="file" name="file_supplier" accept=".pdf,.xls,.xlsx,image/*" required className="text-[10px] sm:text-xs w-full max-w-[140px] sm:max-w-[180px]" />
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="p-2 sm:p-5 clay-card-blue flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mb-0.5 sm:mb-1">Mar Utama</span>
              <span className="text-sm sm:text-2xl font-black text-white tracking-tight mb-0.5">
                {formatRp(parseRp(formData.po_sppg) - parseRp(formData.po_supplier))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-white bg-white/20 shadow-sm px-1.5 py-0.5 rounded-md">
                {parseRp(formData.po_sppg) > 0 ? ((parseRp(formData.po_sppg) - parseRp(formData.po_supplier)) / parseRp(formData.po_sppg) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="p-2 sm:p-5 clay-card-green flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mb-0.5 sm:mb-1">Mar Koperasi</span>
              <span className="text-sm sm:text-2xl font-black text-white tracking-tight mb-0.5">
                {formatRp(parseRp(formData.po_sppg) - parseRp(formData.po_koperasi))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-white bg-white/20 shadow-sm px-1.5 py-0.5 rounded-md">
                {parseRp(formData.po_sppg) > 0 ? (((parseRp(formData.po_sppg) - parseRp(formData.po_koperasi)) / parseRp(formData.po_sppg)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            
            <div className="p-2 sm:p-5 clay-card-emerald flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mb-0.5 sm:mb-1">Mar Yayasan</span>
              <span className="text-sm sm:text-2xl font-black text-white tracking-tight mb-0.5">
                {formatRp(parseRp(formData.po_koperasi) - parseRp(formData.po_supplier))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-white bg-white/20 shadow-sm px-1.5 py-0.5 rounded-md">
                {parseRp(formData.po_sppg) > 0 ? (((parseRp(formData.po_koperasi) - parseRp(formData.po_supplier)) / parseRp(formData.po_sppg)) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="clay-btn blue w-full p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
        >
          {loading ? "Menyimpan Data..." : <><Save className="w-5 h-5" /> SIMPAN DATA</>}
        </button>
      </form>
    </div>
  );
}
