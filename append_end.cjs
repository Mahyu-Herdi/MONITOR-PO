const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const endPart = `
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
                        <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus">
                          <Trash2 className="w-4 h-4"/>
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
`;

fs.writeFileSync('src/components/AdminDashboard.tsx', code + endPart);
console.log("Appended end part!");

