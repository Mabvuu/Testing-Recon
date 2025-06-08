import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

const BANKS = [
  "CBZ Bank Limited","Standard Chartered Bank Zimbabwe","FBC Bank Limited",
  "Stanbic Bank Zimbabwe","Ecobank Zimbabwe","ZB Bank Limited","BancABC Zimbabwe",
  "NMB Bank Limited","Agribank (Agricultural Bank of Zimbabwe)","Steward Bank",
  "POSB (People's Own Savings Bank)","Metbank Limited","First Capital Bank",
];

export default function Payments() {
  const { posId } = useParams();
  const { state: { name } = {} } = useLocation();
  const navigate = useNavigate();

  // currency + bank
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [selectedBank, setSelectedBank] = useState(localStorage.getItem('paymentsSelectedBank') || '');
  useEffect(() => { localStorage.setItem('currency', currency) }, [currency]);
  useEffect(() => { localStorage.setItem('paymentsSelectedBank', selectedBank) }, [selectedBank]);

  // data + search
  const [excelData, setExcelData] = useState(
    JSON.parse(localStorage.getItem('paymentsExcelData')) || []
  );
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem('paymentsSearchTerm') || ''
  );
  useEffect(() => {
    localStorage.setItem('paymentsExcelData', JSON.stringify(excelData));
  }, [excelData]);
  useEffect(() => {
    localStorage.setItem('paymentsSearchTerm', searchTerm);
  }, [searchTerm]);

  const [notification, setNotification] = useState(null);
  const showNote = (msg, type = 'success') => setNotification({ msg, type });

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return showNote('No file selected', 'error');
    if (!/\.(xlsx|xls)$/i.test(file.name)) return showNote('Only .xlsx/.xls allowed', 'error');
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setExcelData(XLSX.utils.sheet_to_json(sheet, { defval: '' }));
      showNote('Excel loaded');
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredData = excelData.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const updateCell = (rowIdx, key, value) =>
    setExcelData(d => d.map((row, i) =>
      i === rowIdx ? { ...row, [key]: value } : row
    ));

  const saveReportToServer = async () => {
    if (!name) return showNote('Name required', 'error');
    const date = new Date().toISOString().slice(0,10);
    const tableData = filteredData.map(row => {
      const m = { ...row, Bank: selectedBank };
      Object.keys(m).forEach(k => { m[k] = m[k].toString() });
      return m;
    });
    try {
      const res = await fetch('http://localhost:3001/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, posId, date, currency, bank: selectedBank, source: "payments", tableData })
      });
      if (!res.ok) throw new Error();
      const { reportId } = await res.json();
      showNote(`Saved as report ${reportId}`);
    } catch {
      showNote('Save failed', 'error');
    }
  };

  const clearAll = () => {
    setExcelData([]);
    setSearchTerm('');
    setSelectedBank('');
    localStorage.removeItem('paymentsExcelData');
    localStorage.removeItem('paymentsSearchTerm');
    localStorage.removeItem('paymentsSelectedBank');
    showNote('Cleared');
  };

  return (
    <div id="payments" className="flex flex-col pt-20 px-4 h-screen bg-gray-50">
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-auto p-4 rounded shadow-lg ${
              notification.type==='success'? 'bg-green-100' : 'bg-red-100'
            }`}>
            <div className="flex items-center justify-between">
              <span>{notification.msg}</span>
              <button onClick={()=>setNotification(null)} className="ml-4 font-bold">×</button>
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <div className="p-4 bg-white shadow flex flex-wrap items-end space-x-4">
        <h1 className="text-xl font-bold flex-shrink-0">Payments</h1>
        <div className="text-sm text-gray-600">
          POS ID: <span className="font-medium">{posId}</span>
        </div>
        <label className="flex flex-col">
          <span className="text-sm">Currency</span>
          <select
            value={currency}
            onChange={e=>setCurrency(e.target.value)}
            className="p-2 border w-24 rounded"
          >
            <option value="USD">USD </option>
            <option value="ZWG">ZWG</option>
          </select>
        </label>
        <label className="flex flex-col">
          <span className="text-sm">Bank</span>
          <select
            value={selectedBank}
            onChange={e=>setSelectedBank(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">--Select a Bank--</option>
            {BANKS.map(b=> <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="p-2 border rounded flex-grow min-w-[200px]"
        />
        {excelData.length > 0 && (
          <div className="flex flex-col flex-grow max-w-sm">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              className="p-2 border rounded mb-2"
            />
          </div>
        )}
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto p-4">
        {filteredData.length > 0 ? (
          <div className="min-w-max">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(filteredData[0]).map(h=>(
                    <th key={h} className="p-2 border bg-gray-100 text-left text-sm">{h}</th>
                  ))}
                  <th className="p-2 border bg-gray-100 text-left text-sm">Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((row,i)=>(
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.entries(row).map(([k,v])=>(
                      <td key={k} className="p-2 border text-sm">
                        <input
                          type="text"
                          value={v}
                          onChange={e=>updateCell(i,k,e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                        />
                      </td>
                    ))}
                    <td className="p-2 border text-sm">{selectedBank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No data.</p>
        )}
      </div>

      {/* footer */}
      <div className="p-4 bg-white shadow flex justify-end space-x-3">
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >Clear</button>
        {excelData.length > 0 && (
          <button
            onClick={saveReportToServer}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >Save</button>
        )}
        <button
          onClick={()=>navigate(-1)}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >Back</button>
        <button
          onClick={()=>navigate('/reports', { state: { name, posId } })}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >Next</button>
      </div>
    </div>
  );
}
