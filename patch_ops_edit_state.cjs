const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
    'const [editForm, setEditForm] = useState<any>({});\n  const [isSaving, setIsSaving] = useState(false);',
    'const [editForm, setEditForm] = useState<any>({});\n  const [editingOpsId, setEditingOpsId] = useState<string | number | null>(null);\n  const [editOpsForm, setEditOpsForm] = useState<any>({});\n  const [isSaving, setIsSaving] = useState(false);'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Added edit ops state");
