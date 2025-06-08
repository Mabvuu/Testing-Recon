import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";

const HEADERS = [
  "Date","Name","Gross Premium","Cancellation","Actual Gross",
  "Commission %","Commission","Net Premium","ZINARA","PPA GROSS",
  "PPA %","PPA Commission","Net PPA","Approved expenses",
  "Expected remittances"
];

const BANKS = [
  "Ecocash", "CBZ Bank Limited","Standard Chartered Bank Zimbabwe","FBC Bank Limited",
  "Stanbic Bank Zimbabwe","Ecobank Zimbabwe","ZB Bank Limited","BancABC Zimbabwe",
  "NMB Bank Limited","Agribank (Agricultural Bank of Zimbabwe)","Steward Bank",
  "POSB (People's Own Savings Bank)","Metbank Limited","First Capital Bank",
];

const CURRENCY_SYMBOLS = { USD: "$", ZWG: "ZWG " };
const normalize = str =>
  str.toString().trim().toLowerCase().replace(/[\s_/]+/g, "");
const getValue = (row, header) => {
  const key = Object.keys(row).find(k => normalize(k) === normalize(header));
  return key ? row[key] : "";
};
const formatAmt = (num, currency) =>
  `${CURRENCY_SYMBOLS[currency] || ""}${parseFloat(num||0).toFixed(2)}`;

export default function Cashbook() {
  const { posId } = useParams();
  const { state: { name } = {} } = useLocation();
  const navigate = useNavigate();

  const [currency, setCurrency] = useState(localStorage.getItem("currency")||"USD");
  const [excelData, setExcelData] = useState(JSON.parse(localStorage.getItem("excelData"))||[]);
  const [filteredData, setFilteredData] = useState(JSON.parse(localStorage.getItem("filteredData"))||[]);
  const [searchName, setSearchName] = useState(localStorage.getItem("searchName")||"");
  const [notification, setNotification] = useState(null);
  const [selectedBank, setSelectedBank] = useState(localStorage.getItem("selectedBank")||"");

  useEffect(()=>{ localStorage.setItem("currency",currency) },[currency]);
  useEffect(()=>{ localStorage.setItem("excelData",JSON.stringify(excelData)) },[excelData]);
  useEffect(()=>{
    localStorage.setItem("filteredData",JSON.stringify(filteredData));
    localStorage.setItem("searchName",searchName);
    localStorage.setItem("selectedBank",selectedBank);
  },[filteredData,searchName,selectedBank]);

  const showNote = (msg,type="success")=>setNotification({msg,type});

  const recalcRow = row => {
    const gp = parseFloat(getValue(row,"Gross Premium"))||0;
    const canc = parseFloat(getValue(row,"Cancellation"))||0;
    const actual = gp - canc;
    const comm = actual * ((row.commissionPct||0)/100);
    const netPrem = actual - comm;
    const ppaG = parseFloat(row.ppaGross)||0;
    const ppaComm = ppaG * ((row.ppaPct||0)/100);
    const netP = ppaG - ppaComm;
    const zin = parseFloat(row.ZINARA)||0;
    const exp = parseFloat(row.approvedExpenses)||0;
    const remits = netPrem + zin + netP - exp;
    return { actual, comm, netPrem, ppaComm, netP, remits };
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if(!file) return showNote("No file selected","error");
    if(!selectedBank) return showNote("Select a bank first","error");
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data,{type:"array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet,{defval:""});
      const rows = raw.map(r => {
        const base = {
          ...r,
          commissionPct:0, ppaGross:0, ppaPct:0,
          ZINARA:0, approvedExpenses:0,
          Bank: selectedBank,
        };
        const { actual, comm, netPrem, ppaComm, netP, remits } = recalcRow(base);
        return {
          ...base,
          actualGross: actual,
          commission: comm,
          netPremium: netPrem,
          ppaCommission: ppaComm,
          netPpa: netP,
          expectedRemittances: remits,
        };
      });
      setExcelData(rows);
      setFilteredData([]);
      showNote("Excel loaded");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFieldChange = (i,field,val) => {
    const list = filteredData.length ? [...filteredData] : [...excelData];
    list[i][field] = val;
    const { actual, comm, netPrem, ppaComm, netP, remits } = recalcRow(list[i]);
    list[i].actualGross = actual;
    list[i].commission = comm;
    list[i].netPremium = netPrem;
    list[i].ppaCommission = ppaComm;
    list[i].netPpa = netP;
    list[i].expectedRemittances = remits;
    filteredData.length ? setFilteredData(list) : setExcelData(list);
  };

  const handleStart = () => {
    if(!searchName.trim()) return showNote("Type a name","error");
    const filtered = excelData.filter(r=>
      getValue(r,"Name").trim().toLowerCase()===searchName.trim().toLowerCase()
    );
    setFilteredData(filtered);
    showNote(`${filtered.length} row(s)`);
  };

  const saveReportToServer = async () => {
    if(!name) return showNote("Name required","error");
    try {
      const date = new Date().toISOString().slice(0,10);
      const tableData = (filteredData.length ? filteredData : excelData).map(row=>{
        const mapped = {};
        HEADERS.forEach(h=>{
          switch(h){
            case "Actual Gross": mapped[h] = formatAmt(row.actualGross,currency); break;
            case "Commission %": mapped[h] = (row.commissionPct||0).toString(); break;
            case "Commission": mapped[h] = formatAmt(row.commission,currency); break;
            case "Net Premium": mapped[h] = formatAmt(row.netPremium,currency); break;
            case "ZINARA": mapped[h] = (row.ZINARA||0).toString(); break;
            case "PPA GROSS": mapped[h] = (row.ppaGross||0).toString(); break;
            case "PPA %": mapped[h] = (row.ppaPct||0).toString(); break;
            case "PPA Commission": mapped[h] = formatAmt(row.ppaCommission,currency); break;
            case "Net PPA": mapped[h] = formatAmt(row.netPpa,currency); break;
            case "Approved expenses": mapped[h] = (row.approvedExpenses||0).toString(); break;
            case "Expected remittances": mapped[h] = formatAmt(row.expectedRemittances,currency); break;
            default: mapped[h] = getValue(row,h).toString();
          }
        });
        mapped["Bank"] = row.Bank;
        return mapped;
      });
      const res = await fetch("http://localhost:3001/api/reports/upload", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name, posId, date, currency, source: "sales", tableData })
      });
      if(!res.ok) throw new Error();
      const { reportId } = await res.json();
      showNote(`Saved ID: ${reportId}`);
    } catch {
      showNote("Save failed","error");
    }
  };

  const clearLast = () => {
    setExcelData([]); setFilteredData([]); setSearchName("");
    localStorage.removeItem("excelData");
    localStorage.removeItem("filteredData");
    localStorage.removeItem("searchName");
    showNote("Cleared");
  };

  const data = filteredData.length ? filteredData : excelData;

  return (
    <div id="sales" className="flex flex-col pt-36 px-4 h-screen bg-gray-50">
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-auto p-4 rounded shadow-lg ${
            notification.type==="success"?"bg-green-100":"bg-red-100"
          }`}>
            <div className="flex items-center justify-between">
              <span>{notification.msg}</span>
              <button onClick={()=>setNotification(null)} className="ml-4 font-bold">×</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-white shadow flex flex-wrap items-end space-x-4">
        <h1 className="text-xl font-bold">Cashbook</h1>

        <label className="flex flex-col">
          <span className="text-sm">Currency</span>
          <select
            value={currency}
            onChange={e=>setCurrency(e.target.value)}
            className="p-2 w-24 border rounded"
          >
            <option value="USD">USD  </option>
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

        <div className="flex flex-col flex-grow max-w-sm">
          <input
            type="text"
            placeholder="Search name"
            value={searchName}
            onChange={e=>setSearchName(e.target.value)}
            className="p-2 border rounded mb-2"
          />
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-indigo-500 text-white rounded"
          >Start</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-max">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {HEADERS.map(h=>(
                  <th key={h} className="p-2 border bg-gray-100 text-left text-sm">{h}</th>
                ))}
                
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.length===0
                ? <tr><td colSpan={HEADERS.length+1} className="p-4 text-center text-gray-500">No data.</td></tr>
                : data.map((row,i)=>(
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border text-sm">{getValue(row,"Date")}</td>
                    <td className="p-2 border text-sm">{getValue(row,"Name")}</td>
                    <td className="p-2 border text-sm">{getValue(row,"Gross Premium")}</td>
                    <td className="p-2 border text-sm">{getValue(row,"Cancellation")}</td>
                    <td className="p-2 border text-sm">{formatAmt(row.actualGross,currency)}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.commissionPct||''}
                        onChange={e=>handleFieldChange(i,"commissionPct",+e.target.value)}
                        className="w-16 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 border text-sm">{formatAmt(row.commission,currency)}</td>
                    <td className="p-2 border text-sm">{formatAmt(row.netPremium,currency)}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.ZINARA||''}
                        onChange={e=>handleFieldChange(i,"ZINARA",+e.target.value)}
                        className="w-16 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.ppaGross||''}
                        onChange={e=>handleFieldChange(i,"ppaGross",+e.target.value)}
                        className="w-16 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.ppaPct||''}
                        onChange={e=>handleFieldChange(i,"ppaPct",+e.target.value)}
                        className="w-16 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 border text-sm">{formatAmt(row.ppaCommission,currency)}</td>
                    <td className="p-2 border text-sm">{formatAmt(row.netPpa,currency)}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.approvedExpenses||''}
                        onChange={e=>handleFieldChange(i,"approvedExpenses",+e.target.value)}
                        className="w-16 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 border text-sm">{formatAmt(row.expectedRemittances,currency)}</td>
                    <td className="p-2 border text-sm">{selectedBank}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-white shadow flex justify-end space-x-3">
        <button onClick={()=>navigate(-1)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">Back</button>
        <button onClick={saveReportToServer} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Done</button>
        <button onClick={clearLast} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Clear</button>
        <button onClick={()=>navigate(`/cashbook/${posId}/payments`,{state:{name}})} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}
