"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatNumber = (num: number) => {
  return "Rp" + num.toLocaleString("id-ID");
};

export default function Home() {
  const [modal, setModal] = useState(10000000);
  const [jumlahIndukanBeli, setJumlahIndukanBeli] = useState(2);
  const [lamaInvestasi, setLamaInvestasi] = useState(36);
  const [resikoInduk, setResikoInduk] = useState(5);
  const [resikoAnak, setResikoAnak] = useState(10);
  const [hargaJualAnak, setHargaJualAnak] = useState(1500000);
  const [hargaBeliInduk, setHargaBeliInduk] = useState(2500000);
  const [biayaPakan, setBiayaPakan] = useState(100000);
  const [strategiPenjualan, setStrategiPenjualan] = useState("50-50");
  const [dataChart, setDataChart] = useState<any[]>([]);
  const [totalKeuntungan, setTotalKeuntungan] = useState<number | null>(null);
  const [totalPendapatanAnakState, setTotalPendapatanAnakState] = useState<number | null>(null);
  const [totalBiayaPakanState, setTotalBiayaPakanState] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [investasiBerulang, setInvestasiBerulang] = useState(false);
  const [nominalInvestasiBerulang, setNominalInvestasiBerulang] = useState(5000000);
  const [periodeInvestasiBerulang, setPeriodeInvestasiBerulang] = useState(12);

  function simulasi() {
    const biayaIndukan = jumlahIndukanBeli * hargaBeliInduk;
    let saldo = modal - biayaIndukan;

    if (saldo < biayaPakan * jumlahIndukanBeli) {
      setWarning("Sisa modal tidak cukup untuk operasional pakan awal setelah membeli indukan.");
      setDataChart([]);
      return;
    }

    setWarning(null);

    let currentIndukan = jumlahIndukanBeli;
    let currentSaldo = saldo;
    let hasil = [];
    let totalPendapatanAnak = 0;
    let totalBiayaPakan = 0;

    let daftarAnakTumbuh: { jumlah: number; umur: number }[] = [];

    for (let i = 1; i <= lamaInvestasi; i++) {
      if (investasiBerulang && i % periodeInvestasiBerulang === 0) {
        let indukanBaru = Math.floor(nominalInvestasiBerulang / hargaBeliInduk);
        currentIndukan += indukanBaru;
      }

      if (Math.random() < resikoInduk / 1200) {
        currentIndukan = Math.max(0, currentIndukan - 1);
      }

      // Tambah umur anak-anak
      daftarAnakTumbuh.forEach((anak) => anak.umur++);

      // Proses kelahiran tiap 8 bulan
      if (i % 8 === 0) {
        let anak = currentIndukan * 1.5;
        anak -= anak * (resikoAnak / 100);
        daftarAnakTumbuh.push({ jumlah: anak, umur: 0 });
      }

      let dijual = 0;
      let dibesarkan = 0;

      const anakSiapJual = daftarAnakTumbuh.filter((a) => a.umur >= 3);
      for (let j = 0; j < anakSiapJual.length; j++) {
        const anak = anakSiapJual[j];
        if (strategiPenjualan === "semua") {
          dijual += anak.jumlah;
        } else if (strategiPenjualan === "tidak-dijual") {
          dibesarkan += anak.jumlah;
        } else if (strategiPenjualan === "sebagian") {
          dijual += anak.jumlah * 0.25;
          dibesarkan += anak.jumlah * 0.75;
        } else {
          dijual += anak.jumlah * 0.5;
          dibesarkan += anak.jumlah * 0.5;
        }
      }

      // Hapus anak yang sudah dijual/dibesarkan
      daftarAnakTumbuh = daftarAnakTumbuh.filter((a) => a.umur < 3);

      // Update pendapatan dan indukan dari hasil anak yang dibesarkan
      const pendapatanAnak = dijual * hargaJualAnak;
      totalPendapatanAnak += pendapatanAnak;
      currentSaldo += pendapatanAnak;
      currentIndukan += dibesarkan;

      const biayaPakanBulan = currentIndukan * biayaPakan;
      totalBiayaPakan += biayaPakanBulan;

      if (currentSaldo < biayaPakanBulan) {
        currentSaldo = 0;
      } else {
        currentSaldo -= biayaPakanBulan;
      }

      const totalNilai = currentSaldo + currentIndukan * hargaBeliInduk;

      hasil.push({
        bulan: `Bulan ${i}`,
        Saldo: Math.round(currentSaldo),
        "Nilai Aset": Math.round(currentIndukan * hargaBeliInduk),
        "Total Indukan": Math.round(currentIndukan),
      });
    }

    const finalVal = hasil[hasil.length - 1]["Saldo"] + hasil[hasil.length - 1]["Nilai Aset"];
    setDataChart(hasil);
    setTotalKeuntungan(finalVal - modal);
    setTotalPendapatanAnakState(totalPendapatanAnak);
    setTotalBiayaPakanState(totalBiayaPakan);
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 bg-green-50 rounded-xl shadow-md">
      <div className="flex items-center space-x-4">
        <img src="/domba.png" alt="Domba" className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-green-700">Simulator Investasi Domba</h1>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <Label>Modal Awal</Label>
            <Input type="number" value={modal} onChange={(e) => setModal(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Jumlah Indukan Awal</Label>
            <Input type="number" value={jumlahIndukanBeli} onChange={(e) => setJumlahIndukanBeli(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Lama Investasi (bulan)</Label>
            <Input type="number" value={lamaInvestasi} onChange={(e) => setLamaInvestasi(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Investasi Berulang?</Label>
            <select
              value={investasiBerulang ? "ya" : "tidak"}
              onChange={(e) => setInvestasiBerulang(e.target.value === "ya")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="tidak">Tidak</option>
              <option value="ya">Ya</option>
            </select>
          </div>

          {investasiBerulang && (
            <>
              <div>
                <Label>Nominal Investasi Berulang</Label>
                <Input
                  type="number"
                  value={nominalInvestasiBerulang}
                  onChange={(e) => setNominalInvestasiBerulang(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Periode Investasi (bulan)</Label>
                <Input
                  type="number"
                  value={periodeInvestasiBerulang}
                  onChange={(e) => setPeriodeInvestasiBerulang(Number(e.target.value) || 1)}
                />
              </div>
            </>
          )}

          <div>
            <Label>Resiko Kematian Induk (%)</Label>
            <Input type="number" value={resikoInduk} onChange={(e) => setResikoInduk(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Resiko Kematian Anak (%)</Label>
            <Input type="number" value={resikoAnak} onChange={(e) => setResikoAnak(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Harga Jual Anak</Label>
            <Input type="number" value={hargaJualAnak} onChange={(e) => setHargaJualAnak(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Harga Beli Induk</Label>
            <Input type="number" value={hargaBeliInduk} onChange={(e) => setHargaBeliInduk(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Biaya Pakan / Induk / Bulan</Label>
            <Input type="number" value={biayaPakan} onChange={(e) => setBiayaPakan(Number(e.target.value) || 0)} />
          </div>
          <div className="col-span-2">
            <Label>Strategi Penjualan</Label>
            <select
              value={strategiPenjualan}
              onChange={(e) => setStrategiPenjualan(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="semua">Jual semua anak</option>
              <option value="tidak-dijual">Besarkan semua anak</option>
              <option value="sebagian">Jual 25%, besarkan 75%</option>
              <option value="50-50">Jual 50%, besarkan 50%</option>
            </select>
          </div>

          <Button onClick={simulasi} className="col-span-2 bg-green-700 hover:bg-green-800 text-white">
            Jalankan Simulasi
          </Button>

          {warning && (
            <div className="col-span-2 text-red-600 font-semibold">
              ⚠️ {warning}
            </div>
          )}
        </CardContent>
      </Card>

      {dataChart.length > 0 && (
        <>
          {/* Section: Penjelasan Rumus */}
          <div className="bg-white p-4 rounded shadow-md space-y-2">
            <h2 className="text-lg font-bold text-green-700">📘 Cara Kerja Simulasi</h2>
            <ul className="list-disc list-inside text-sm">
              <li><strong>Modal Awal:</strong> Digunakan untuk membeli indukan dan membiayai pakan setiap bulan</li>
              <li><strong>Jumlah Indukan:</strong> Modal Indukan ÷ Harga Beli Induk</li>
              <li><strong>Setiap 8 bulan:</strong> Indukan melahirkan rata-rata 1.5 anak</li>
              <li><strong>Risiko Kematian:</strong> Diterapkan ke indukan (per bulan) dan anak (saat lahir)</li>
              <li><strong>Strategi Penjualan:</strong> Menentukan berapa persen anak dijual/dibesarkan jadi induk baru</li>
              <li><strong>Hasil Jual Anak:</strong> Dipakai untuk biaya pakan ke depannya. Anak akan dijual ketika usia 3 bulan</li>
              <li><strong>Investasi Berulang:</strong> Menambah indukan setiap X bulan jika opsi ini aktif</li>
              <li><strong>Keuntungan:</strong> Saldo akhir + Nilai aset domba - Total modal</li>
            </ul>
          </div>

          {/* Section: Ringkasan Keuangan */}
          <div className="bg-white p-4 rounded shadow-md space-y-2">
            <h2 className="text-lg font-bold text-green-700">📊 Hasil Investasi</h2>
            <p><strong>Total Pendapatan dari Penjualan Anak:</strong> {formatNumber(totalPendapatanAnakState || 0)}</p>
            <p><strong>Total Biaya Pakan:</strong> {formatNumber(totalBiayaPakanState || 0)}</p>
            <p><strong>Keuntungan Akhir:</strong> {formatNumber(totalKeuntungan || 0)}</p>
          </div>
          <Card>
            <CardContent className="pt-4 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Saldo" stroke="#8884d8" />
                  <Line type="monotone" dataKey="Nilai Aset" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 overflow-auto">
              <table className="table-auto w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Bulan</th>
                    <th className="border px-2 py-1">Saldo</th>
                    <th className="border px-2 py-1">Nilai Aset</th>
                    <th className="border px-2 py-1">Total Indukan</th>
                  </tr>
                </thead>
                <tbody>
                  {dataChart.map((d, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{d.bulan}</td>
                      <td className="border px-2 py-1">{formatNumber(d.Saldo)}</td>
                      <td className="border px-2 py-1">{formatNumber(d["Nilai Aset"])}</td>
                      <td className="border px-2 py-1">{d["Total Indukan"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
