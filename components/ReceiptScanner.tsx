"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, Check } from "lucide-react";

type ParsedReceipt = {
  merchant: string;
  items: { name: string; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
};

export function ReceiptScanner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setParsedData(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setParsedData(data);
      } else {
        alert("Failed to scan receipt.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while scanning.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    setSaving(true);
    try {
      const { total, merchant, date } = parsedData;
      const text = `Spent Rs. ${total} at ${merchant} on ${date}`;

      const res = await fetch("/api/parse-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        setFile(null);
        setPreview(null);
        setParsedData(null);
        router.refresh();
      } else {
        alert("Failed to save transaction.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!parsedData ? (
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div
            className="w-full border-2 border-dashed border-on-surface-variant/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Receipt preview" className="max-h-[200px] object-contain rounded-xl" />
            ) : (
              <>
                <Camera size={48} className="text-on-surface-variant" />
                <div className="text-center">
                  <p className="text-primary font-bold">Tap to take a photo or upload</p>
                  <p className="text-[13px] text-on-surface-variant">Supports JPG, PNG</p>
                </div>
              </>
            )}
          </div>
          
          {file && (
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full h-[48px] bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Scanning...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Scan Receipt
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 bg-surface-dim p-4 rounded-3xl">
          <h3 className="font-bold text-primary">Parsed Details</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-on-surface-variant font-medium ml-1">Merchant</label>
              <input
                value={parsedData.merchant || ""}
                onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                className="w-full h-[40px] px-4 bg-surface rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[12px] text-on-surface-variant font-medium ml-1">Total</label>
                <input
                  type="number"
                  value={parsedData.total || ""}
                  onChange={(e) => setParsedData({ ...parsedData, total: parseFloat(e.target.value) })}
                  className="w-full h-[40px] px-4 bg-surface rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[12px] text-on-surface-variant font-medium ml-1">Date</label>
                <input
                  type="date"
                  value={parsedData.date || ""}
                  onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                  className="w-full h-[40px] px-4 bg-surface rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-2 h-[48px] bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Check size={20} />
            )}
            Confirm & Save
          </button>
        </div>
      )}
    </div>
  );
}
