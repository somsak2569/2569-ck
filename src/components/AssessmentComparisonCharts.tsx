import React, { useState, useMemo } from 'react';
import { AssessmentRound, PatientScreening } from '../types';
import {
  getPatientAssessmentRounds,
  getPatientProgressSummary,
  getRiskColorBadge,
  getOASRiskBadge,
  getStressLevelDetails,
} from '../utils/assessment';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  LineChart,
  Activity,
  ShieldAlert,
  Smile,
  Calendar,
  Eye,
  Edit3,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface IndividualComparisonChartsProps {
  patient: PatientScreening;
  onSelectRoundToView?: (round: AssessmentRound) => void;
  onEditRound?: (round: AssessmentRound) => void;
  canModify?: boolean;
}

const formatDeltaBadge = (delta: number, unit = 'คะแนน') => {
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
        <TrendingDown className="w-3 h-3" />
        ลดลง {Math.abs(delta)} {unit} (ดีขึ้น)
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
        <TrendingUp className="w-3 h-3" />
        เพิ่มขึ้น +{delta} {unit}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
      <Minus className="w-3 h-3" />
      คงที่ (0)
    </span>
  );
};

export const IndividualComparisonCharts: React.FC<IndividualComparisonChartsProps> = ({
  patient,
  onSelectRoundToView,
  onEditRound,
  canModify = false,
}) => {
  const rounds = useMemo(() => getPatientAssessmentRounds(patient), [patient]);
  const progress = useMemo(() => getPatientProgressSummary(patient), [patient]);
  const [chartType, setChartType] = useState<'LINE' | 'BAR'>('LINE');
  const [focusedIndex, setFocusedIndex] = useState<number>(rounds.length - 1);

  const safeFocusedIdx = Math.min(Math.max(0, focusedIndex), rounds.length - 1);
  const focusedRound = rounds[safeFocusedIdx];

  // Build SVG chart geometry
  const svgWidth = Math.max(520, rounds.length * 110 + 90);
  const svgHeight = 250;
  const padLeft = 48;
  const padRight = 28;
  const padTop = 26;
  const padBottom = 48;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const max8QInRounds = Math.max(25, ...rounds.map((r) => r.eightQ?.totalScore ?? 0));
  const maxOASInRounds = Math.max(16, ...rounds.map((r) => r.oasAssessment?.totalScore ?? 0));
  const yMax = Math.max(max8QInRounds, maxOASInRounds, 20);

  const getX = (idx: number) => {
    if (rounds.length === 1) return padLeft + plotW / 2;
    return padLeft + (idx / (rounds.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    return padTop + plotH - (Math.min(val, yMax) / yMax) * plotH;
  };

  // Scale stress (1-5) onto chart axis cleanly (multiply by yMax / 5 so visual trend aligns)
  const getStressY = (score1to5: number) => {
    const scaled = (score1to5 / 5) * yMax;
    return getY(scaled);
  };

  const eightQPoints = rounds.map((r, i) => ({
    x: getX(i),
    y: getY(r.eightQ?.totalScore ?? 0),
    val: r.eightQ?.totalScore ?? 0,
  }));

  const oasPoints = rounds.map((r, i) => ({
    x: getX(i),
    y: getY(r.oasAssessment?.totalScore ?? 0),
    val: r.oasAssessment?.totalScore ?? 0,
  }));

  const stressPoints = rounds.map((r, i) => {
    const sc = getStressLevelDetails(r.stressAssessment?.level || 'NONE').score;
    return {
      x: getX(i),
      y: getStressY(sc),
      val: sc,
    };
  });

  const buildPolyline = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const hasAnyOAS = rounds.some((r) => r.oasAssessment !== undefined);

  return (
    <div className="space-y-4">
      {/* Top Progress Summary Strip (First vs Latest) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 8Q Progress */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900">คะแนนเสี่ยงฆ่าตัวตาย (8Q)</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-800">{progress.firstEightQ}</span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-2xl font-black text-rose-700">{progress.latestEightQ}</span>
            <span className="text-[11px] text-slate-500">คะแนน</span>
          </div>
          <div>
            {rounds.length >= 2 ? (
              formatDeltaBadge(progress.eightQDelta)
            ) : (
              <span className="text-[11px] text-slate-500">ประเมินแล้ว 1 ครั้ง (รอบแรก)</span>
            )}
          </div>
        </div>

        {/* OAS Progress */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900">พฤติกรรมก้าวร้าว (OAS)</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-800">{progress.firstOAS}</span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-2xl font-black text-amber-700">{progress.latestOAS}</span>
            <span className="text-[11px] text-slate-500">/ 16</span>
          </div>
          <div>
            {rounds.length >= 2 ? (
              formatDeltaBadge(progress.oasDelta)
            ) : (
              <span className="text-[11px] text-slate-500">ประเมินแล้ว 1 ครั้ง (รอบแรก)</span>
            )}
          </div>
        </div>

        {/* Stress Progress */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-900">ระดับความเครียด (1-5)</span>
            <Smile className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getStressLevelDetails(progress.firstRound.stressAssessment?.level || 'NONE').emoji}
            </span>
            <span className="text-sm font-black text-slate-800">ระดับ {progress.firstStressScore}</span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-lg">
              {getStressLevelDetails(progress.latestRound.stressAssessment?.level || 'NONE').emoji}
            </span>
            <span className="text-xl font-black text-teal-800">ระดับ {progress.latestStressScore}</span>
          </div>
          <div>
            {rounds.length >= 2 ? (
              formatDeltaBadge(progress.stressDelta, 'ระดับ')
            ) : (
              <span className="text-[11px] text-slate-500">ประเมินแล้ว 1 ครั้ง (รอบแรก)</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Comparison Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>กราฟเปรียบเทียบผลประเมินแต่ละครั้ง ({rounds.length} ครั้ง)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              เปรียบเทียบคะแนน 8Q, คะแนน OAS และระดับความเครียด ของ {patient.fullName}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartType('LINE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                chartType === 'LINE' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>กราฟเส้น</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('BAR')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                chartType === 'BAR' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>กราฟแท่ง</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
            คะแนน 8Q (0-52)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            คะแนน OAS (0-16)
          </span>
          <span className="flex items-center gap-1.5 text-teal-700">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
            ระดับความเครียด (ระดับ 1-5 เทียบสเกล)
          </span>
        </div>

        {/* Interactive SVG Chart */}
        <div className="overflow-x-auto pb-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[480px] h-56 select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padTop + plotH - ratio * plotH;
              const tickVal = Math.round(ratio * yMax);
              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={ratio === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-medium"
                  >
                    {tickVal}
                  </text>
                </g>
              );
            })}

            {/* 8Q High Risk Threshold Line (17) */}
            {yMax >= 17 && (
              <g>
                <line
                  x1={padLeft}
                  y1={getY(17)}
                  x2={svgWidth - padRight}
                  y2={getY(17)}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeDasharray="6 3"
                />
                <text
                  x={svgWidth - padRight}
                  y={getY(17) - 4}
                  textAnchor="end"
                  className="fill-rose-500 text-[9px] font-bold"
                >
                  เกณฑ์ 8Q รุนแรง (17)
                </text>
              </g>
            )}

            {chartType === 'LINE' ? (
              <g>
                {/* Lines (if > 1 round) */}
                {rounds.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                      points={buildPolyline(stressPoints)}
                    />
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      points={buildPolyline(oasPoints)}
                    />
                    <polyline
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3.5"
                      points={buildPolyline(eightQPoints)}
                    />
                  </>
                )}

                {/* Points & Click targets */}
                {rounds.map((r, i) => {
                  const isFocused = i === safeFocusedIdx;
                  const x = getX(i);
                  const ePt = eightQPoints[i];
                  const oPt = oasPoints[i];
                  const sPt = stressPoints[i];
                  return (
                    <g
                      key={r.roundId}
                      onClick={() => setFocusedIndex(i)}
                      className="cursor-pointer"
                    >
                      {isFocused && (
                        <rect
                          x={x - 24}
                          y={padTop}
                          width={48}
                          height={plotH}
                          rx={8}
                          fill="#fff1f2"
                          opacity={0.7}
                        />
                      )}
                      {/* Stress point */}
                      <circle cx={sPt.x} cy={sPt.y} r={isFocused ? 5.5 : 4.5} fill="#14b8a6" stroke="#fff" strokeWidth="1.5" />
                      {/* OAS point */}
                      <circle cx={oPt.x} cy={oPt.y} r={isFocused ? 6 : 5} fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                      <text
                        x={oPt.x + 8}
                        y={oPt.y - 6}
                        className="fill-amber-700 text-[10px] font-bold"
                      >
                        {oPt.val}
                      </text>
                      {/* 8Q point */}
                      <circle cx={ePt.x} cy={ePt.y} r={isFocused ? 7 : 5.5} fill="#e11d48" stroke="#fff" strokeWidth="2" />
                      <text
                        x={ePt.x}
                        y={ePt.y - 10}
                        textAnchor="middle"
                        className="fill-rose-700 text-[11px] font-black"
                      >
                        {ePt.val}
                      </text>

                      {/* X-axis label */}
                      <text
                        x={x}
                        y={svgHeight - 22}
                        textAnchor="middle"
                        className={`text-[11px] font-bold ${isFocused ? 'fill-rose-700' : 'fill-slate-700'}`}
                      >
                        ครั้งที่ {r.roundNumber}
                      </text>
                      <text
                        x={x}
                        y={svgHeight - 9}
                        textAnchor="middle"
                        className="fill-slate-400 text-[9px]"
                      >
                        {r.screeningDate}
                      </text>
                    </g>
                  );
                })}
              </g>
            ) : (
              /* Grouped Bar Chart */
              <g>
                {rounds.map((r, i) => {
                  const cx = getX(i);
                  const barW = rounds.length > 5 ? 12 : 16;
                  const gap = 4;
                  const isFocused = i === safeFocusedIdx;

                  const eVal = r.eightQ?.totalScore ?? 0;
                  const oVal = r.oasAssessment?.totalScore ?? 0;
                  const sScore = getStressLevelDetails(r.stressAssessment?.level || 'NONE').score;

                  const eY = getY(eVal);
                  const oY = getY(oVal);
                  const sY = getStressY(sScore);
                  const baseY = padTop + plotH;

                  return (
                    <g
                      key={r.roundId}
                      onClick={() => setFocusedIndex(i)}
                      className="cursor-pointer"
                    >
                      {isFocused && (
                        <rect
                          x={cx - (barW * 1.9)}
                          y={padTop}
                          width={barW * 3.8}
                          height={plotH}
                          rx={8}
                          fill="#fff1f2"
                          opacity={0.65}
                        />
                      )}
                      {/* Bar 1: 8Q */}
                      <rect
                        x={cx - barW * 1.5 - gap}
                        y={eY}
                        width={barW}
                        height={Math.max(2, baseY - eY)}
                        rx={4}
                        fill="#e11d48"
                      />
                      <text
                        x={cx - barW - gap}
                        y={eY - 4}
                        textAnchor="middle"
                        className="fill-rose-700 text-[10px] font-bold"
                      >
                        {eVal}
                      </text>

                      {/* Bar 2: OAS */}
                      <rect
                        x={cx - barW / 2}
                        y={oY}
                        width={barW}
                        height={Math.max(2, baseY - oY)}
                        rx={4}
                        fill="#f59e0b"
                      />
                      <text
                        x={cx}
                        y={oY - 4}
                        textAnchor="middle"
                        className="fill-amber-700 text-[10px] font-bold"
                      >
                        {oVal}
                      </text>

                      {/* Bar 3: Stress */}
                      <rect
                        x={cx + barW / 2 + gap}
                        y={sY}
                        width={barW}
                        height={Math.max(2, baseY - sY)}
                        rx={4}
                        fill="#14b8a6"
                      />
                      <text
                        x={cx + barW + gap}
                        y={sY - 4}
                        textAnchor="middle"
                        className="fill-teal-700 text-[10px] font-bold"
                      >
                        {sScore}/5
                      </text>

                      {/* X-axis label */}
                      <text
                        x={cx}
                        y={svgHeight - 22}
                        textAnchor="middle"
                        className={`text-[11px] font-bold ${isFocused ? 'fill-rose-700' : 'fill-slate-700'}`}
                      >
                        ครั้งที่ {r.roundNumber}
                      </text>
                      <text
                        x={cx}
                        y={svgHeight - 9}
                        textAnchor="middle"
                        className="fill-slate-400 text-[9px]"
                      >
                        {r.screeningDate}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Selected Round Quick Summary Strip */}
        {focusedRound && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-700 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                ครั้งที่ {focusedRound.roundNumber}
              </span>
              <span className="text-slate-600 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {focusedRound.screeningDate}
              </span>
              <span className="text-slate-700">
                ความเครียด: <strong>{getStressLevelDetails(focusedRound.stressAssessment?.level || 'NONE').emoji} {getStressLevelDetails(focusedRound.stressAssessment?.level || 'NONE').label}</strong>
              </span>
              <span className="text-rose-700 font-bold">
                8Q: {focusedRound.eightQ?.totalScore ?? 0} คะแนน
              </span>
              {focusedRound.oasAssessment && (
                <span className="text-amber-700 font-bold">
                  OAS: {focusedRound.oasAssessment.totalScore}/16
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {onSelectRoundToView && (
                <button
                  type="button"
                  onClick={() => onSelectRoundToView(focusedRound)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-rose-400 text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>ดูคำตอบรอบนี้</span>
                </button>
              )}
              {canModify && onEditRound && (
                <button
                  type="button"
                  onClick={() => onEditRound(focusedRound)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>แก้ไขรอบนี้</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OAS 4-Domain Multi-Round Comparison (when OAS exists) */}
      {hasAnyOAS && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>เปรียบเทียบคะแนน OAS รายด้าน (0-4 คะแนน) ในแต่ละครั้ง</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                ติดตามพัฒนาการพฤติกรรมก้าวร้าวแยก 4 ด้าน (วาจา, สิ่งของ, ตนเอง, ผู้อื่น)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'verbalScore', title: '1. ก้าวร้าวทางวาจา', barColor: 'bg-rose-500' },
              { key: 'propertyScore', title: '2. ต่อสิ่งของ/ทรัพย์สิน', barColor: 'bg-amber-500' },
              { key: 'selfScore', title: '3. ทำร้ายตนเอง', barColor: 'bg-purple-500' },
              { key: 'otherScore', title: '4. ทำร้ายผู้อื่น', barColor: 'bg-red-600' },
            ].map((domain) => (
              <div key={domain.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-800">{domain.title}</div>
                <div className="space-y-1.5">
                  {rounds.map((r) => {
                    const score = r.oasAssessment
                      ? (r.oasAssessment[domain.key as keyof typeof r.oasAssessment] as number) || 0
                      : 0;
                    return (
                      <div key={r.roundId} className="flex items-center gap-2 text-[11px]">
                        <span className="w-14 shrink-0 font-semibold text-slate-600">
                          ครั้งที่ {r.roundNumber}
                        </span>
                        <div className="flex-1 bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${domain.barColor}`}
                            style={{ width: `${(score / 4) * 100}%` }}
                          />
                        </div>
                        <span className="w-9 text-right font-bold text-slate-800">
                          {r.oasAssessment ? `${score}/4` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-side Comparison Table across Rounds */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-rose-600" />
            <span>ตารางเปรียบเทียบผลประเมินทุกครั้ง</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">เรียงตามครั้งที่ 1 → {rounds.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-bold">ครั้งที่ / วันที่</th>
                <th className="py-2.5 px-3 font-bold">ความเครียด</th>
                <th className="py-2.5 px-3 font-bold">2Q Plus</th>
                <th className="py-2.5 px-3 font-bold">คะแนน 8Q</th>
                <th className="py-2.5 px-3 font-bold">คะแนน OAS</th>
                <th className="py-2.5 px-3 font-bold">สถานะดูแล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rounds.map((r) => {
                const stress = getStressLevelDetails(r.stressAssessment?.level || 'NONE');
                const risk = getRiskColorBadge(r.eightQ?.riskLevel || 'NONE');
                const oas = r.oasAssessment ? getOASRiskBadge(r.oasAssessment.riskLevel) : null;
                return (
                  <tr
                    key={r.roundId}
                    onClick={() => onSelectRoundToView?.(r)}
                    className="hover:bg-rose-50/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">ครั้งที่ {r.roundNumber}</div>
                      <div className="text-[11px] text-slate-500">{r.screeningDate}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stress.badgeClass}`}>
                        <span>{stress.emoji}</span>
                        <span>{stress.label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.twoQ.hasDepressionRisk ? (
                        <span className="text-amber-700 font-bold">เสี่ยงซึมเศร้า</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">ปกติ</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${risk.badge}`}>
                        {r.eightQ ? `${r.eightQ.totalScore} (${risk.label})` : '0 (ปกติ)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.oasAssessment && oas ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${oas.bg}`}>
                          {r.oasAssessment.totalScore}/16 ({oas.label})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-700 font-medium">{r.followUpStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// Overall Multi-Round Comparison Charts (ภาพรวมทั้งหมด)
// =========================================================================

interface OverallComparisonChartsProps {
  patients: PatientScreening[];
  onViewPatientCompare?: (patient: PatientScreening) => void;
  title?: string;
}

export const OverallComparisonCharts: React.FC<OverallComparisonChartsProps> = ({
  patients,
  onViewPatientCompare,
  title = 'เปรียบเทียบผลการประเมินหลายครั้งในภาพรวมทั้งหมด',
}) => {
  const [viewMode, setViewMode] = useState<'AVG_SCORE' | 'RISK_DIST'>('AVG_SCORE');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const analytics = useMemo(() => {
    const allPatientRounds = patients.map((p) => ({
      patient: p,
      rounds: getPatientAssessmentRounds(p),
      progress: getPatientProgressSummary(p),
    }));

    const totalAssessments = allPatientRounds.reduce((sum, item) => sum + item.rounds.length, 0);
    const multiRoundPatients = allPatientRounds.filter((item) => item.rounds.length >= 2);

    const improvedCount = multiRoundPatients.filter((i) => i.progress.trend === 'IMPROVED').length;
    const stableCount = multiRoundPatients.filter((i) => i.progress.trend === 'STABLE').length;
    const worsenedCount = multiRoundPatients.filter((i) => i.progress.trend === 'WORSENED').length;

    const maxRounds = Math.max(1, ...allPatientRounds.map((i) => i.rounds.length));

    // Aggregate per round number (ครั้งที่ 1, ครั้งที่ 2, ครั้งที่ 3, ...)
    const roundBuckets = Array.from({ length: maxRounds }, (_, idx) => {
      const rNum = idx + 1;
      const roundsAtN = allPatientRounds
        .map((item) => item.rounds[idx])
        .filter((r): r is AssessmentRound => r !== undefined);

      const count = roundsAtN.length;
      const avg8Q = count > 0
        ? roundsAtN.reduce((s, r) => s + (r.eightQ?.totalScore ?? 0), 0) / count
        : 0;
      const oasList = roundsAtN.filter((r) => r.oasAssessment !== undefined);
      const avgOAS = oasList.length > 0
        ? oasList.reduce((s, r) => s + (r.oasAssessment?.totalScore ?? 0), 0) / oasList.length
        : 0;
      const avgStress = count > 0
        ? roundsAtN.reduce((s, r) => s + getStressLevelDetails(r.stressAssessment?.level || 'NONE').score, 0) / count
        : 0;

      const high8Q = roundsAtN.filter((r) => r.eightQ?.riskLevel === 'HIGH').length;
      const med8Q = roundsAtN.filter((r) => r.eightQ?.riskLevel === 'MEDIUM').length;
      const low8Q = roundsAtN.filter((r) => r.eightQ?.riskLevel === 'LOW').length;
      const none8Q = count - high8Q - med8Q - low8Q;

      return {
        roundNumber: rNum,
        count,
        avg8Q,
        avgOAS,
        avgStress,
        high8Q,
        med8Q,
        low8Q,
        none8Q,
      };
    });

    // First vs Latest averages for multi-round patients
    const multiCount = multiRoundPatients.length;
    const avgFirst8Q = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.firstEightQ, 0) / multiCount
      : 0;
    const avgLatest8Q = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.latestEightQ, 0) / multiCount
      : 0;
    const avgFirstOAS = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.firstOAS, 0) / multiCount
      : 0;
    const avgLatestOAS = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.latestOAS, 0) / multiCount
      : 0;
    const avgFirstStress = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.firstStressScore, 0) / multiCount
      : 0;
    const avgLatestStress = multiCount > 0
      ? multiRoundPatients.reduce((s, i) => s + i.progress.latestStressScore, 0) / multiCount
      : 0;

    return {
      allPatientRounds,
      totalAssessments,
      multiRoundPatients,
      improvedCount,
      stableCount,
      worsenedCount,
      roundBuckets,
      avgFirst8Q,
      avgLatest8Q,
      avgFirstOAS,
      avgLatestOAS,
      avgFirstStress,
      avgLatestStress,
    };
  }, [patients]);

  const effectivePatient = useMemo(() => {
    if (selectedPatientId) {
      const found = patients.find((p) => p.id === selectedPatientId);
      if (found) return found;
    }
    return analytics.multiRoundPatients[0]?.patient || patients[0] || null;
  }, [selectedPatientId, patients, analytics.multiRoundPatients]);

  // SVG chart dims for roundBuckets
  const buckets = analytics.roundBuckets;
  const svgW = Math.max(480, buckets.length * 130 + 80);
  const svgH = 235;
  const padL = 44;
  const padR = 24;
  const padT = 24;
  const padB = 42;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const maxYVal = Math.max(
    20,
    ...buckets.map((b) => Math.max(b.avg8Q, b.avgOAS))
  );

  const getRoundX = (idx: number) => {
    if (buckets.length === 1) return padL + plotW / 2;
    return padL + (idx / (buckets.length - 1)) * plotW;
  };
  const getRoundY = (v: number) => padT + plotH - (Math.min(v, maxYVal) / maxYVal) * plotH;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-rose-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ประมวลผลการประเมินซ้ำรายครั้ง ({analytics.totalAssessments} ครั้ง จากผู้รับการประเมิน {patients.length} ราย)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('AVG_SCORE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'AVG_SCORE' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>คะแนนเฉลี่ยรายครั้ง</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('RISK_DIST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'RISK_DIST' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>สัดส่วนระดับความเสี่ยง</span>
          </button>
        </div>
      </div>

      {/* KPI Row for Multi-Round Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>บันทึกประเมินสะสม</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {analytics.totalAssessments} <span className="text-xs font-medium text-slate-500">ครั้ง</span>
          </div>
          <div className="text-[11px] text-slate-500">
            ติดตามซ้ำ ≥ 2 ครั้ง: <strong className="text-rose-700">{analytics.multiRoundPatients.length} ราย</strong>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
            <span>แนวโน้มดีขึ้น</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {analytics.improvedCount} <span className="text-xs font-medium text-emerald-600">ราย</span>
          </div>
          <div className="text-[11px] text-emerald-700">
            {analytics.multiRoundPatients.length > 0
              ? `${((analytics.improvedCount / analytics.multiRoundPatients.length) * 100).toFixed(0)}% ของผู้ติดตามซ้ำ`
              : 'ยังไม่มีข้อมูลติดตามซ้ำ'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
          <div className="text-[11px] font-semibold text-blue-800 flex items-center justify-between">
            <span>อาการคงที่</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700">
            {analytics.stableCount} <span className="text-xs font-medium text-blue-600">ราย</span>
          </div>
          <div className="text-[11px] text-blue-700">
            คะแนนไม่เปลี่ยนแปลง
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1">
          <div className="text-[11px] font-semibold text-rose-800 flex items-center justify-between">
            <span>เสี่ยงเพิ่มขึ้น / เฝ้าระวัง</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {analytics.worsenedCount} <span className="text-xs font-medium text-rose-600">ราย</span>
          </div>
          <div className="text-[11px] text-rose-700">
            ต้องติดตามช่วยเหลือใกล้ชิด
          </div>
        </div>
      </div>

      {/* Main Overall Comparison Chart + Before/After Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
          {viewMode === 'AVG_SCORE' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800">
                  กราฟเปรียบเทียบค่าเฉลี่ยคะแนนรายครั้ง (ครั้งที่ 1 → ครั้งที่ {buckets.length})
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> 8Q เฉลี่ย
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> OAS เฉลี่ย
                  </span>
                  <span className="flex items-center gap-1 text-teal-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> ความเครียด (×4)
                  </span>
                </div>
              </div>

              {patients.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  ยังไม่มีข้อมูลการประเมินในขอบเขตนี้
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[440px] h-52 select-none">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = padT + plotH - ratio * plotH;
                      return (
                        <g key={ratio}>
                          <line
                            x1={padL}
                            y1={y}
                            x2={svgW - padR}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray={ratio === 0 ? undefined : '4 4'}
                          />
                          <text x={padLeft(padL)} y={y + 3} textAnchor="end" className="fill-slate-400 text-[10px]">
                            {Math.round(ratio * maxYVal)}
                          </text>
                        </g>
                      );
                    })}

                    {buckets.length > 1 && (
                      <>
                        <polyline
                          fill="none"
                          stroke="#e11d48"
                          strokeWidth="3"
                          points={buckets.map((b, i) => `${getRoundX(i)},${getRoundY(b.avg8Q)}`).join(' ')}
                        />
                        <polyline
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          points={buckets.map((b, i) => `${getRoundX(i)},${getRoundY(b.avgOAS)}`).join(' ')}
                        />
                      </>
                    )}

                    {buckets.map((b, i) => {
                      const cx = getRoundX(i);
                      const barW = 16;
                      const baseY = padT + plotH;
                      const y8Q = getRoundY(b.avg8Q);
                      const yOAS = getRoundY(b.avgOAS);
                      const yStress = getRoundY((b.avgStress / 5) * maxYVal);

                      return (
                        <g key={b.roundNumber}>
                          {/* 8Q avg bar */}
                          <rect
                            x={cx - barW - 6}
                            y={y8Q}
                            width={barW}
                            height={Math.max(2, baseY - y8Q)}
                            rx={4}
                            fill="#e11d48"
                            opacity={0.85}
                          />
                          <text x={cx - barW / 2 - 6} y={y8Q - 5} textAnchor="middle" className="fill-rose-700 text-[10px] font-bold">
                            {b.avg8Q.toFixed(1)}
                          </text>

                          {/* OAS avg bar */}
                          <rect
                            x={cx - barW / 2}
                            y={yOAS}
                            width={barW}
                            height={Math.max(2, baseY - yOAS)}
                            rx={4}
                            fill="#f59e0b"
                            opacity={0.88}
                          />
                          <text x={cx} y={yOAS - 5} textAnchor="middle" className="fill-amber-700 text-[10px] font-bold">
                            {b.avgOAS.toFixed(1)}
                          </text>

                          {/* Stress avg bar */}
                          <rect
                            x={cx + barW / 2 + 6}
                            y={yStress}
                            width={barW}
                            height={Math.max(2, baseY - yStress)}
                            rx={4}
                            fill="#14b8a6"
                            opacity={0.85}
                          />
                          <text x={cx + barW + 6} y={yStress - 5} textAnchor="middle" className="fill-teal-700 text-[10px] font-bold">
                            {b.avgStress.toFixed(1)}/5
                          </text>

                          <text x={cx} y={svgH - 20} textAnchor="middle" className="fill-slate-800 text-[11px] font-bold">
                            ครั้งที่ {b.roundNumber}
                          </text>
                          <text x={cx} y={svgH - 7} textAnchor="middle" className="fill-slate-500 text-[9px]">
                            ({b.count} ราย)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </>
          ) : (
            /* Risk Distribution Stacked Bars per Round */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800">
                  สัดส่วนระดับความเสี่ยง 8Q ในการประเมินแต่ละครั้ง
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> รุนแรง</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ปานกลาง</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> น้อย</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ปกติ</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {buckets.map((b) => (
                  <div key={b.roundNumber} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">
                        การประเมินครั้งที่ {b.roundNumber} ({b.count} ราย)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        รุนแรง {b.high8Q} • ปานกลาง {b.med8Q} • น้อย {b.low8Q} • ปกติ {b.none8Q}
                      </span>
                    </div>
                    <div className="h-5 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                      {b.high8Q > 0 && (
                        <div
                          style={{ width: `${(b.high8Q / b.count) * 100}%` }}
                          className="h-full bg-rose-600 text-[10px] text-white font-bold flex items-center justify-center"
                          title={`รุนแรง: ${b.high8Q} ราย`}
                        >
                          {(b.high8Q / b.count) * 100 >= 10 && `${((b.high8Q / b.count) * 100).toFixed(0)}%`}
                        </div>
                      )}
                      {b.med8Q > 0 && (
                        <div
                          style={{ width: `${(b.med8Q / b.count) * 100}%` }}
                          className="h-full bg-amber-500 text-[10px] text-white font-bold flex items-center justify-center"
                          title={`ปานกลาง: ${b.med8Q} ราย`}
                        >
                          {(b.med8Q / b.count) * 100 >= 10 && `${((b.med8Q / b.count) * 100).toFixed(0)}%`}
                        </div>
                      )}
                      {b.low8Q > 0 && (
                        <div
                          style={{ width: `${(b.low8Q / b.count) * 100}%` }}
                          className="h-full bg-yellow-400 text-[10px] text-yellow-950 font-bold flex items-center justify-center"
                          title={`น้อย: ${b.low8Q} ราย`}
                        >
                          {(b.low8Q / b.count) * 100 >= 10 && `${((b.low8Q / b.count) * 100).toFixed(0)}%`}
                        </div>
                      )}
                      {b.none8Q > 0 && (
                        <div
                          style={{ width: `${(b.none8Q / b.count) * 100}%` }}
                          className="h-full bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center"
                          title={`ปกติ: ${b.none8Q} ราย`}
                        >
                          {(b.none8Q / b.count) * 100 >= 10 && `${((b.none8Q / b.count) * 100).toFixed(0)}%`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Before vs After Summary Card (ผู้ที่ประเมิน >= 2 ครั้ง) */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-pink-50/50 to-white space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-600" />
              <span>เปรียบเทียบครั้งแรก vs ครั้งล่าสุด</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              ค่าเฉลี่ยกลุ่มที่ประเมิน ≥ 2 ครั้ง ({analytics.multiRoundPatients.length} ราย)
            </p>
          </div>

          {analytics.multiRoundPatients.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              ยังไม่มีผู้ป่วยที่บันทึกการประเมินมากกว่า 1 ครั้ง
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: 'คะแนน 8Q เฉลี่ย',
                  first: analytics.avgFirst8Q,
                  latest: analytics.avgLatest8Q,
                  max: 35,
                  color: 'bg-rose-600',
                },
                {
                  label: 'คะแนน OAS เฉลี่ย',
                  first: analytics.avgFirstOAS,
                  latest: analytics.avgLatestOAS,
                  max: 16,
                  color: 'bg-amber-500',
                },
                {
                  label: 'ระดับความเครียดเฉลี่ย',
                  first: analytics.avgFirstStress,
                  latest: analytics.avgLatestStress,
                  max: 5,
                  color: 'bg-teal-600',
                },
              ].map((m) => (
                <div key={m.label} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{m.label}</span>
                    <span>
                      {m.first.toFixed(1)} → <strong className="text-rose-700">{m.latest.toFixed(1)}</strong>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-12 text-slate-500">ครั้งแรก</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${Math.min(100, (m.first / m.max) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-12 text-rose-700 font-bold">ล่าสุด</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min(100, (m.latest / m.max) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Individual Comparison Preview Selector */}
      {effectivePatient && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                ดูกราฟเปรียบเทียบรายบุคคลแบบรวดเร็ว
              </h4>
              <p className="text-[11px] text-slate-500">
                เลือกชื่อคนไข้เพื่อเปรียบเทียบผลคะแนนแต่ละครั้งของบุคคลนั้นทันที
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={effectivePatient.id}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50/40 text-xs font-bold text-rose-950 outline-none focus:ring-2 focus:ring-rose-400"
              >
                {analytics.allPatientRounds.map(({ patient, rounds }) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} (ประเมิน {rounds.length} ครั้ง • ต.{patient.tambon})
                  </option>
                ))}
              </select>
              {onViewPatientCompare && (
                <button
                  type="button"
                  onClick={() => onViewPatientCompare(effectivePatient)}
                  className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  เปิดหน้าเต็ม
                </button>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200">
            <IndividualComparisonCharts patient={effectivePatient} />
          </div>
        </div>
      )}
    </div>
  );
};

function padLeft(val: number): number {
  return val - 8;
}
