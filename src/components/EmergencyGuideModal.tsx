import React from 'react';
import { X, HeartHandshake, PhoneCall, CheckCircle, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/chiangklangData';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyGuideModal: React.FC<EmergencyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                คู่มือช่วยเหลือและหลักการ 3 ส.
              </h3>
              <p className="text-xs text-teal-200">
                แนวทางปฏิบัติสำหรับ อสม. และเจ้าหน้าที่สาธารณสุขอำเภอเชียงกลาง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* 3 ส. Protocol */}
          <div className="space-y-3">
            <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              หลัก 3 ส. ในการป้องกันการฆ่าตัวตาย (กรมสุขภาพจิต)
            </h4>

            {/* 1. สอดส่องมองหา */}
            <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1">
              <div className="font-bold text-teal-900 text-xs sm:text-sm">
                1. สอดส่องมองหา (Look)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                สังเกตสัญญาณเตือน เช่น ซึมเศร้า เก็บตัว บ่นอยากตาย พูดสั่งเสีย แจกจ่ายของมีค่า นอนไม่หลับ ดื่มสุราหนักขึ้น หรือมีภาวะวิกฤตสูญเสีย/หนี้สินในครอบครัว
              </p>
            </div>

            {/* 2. ใส่ใจรับฟัง */}
            <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1">
              <div className="font-bold text-teal-900 text-xs sm:text-sm">
                2. ใส่ใจรับฟัง (Listen)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                รับฟังด้วยความเข้าอกเข้าใจ ไม่ตัดสิน ไม่สั่งสอน ไม่ตำหนิ ให้พื้นที่ระบายความทุกข์ใจ แสดงความห่วงใยและให้กำลังใจว่า “คนเชียงกลางไม่ทิ้งกัน”
              </p>
            </div>

            {/* 3. ส่งต่อเชื่อมโยง */}
            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1">
              <div className="font-bold text-rose-900 text-xs sm:text-sm">
                3. ส่งต่อเชื่อมโยง (Link)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                หากพบว่ามีความเสี่ยงสูง (คะแนน 8Q &gt;= 17) ให้ประสานญาติดูแลใกล้ชิดตลอด 24 ชม. ไม่ปล่อยให้อยู่ลำพัง เก็บสิ่งของอันตราย และส่งต่อด่วนไปยัง รพ.สต. หรือ รพ.เชียงกลาง ทันที
              </p>
            </div>
          </div>

          {/* Emergency contacts list */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              เบอร์โทรฉุกเฉินและหน่วยงานรับส่งต่อ
            </h4>

            <div className="space-y-1.5">
              {EMERGENCY_CONTACTS.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.note}</div>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                    className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{c.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
