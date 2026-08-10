import React from "react";
import { Order, Outlet } from "../types";
import { formatRupiah } from "../utils/formatters";
import { X, Printer, CheckCircle, Share2 } from "lucide-react";

interface ReceiptModalProps {
  order: Order | null;
  outlet: Outlet;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, outlet, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-100 relative">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-amber-200">Struk Pembayaran Thermal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Body */}
        <div id="thermal-receipt" className="my-6 bg-amber-50/95 text-stone-900 font-mono text-xs p-6 rounded-lg shadow-inner border border-stone-300 space-y-3">
          <div className="text-center space-y-1">
            <h2 className="font-extrabold text-base tracking-wider uppercase text-emerald-950">
              {outlet.name}
            </h2>
            <p className="text-[11px] text-stone-700">{outlet.address}, {outlet.city}</p>
            <p className="text-[10px] text-stone-600">Telp: {outlet.phone}</p>
            <p className="text-[10px] font-semibold text-emerald-800 pt-1">SUNDARESTO AI - SMART POS</p>
            <div className="border-b border-dashed border-stone-400 my-2"></div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>No. Struk:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{order.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Lokasi / Saung:</span>
              <span className="font-bold text-emerald-900">{order.tableCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{order.customerName} ({order.paxCount} Orang)</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{order.cashierName}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-stone-400 my-2"></div>

          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>{item.menuName}</span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-600">
                  <span>{item.qty} x {formatRupiah(item.price)}</span>
                  {item.note && <span className="italic text-amber-900">({item.note})</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-stone-400 my-2"></div>

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Diskon:</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pajak Resto (PB1 10%):</span>
              <span>{formatRupiah(order.taxPB1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge (5%):</span>
              <span>{formatRupiah(order.serviceCharge)}</span>
            </div>
            <div className="border-b border-stone-400 my-1"></div>
            <div className="flex justify-between font-extrabold text-sm text-stone-950 pt-1">
              <span>TOTAL BAYAR:</span>
              <span className="text-emerald-900">{formatRupiah(order.total)}</span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between text-[11px] font-semibold pt-1 text-stone-800">
                <span>Metode Bayar:</span>
                <span>{order.paymentMethod}</span>
              </div>
            )}
            {order.amountPaid !== undefined && (
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>Tunai / Diterima:</span>
                <span>{formatRupiah(order.amountPaid)}</span>
              </div>
            )}
            {order.changeDue !== undefined && order.changeDue > 0 && (
              <div className="flex justify-between text-[10px] text-stone-600">
                <span>Kembalian:</span>
                <span>{formatRupiah(order.changeDue)}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-stone-400 my-2"></div>

          {/* QR Code Simulation & Footer */}
          <div className="text-center space-y-2 pt-1">
            <div className="inline-block p-2 bg-white rounded border border-stone-300">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(order.orderNumber)}`}
                alt="QR Struk"
                className="w-20 h-20 mx-auto"
              />
            </div>
            <p className="text-[11px] font-bold text-emerald-900 italic">
              "Wilujeng Sumping & Hatur Nuhun!"
            </p>
            <p className="text-[9px] text-stone-600">
              Terima kasih telah berkunjung ke RM Sunda Resto.
              <br />
              Powered by SundaResto AI - Smart POS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk 80mm
          </button>
          <button
            onClick={() => {
              alert(`Link Struk Digital dikirim ke WhatsApp Pelanggan ${order.customerName}`);
            }}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-2.5 rounded-xl border border-stone-700 flex items-center justify-center transition"
            title="Kirim Struk via WA"
          >
            <Share2 className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
