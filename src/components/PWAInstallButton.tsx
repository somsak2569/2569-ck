import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share2, 
  PlusSquare, 
  X, 
  CheckCircle2, 
  WifiOff, 
  HelpCircle 
} from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'navbar' 
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleButtonClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
            isInstallable
              ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-500 animate-pulse'
              : 'bg-teal-700/80 hover:bg-teal-600 text-white border-teal-500/80'
          } ${className}`}
          title="ติดตั้งแอปบนมือถือหรือคอมพิวเตอร์เพื่อเปิดใช้งานได้เร็วและสะดวกยิ่งขึ้น"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xs:inline">ติดตั้งแอป</span>
          <span className="xs:hidden">แอป</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-4 rounded-2xl shadow-sm border border-teal-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/80 border border-teal-400/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="font-bold text-sm">ติดตั้งแอปบนหน้าจอมือถือ / คอมพิวเตอร์</div>
              <div className="text-xs text-teal-200">เข้าใช้งานสะดวก รวดเร็ว รองรับทั้ง iOS, Android, Windows และ Mac</div>
            </div>
          </div>
          <button
            onClick={handleButtonClick}
            className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>ติดตั้งแอปเพื่อใช้งาน</span>
          </button>
        </div>
      )}

      {/* Guide Modal for iOS Safari, Android, and Desktop */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    ติดตั้งแอป "คนเชียงกลางไม่ทิ้งกัน"
                  </h3>
                  <p className="text-xs text-slate-500">
                    ใช้งานได้เหมือนแอปแท้ทุกระบบ โดยไม่ต้องดาวน์โหลดผ่าน App Store
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction content based on platform */}
            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>วิธีติดตั้งบน iPhone / iPad (Safari)</span>
                </div>
                <ol className="space-y-2.5 list-decimal list-inside pl-1 text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-teal-800 shrink-0">1.</span>
                    <span>แตะปุ่ม <strong>แชร์ (Share)</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-1" /> ที่แถบเมนูด้านล่างของ Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-teal-800 shrink-0">2.</span>
                    <span>เลื่อนลงมาแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 mx-1" /></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-teal-800 shrink-0">3.</span>
                    <span>แตะ <strong>"เพิ่ม" (Add)</strong> ที่มุมขวาบน จะมีไอคอนแอปปรากฏบนหน้าจอมือถือของคุณทันที</span>
                  </li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>วิธีติดตั้งบน Android (Chrome / Samsung Internet)</span>
                </div>
                {isInstallable ? (
                  <div className="space-y-2">
                    <p className="text-slate-600">เบราว์เซอร์ของคุณพร้อมติดตั้งได้ทันที:</p>
                    <button
                      onClick={async () => {
                        await install();
                        setShowGuideModal(false);
                      }}
                      className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>กดติดตั้งทันที</span>
                    </button>
                  </div>
                ) : (
                  <ol className="space-y-2.5 list-decimal list-inside pl-1 text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-teal-800 shrink-0">1.</span>
                      <span>แตะปุ่มเมนู <strong>3 จุด (⋮)</strong> ที่มุมขวาบนของ Chrome</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-teal-800 shrink-0">2.</span>
                      <span>เลือก <strong>"ติดตั้งแอป" (Install App)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-teal-800 shrink-0">3.</span>
                      <span>กดยืนยันการติดตั้งเพื่อใช้งานเต็มจอ</span>
                    </li>
                  </ol>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-teal-600" />
                  <span>วิธีติดตั้งบนคอมพิวเตอร์ (Windows, Mac, ChromeOS)</span>
                </div>
                {isInstallable ? (
                  <div className="space-y-2">
                    <p className="text-slate-600">คลิกปุ่มด้านล่างเพื่อติดตั้งลงบนคอมพิวเตอร์ของคุณ:</p>
                    <button
                      onClick={async () => {
                        await install();
                        setShowGuideModal(false);
                      }}
                      className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>ติดตั้งโปรแกรมลงในคอมพิวเตอร์</span>
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2 text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>บน Google Chrome / Microsoft Edge:</strong> สังเกตไอคอนติดตั้ง <Download className="inline w-3 h-3 text-teal-700" /> ที่ด้านขวาของช่องกรอกที่อยู่เว็บไซต์ (URL bar) แล้วคลิก "ติดตั้ง"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>โปรแกรมจะเปิดเป็นหน้าต่างแยกต่างหาก มีไอคอนบนเดสก์ท็อป และทำงานได้เต็มหน้าจอ</span>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* Advantages of PWA */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-[11px] text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-teal-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>ประโยชน์เมื่อติดตั้งลงอุปกรณ์:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-teal-800/90 pl-1">
                <li>เปิดใช้งานได้ทันทีจากหน้าจอ โดยไม่ต้องพิมพ์ค้นหา URL</li>
                <li>แสดงผลเต็มจอ ไม่มีแถบเบราว์เซอร์กวนสายตา</li>
                <li>บันทึกข้อมูลในเครื่องได้แม้ไม่มีอินเทอร์เน็ต และซิงค์อัตโนมัติเมื่อต่อเน็ต</li>
              </ul>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              เข้าใจแล้ว ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs px-3 py-1.5 text-center font-medium shadow-sm flex items-center justify-center gap-2 animate-fadeIn z-50">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        ขณะนี้อยู่ในโหมดออฟไลน์ (ไม่มีอินเทอร์เน็ต) — ข้อมูลจะถูกบันทึกไว้ในอุปกรณ์นี้อย่างปลอดภัย และจะซิงค์ขึ้นระบบคลาวด์อัตโนมัติเมื่อออนไลน์
      </span>
    </div>
  );
};
