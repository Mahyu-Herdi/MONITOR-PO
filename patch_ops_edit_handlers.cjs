const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `      setIsSaving(false);
    }
  };

  useEffect(() => {`;

const newHandlers = `      setIsSaving(false);
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
    }
  };

  useEffect(() => {`;

code = code.replace(target, newHandlers);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Added ops edit handlers");
