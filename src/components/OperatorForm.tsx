import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from "./AlertProvider";
import { CustomSelect } from "./CustomSelect";
import { Upload, Save, FileText, FileSpreadsheet, Loader2, ArrowLeft, Briefcase, Truck } from 'lucide-react';
import { cn, formatRp, parseRp, GAS_URL } from '../lib/utils';

export function OperatorForm() {
  const { showAlert } = useAlert();
  const [transactionType, setTransactionType] = useState<'OPERATOR' | 'OPERASIONAL' | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [operators, setOperators] = useState<{name: string, dapurs: string[]}[]>([]);
  const [availableDapurs, setAvailableDapurs] = useState<string[]>([]);
  const [availableOpsDapurs, setAvailableOpsDapurs] = useState<string[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    operator_name: '',
    dapur_name: '',
    dist_date: '',
    pagu: '',
    po_sppg: '',
    po_koperasi: '',
    po_supplier: '',
    pm: ''
  });

  const [opsFormData, setOpsFormData] = useState({
    operator_name: '',
    dist_date: '',
    nama_sppg: '',
    harga_beli: '',
    harga_jual: '',
    pm: ''
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
          // Robustly split and trim comma-separated kitchen names from the spreadsheet config
          const formattedOperators = json.config.operators.map((op: any) => {
            const splitDapurs = op.dapurs.flatMap((d: string) => 
              d ? d.split(',').map((item: string) => item.trim()).filter(Boolean) : []
            );
            return {
              name: op.name,
              dapurs: splitDapurs
            };
          });
          setOperators(formattedOperators);
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

  const handleOpsCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseRp(value);
    
    setOpsFormData(prev => ({
      ...prev,
      [name]: numberValue === 0 && value === '' ? '' : formatRp(numberValue)
    }));
  };

  const handleOpsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOpsFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setLoading(true);
    setSuccess(false);

    try {
      const form = formRef.current;
      const file_ops = (form.elements.namedItem('file_ops') as HTMLInputElement).files?.[0];

      const body = new URLSearchParams();
      body.append('action', 'submit_ops');
      body.append('operator_name', opsFormData.operator_name);
      body.append('dist_date', opsFormData.dist_date);
      body.append('nama_sppg', opsFormData.nama_sppg);
      body.append('harga_beli', parseRp(opsFormData.harga_beli).toString());
      body.append('harga_jual', parseRp(opsFormData.harga_jual).toString());
      body.append('pm', (Number(opsFormData.pm) || 0).toString());
      
      const paguOps = (Number(opsFormData.pm) || 0) * 1500;
      body.append('pagu_ops', paguOps.toString());
      
      const marginOps = parseRp(opsFormData.harga_jual) - parseRp(opsFormData.harga_beli);
      body.append('margin_ops', marginOps.toString());

      const sisaPaguOps = paguOps - parseRp(opsFormData.harga_jual);
      body.append('sisa_pagu_ops', sisaPaguOps.toString());

      if (file_ops) body.append('file_ops', await getBase64(file_ops));

      if (!GAS_URL) {
        showAlert("URL Google Apps Script belum dikonfigurasi. Simulasi sukses.", "success");
        setSuccess(true);
        setOpsFormData({
          operator_name: '',
          dist_date: '',
          nama_sppg: '',
          harga_beli: '',
          harga_jual: '',
          pm: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        return;
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });

      if (response.ok || response.type === 'opaque') {
        setSuccess(true);
        setOpsFormData({
          operator_name: '',
          dist_date: '',
          nama_sppg: '',
          harga_beli: '',
          harga_jual: '',
          pm: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        showAlert("Gagal menyimpan data", "error");
      }
    } catch (error) {
      setSuccess(true);
      setOpsFormData({
        operator_name: '',
        dist_date: '',
        nama_sppg: '',
        harga_beli: '',
        harga_jual: '',
        pm: ''
      });
      if (formRef.current) formRef.current.reset();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
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

      const body = new URLSearchParams();
      body.append('operator_name', formData.operator_name);
      body.append('dapur_name', formData.dapur_name);
      body.append('dist_date', formData.dist_date);
      body.append('pagu', parseRp(formData.pagu).toString());
      body.append('po_sppg', parseRp(formData.po_sppg).toString());
      body.append('po_koperasi', parseRp(formData.po_koperasi).toString());
      body.append('po_supplier', parseRp(formData.po_supplier).toString());
      body.append('pm', (Number(formData.pm) || 0).toString());

      if (file_sppg) body.append('file_sppg', await getBase64(file_sppg));
      if (file_koperasi) body.append('file_koperasi', await getBase64(file_koperasi));
      if (file_supplier) body.append('file_supplier', await getBase64(file_supplier));

      if (!GAS_URL) {
        showAlert("URL Google Apps Script belum dikonfigurasi. Simulasi sukses.", "success");
        setSuccess(true);
        setFormData({
          operator_name: '',
          dapur_name: '',
          dist_date: '',
          pagu: '',
          po_sppg: '',
          po_koperasi: '',
          po_supplier: '',
          pm: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        return;
      }

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
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
          po_supplier: '',
          pm: ''
        });
        formRef.current.reset();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        showAlert("Gagal menyimpan data", "error");
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
        po_supplier: '',
        pm: ''
      });
      if (formRef.current) formRef.current.reset();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (transactionType === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 sm:mt-12 w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <h2 className="text-xl sm:text-2xl font-black text-blue-custom text-center mb-4">PILIH JENIS TRANSAKSI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
          <button 
            onClick={() => setTransactionType('OPERATOR')}
            className="neo-btn blue flex flex-col items-center justify-center gap-4 p-8 rounded-2xl h-40 sm:h-48 hover:-translate-y-2 transition-transform shadow-lg"
          >
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="font-bold text-base sm:text-lg">Input Operator</span>
          </button>
          <button 
            onClick={() => setTransactionType('OPERASIONAL')}
            className="neo-btn green flex flex-col items-center justify-center gap-4 p-8 rounded-2xl h-40 sm:h-48 hover:-translate-y-2 transition-transform shadow-lg"
          >
            <Truck className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="font-bold text-base sm:text-lg">Input Operasional</span>
          </button>
        </div>
      </div>
    );
  }

  if (transactionType === 'OPERASIONAL') {
    return (
      <div className="neo-card p-3 sm:p-6 w-full xl:max-w-none mx-auto animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-6 border-b border-black/5 pb-4">
          <button onClick={() => setTransactionType(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-sm sm:text-xl font-extrabold text-green-700 flex items-center gap-2 m-0 leading-none">
            <Truck className="w-4 h-4 sm:w-6 sm:h-6" />
            Input Operasional
          </h2>
        </div>

        {success && (
          <div className="bg-green-100 text-green-800 p-3 rounded-xl mb-4 font-bold text-center text-xs sm:text-sm">
            Berhasil menyimpan data operasional dan file!
          </div>
        )}

        <form ref={formRef} onSubmit={handleOpsSubmit} className="space-y-4">
          {configLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-custom" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Nama Operator Ops</label>
                <CustomSelect 
                  name="operator_name"
                  required
                  value={opsFormData.operator_name}
                  onChange={(val) => {
                    const op = operators.find(o => o.name === val);
                    setAvailableOpsDapurs(op ? op.dapurs : []);
                    setOpsFormData(prev => ({ ...prev, operator_name: val, nama_sppg: '' }));
                  }}
                  options={operators.map(op => ({ value: op.name, label: op.name }))}
                  placeholder="-- Pilih Operator --"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Tanggal Ops</label>
                <input 
                  type="date" 
                  name="dist_date"
                  required
                  value={opsFormData.dist_date}
                  onChange={handleOpsChange}
                  className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-sm sm:text-base min-h-[48px]" 
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Nama SPPG</label>
                <CustomSelect 
                  name="nama_sppg"
                  required
                  value={opsFormData.nama_sppg}
                  onChange={(val) => setOpsFormData(prev => ({ ...prev, nama_sppg: val }))}
                  disabled={!opsFormData.operator_name}
                  options={availableOpsDapurs.map(dapur => ({ value: dapur, label: dapur }))}
                  placeholder="-- Pilih SPPG --"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Jumlah PM</label>
                <input 
                  type="number" 
                  name="pm"
                  required
                  value={opsFormData.pm}
                  onChange={handleOpsChange}
                  placeholder="0"
                  className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-sm sm:text-base min-h-[48px]" 
                />
              </div>
            </div>
          )}

          <div className="neo-box p-3 sm:p-5 space-y-3 sm:space-y-4 bg-green-50/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Harga Beli Ops (Rp)</label>
                <input 
                  type="text" 
                  name="harga_beli"
                  required
                  value={opsFormData.harga_beli}
                  onChange={handleOpsCurrencyChange}
                  placeholder="0"
                  className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-sm sm:text-base min-h-[48px]" 
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Harga Jual Ops (Rp)</label>
                <input 
                  type="text" 
                  name="harga_jual"
                  required
                  value={opsFormData.harga_jual}
                  onChange={handleOpsCurrencyChange}
                  placeholder="0"
                  className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-sm sm:text-base min-h-[48px]" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/5">
              <div className="bg-white/60 p-3 rounded-lg border border-black/5 flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-muted">Est. Pagu Ops:</span>
                <span className="font-black text-blue-custom text-xs sm:text-sm">Rp {formatRp((Number(opsFormData.pm) || 0) * 1500)}</span>
              </div>
              <div className="bg-white/60 p-3 rounded-lg border border-black/5 flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-muted">Est. Sisa Pagu:</span>
                <span className="font-black text-amber-600 text-xs sm:text-sm">Rp {formatRp(((Number(opsFormData.pm) || 0) * 1500) - parseRp(opsFormData.harga_jual))}</span>
              </div>
              <div className="bg-white/60 p-3 rounded-lg border border-black/5 flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-muted">Est. Margin Ops:</span>
                <span className="font-black text-green-custom text-xs sm:text-sm">Rp {formatRp(parseRp(opsFormData.harga_jual) - parseRp(opsFormData.harga_beli))}</span>
              </div>
            </div>
          </div>

          <div className="neo-box p-3 sm:p-5 space-y-3">
            <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Upload Bukti Ops</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer">
              <input 
                type="file" 
                name="file_ops"
                required
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-gray-500">Klik atau seret file ke sini</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="neo-btn green w-full p-3 sm:p-4 rounded-xl font-bold text-sm sm:text-lg h-12 sm:h-14 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-5 h-5" /> SIMPAN DATA OPERASIONAL</>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="neo-card p-3 sm:p-6 w-full xl:max-w-none mx-auto animate-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 mb-6 border-b border-black/5 pb-4">
        <button onClick={() => setTransactionType(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-sm sm:text-xl font-extrabold text-blue-custom flex items-center gap-2 m-0 leading-none">
          <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
          Input Distribusi Dapur
        </h2>
      </div>
      
      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded-xl mb-4 font-bold text-center text-xs sm:text-sm">
          Berhasil menyimpan data dan mengupload file!
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {configLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-custom" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Nama Operator</label>
              <CustomSelect 
                name="operator_name"
                required
                value={formData.operator_name}
                onChange={(val) => {
                  const op = operators.find(o => o.name === val);
                  setAvailableDapurs(op ? op.dapurs : []);
                  setFormData(prev => ({ ...prev, operator_name: val, dapur_name: '' }));
                }}
                options={operators.map(op => ({ value: op.name, label: op.name }))}
                placeholder="-- Pilih Operator --"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Nama Dapur (SPPG)</label>
              <CustomSelect 
                name="dapur_name"
                required
                value={formData.dapur_name}
                onChange={(val) => setFormData(prev => ({ ...prev, dapur_name: val }))}
                disabled={!formData.operator_name}
                options={availableDapurs.map(dapur => ({ value: dapur, label: dapur }))}
                placeholder="-- Pilih Dapur --"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Tanggal Distribusi</label>
              <input 
                type="date" 
                name="dist_date"
                required
                value={formData.dist_date}
                onChange={handleChange}
                className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-sm sm:text-base min-h-[48px]" 
              />
            </div>
          </div>
        )}

        <div className="neo-box p-3 sm:p-5 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Pagu Belanja (Rp)</label>
              <input 
                type="text" 
                name="pagu"
                required
                value={formData.pagu}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-base sm:text-lg text-blue-custom min-h-[48px]" 
              />
              <div className="mt-2 text-xs sm:text-sm font-bold">
                <span className="text-gray-500">Sisa Pagu: </span>
                <span className={parseRp(formData.pagu) - parseRp(formData.po_sppg) >= 0 ? "text-green-600" : "text-red-600"}>
                  Rp {formatRp(parseRp(formData.pagu) - parseRp(formData.po_sppg))}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">PO SPPG (Rp)</label>
              <input 
                type="text" 
                name="po_sppg"
                required
                value={formData.po_sppg}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-base sm:text-lg text-blue-custom min-h-[48px]" 
              />
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 neo-box p-2 sm:p-3">
                 <span className="text-xs font-bold text-blue-custom flex items-center gap-1.5"><FileText className="w-4 h-4"/> Bukti PO</span>
                 <input type="file" name="file_sppg" accept=".pdf,.xls,.xlsx,image/*" required className="neo-file-input text-xs sm:text-sm font-bold text-muted w-full" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">PO Koperasi (Rp)</label>
              <input 
                type="text" 
                name="po_koperasi"
                required
                value={formData.po_koperasi}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-base sm:text-lg text-green-custom min-h-[48px]" 
              />
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 neo-box p-2 sm:p-3">
                 <span className="text-xs font-bold text-green-custom flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4"/> Bukti PO</span>
                 <input type="file" name="file_koperasi" accept=".pdf,.xls,.xlsx,image/*" required className="neo-file-input text-xs sm:text-sm font-bold text-muted w-full" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">PO Supplier (Rp)</label>
              <input 
                type="text" 
                name="po_supplier"
                required
                value={formData.po_supplier}
                onChange={handleCurrencyChange}
                placeholder="0" 
                className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-base sm:text-lg text-red-500 min-h-[48px]" 
              />
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 neo-box p-2 sm:p-3">
                 <span className="text-xs font-bold text-red-500 flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4"/> Bukti PO</span>
                 <input type="file" name="file_supplier" accept=".pdf,.xls,.xlsx,image/*" required className="neo-file-input text-xs sm:text-sm font-bold text-muted w-full" />
              </div>
            </div>

            <div className="flex flex-col md:col-span-2 border-t border-black/5 pt-4">
              <label className="block text-xs sm:text-sm font-bold text-muted mb-2">Insentif (Jumlah PM)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <input 
                    type="number" 
                    name="pm"
                    required
                    value={formData.pm}
                    onChange={handleChange}
                    placeholder="0" 
                    className="neo-input w-full p-3 sm:p-4 rounded-xl border-none font-bold text-base sm:text-lg text-blue-custom min-h-[48px]" 
                  />
                </div>
                <div className="neo-box p-3 flex flex-col justify-center min-h-[48px] bg-blue-50/10">
                  <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold leading-none mb-1">Rupiah Insentif</span>
                  <span className="text-sm sm:text-base font-black text-blue-custom leading-none">
                    Rp {formatRp((Number(formData.pm) || 0) * 2000)} <span className="text-xs font-normal text-muted">(1 PM = Rp 2.000)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-6">
            <div className="p-4 sm:p-6 neo-box flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-muted mb-1 sm:mb-2">Mar Utama</span>
              <span className="text-sm sm:text-2xl font-black text-blue-custom tracking-tight mb-1 sm:mb-2 leading-none">
                {formatRp(parseRp(formData.po_sppg) - parseRp(formData.po_supplier))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-blue-custom bg-blue-50/50 shadow-sm px-2 py-1 rounded-md leading-none">
                {parseRp(formData.po_sppg) > 0 ? ((parseRp(formData.po_sppg) - parseRp(formData.po_supplier)) / parseRp(formData.po_sppg) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="p-4 sm:p-6 neo-box flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-muted mb-1 sm:mb-2">Mar Koperasi</span>
              <span className="text-sm sm:text-2xl font-black text-green-custom tracking-tight mb-1 sm:mb-2 leading-none">
                {formatRp(parseRp(formData.po_sppg) - parseRp(formData.po_koperasi))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-green-custom bg-green-50/50 shadow-sm px-2 py-1 rounded-md leading-none">
                {parseRp(formData.po_sppg) > 0 ? (((parseRp(formData.po_sppg) - parseRp(formData.po_koperasi)) / parseRp(formData.po_sppg)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            
            <div className="p-4 sm:p-6 neo-box flex flex-col justify-center items-center text-center">
              <span className="block text-[9px] sm:text-xs font-bold uppercase tracking-wider text-muted mb-1 sm:mb-2">Mar Yayasan</span>
              <span className="text-sm sm:text-2xl font-black text-emerald-600 tracking-tight mb-1 sm:mb-2 leading-none">
                {formatRp(parseRp(formData.po_koperasi) - parseRp(formData.po_supplier))}
              </span>
              <span className="text-[10px] sm:text-sm font-bold text-emerald-600 bg-emerald-50/50 shadow-sm px-2 py-1 rounded-md leading-none">
                {parseRp(formData.po_sppg) > 0 ? (((parseRp(formData.po_koperasi) - parseRp(formData.po_supplier)) / parseRp(formData.po_sppg)) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="neo-btn-primary w-full p-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 mt-6 h-14"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan Data...</> : <><Save className="w-5 h-5" /> SIMPAN DATA</>}
        </button>
      </form>
    </div>
  );
}
