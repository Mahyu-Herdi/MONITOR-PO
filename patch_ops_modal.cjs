const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `{previewUrl && (`;

const opsModal = `
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
                        <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Hapus">
                          <Trash2 className="w-4 h-4"/>
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

      {previewUrl && (`;

code = code.replace(target, opsModal);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Added ops modal");
