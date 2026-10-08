import React from 'react';
import { HeartHandshake, ShieldCheck, PhoneCall, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Brand & Organization */}
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
            <span>แอพพลิเคชัน “คนเชียงกลางไม่ทิ้งกัน”</span>
          </div>
          <p className="text-slate-400 text-xs">
            สำนักงานสาธารณสุขอำเภอเชียงกลาง จังหวัดน่าน • ระบบประเมินเพื่อคัดกรองคนไข้ที่เสี่ยงการฆ่าตัวตาย (2Q Plus และ 8Q)
          </p>
        </div>

        {/* Developer Credit & Support */}
        <div className="flex flex-col md:items-end space-y-1 text-xs">
          <div className="flex items-center justify-center md:justify-end gap-1.5 text-teal-300 font-semibold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Code className="w-4 h-4 text-amber-400" />
            <span>ผู้พัฒนาระบบ: <strong>สมศักดิ์ สุทธการ</strong></span>
          </div>
          <p className="text-slate-500 text-[11px]">
            เพื่อพัฒนาระบบงานสุขภาพจิตและจิตเวชชุมชน อำเภอเชียงกลาง
          </p>
        </div>
      </div>
    </footer>
  );
};
