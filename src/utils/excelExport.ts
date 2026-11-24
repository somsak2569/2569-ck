import * as XLSX from 'xlsx';
import { PatientScreening, User } from '../types';
import { getPatientAssessmentRounds, getStressLevelDetails } from './assessment';

export const exportPatientDataToExcel = (
  patients: PatientScreening[],
  currentUser: User,
  fileNamePrefix: string = 'รายงานคัดกรองความเสี่ยงฆ่าตัวตาย_คนเชียงกลางไม่ทิ้งกัน'
) => {
  // 1. Prepare Patient Details Sheet
  const patientRows = patients.map((p, index) => {
    const rounds = getPatientAssessmentRounds(p);
    return {
      'ลำดับ': index + 1,
      'จำนวนครั้งที่ประเมิน': rounds.length,
      'วันที่ประเมินล่าสุด': p.screeningDate,
      'กลุ่มคัดกรอง (ส่วนที่ 1)':
        p.screeningGroup === 'DEPRESSION_SUICIDE'
          ? 'เครียดซึมเศร้า อยากตาย'
          : p.screeningGroup === 'VIOLENCE_RISK'
          ? 'กลุ่มเสี่ยงก่อความรุนแรง'
          : 'ไม่ระบุ',
      'ชื่อ-สกุล': p.fullName,
      'เลขประจำตัวประชาชน': p.idCard || '-',
      'อายุ (ปี)': p.age,
      'เพศ': p.gender,
      'บ้านเลขที่': p.addressNo || '-',
      'หมู่ที่': p.villageNo || '-',
      'หมู่บ้าน': p.villageName,
      'ตำบล': p.tambon,
      'อำเภอ': 'เชียงกลาง',
      'จังหวัด': 'น่าน',
      'เบอร์โทรศัพท์': p.phone || '-',
      'โรคประจำตัว/ปัจจัยเสี่ยง': [
        ...p.chronicDiseases,
        p.otherChronicDisease ? `อื่นๆ: ${p.otherChronicDisease}` : '',
      ]
        .filter(Boolean)
        .join(', '),
      'ชื่อผู้ดูแล': p.caregiverName || '-',
      'ความสัมพันธ์ผู้ดูแล': p.caregiverRelation || '-',
      'เบอร์โทรผู้ดูแล': p.caregiverPhone || '-',
      'ระดับความเครียด (กรมสุขภาพจิต)': p.stressAssessment ? `${p.stressAssessment.emoji} ${p.stressAssessment.label}` : '😃 ไม่เครียด',
      'คะแนน OAS วาจา (0-4)': p.oasAssessment ? p.oasAssessment.verbalScore : '-',
      'คะแนน OAS สิ่งของ (0-4)': p.oasAssessment ? p.oasAssessment.propertyScore : '-',
      'คะแนน OAS ตนเอง (0-4)': p.oasAssessment ? p.oasAssessment.selfScore : '-',
      'คะแนน OAS ผู้อื่น (0-4)': p.oasAssessment ? p.oasAssessment.otherScore : '-',
      'คะแนน OAS รวม (0-16)': p.oasAssessment ? p.oasAssessment.totalScore : '-',
      'ระดับความก้าวร้าว (OAS)': p.oasAssessment ? p.oasAssessment.riskLabel : 'ยังไม่ได้ประเมิน',
      'ผู้ประเมิน OAS (รพ.สต.)': p.oasAssessment ? `${p.oasAssessment.assessedByName || '-'} (${p.oasAssessment.assessedByRole || '-'})` : '-',
      'ผลคัดกรอง 2Q Plus': p.twoQ.hasDepressionRisk ? 'เสี่ยงซึมเศร้า (มีอย่างน้อย 1 ข้อ)' : 'ปกติ (ไม่มีความเสี่ยง)',
      '2Q ข้อ 1 (หดหู่เศร้า)': p.twoQ.q1Depressed ? 'มี' : 'ไม่มี',
      '2Q ข้อ 2 (เบื่อไม่เพลิน)': p.twoQ.q2Anhedonia ? 'มี' : 'ไม่มี',
      '2Q ข้อ Plus (คิดทำร้ายตนเอง)': p.twoQ.qPlusSelfHarm ? 'มี' : 'ไม่มี',
      'ทำแบบประเมิน 8Q': p.eightQTriggered ? 'ทำแบบประเมิน' : 'ไม่ได้ทำ (2Q ปกติ)',
      'คะแนนรวม 8Q': p.eightQ ? p.eightQ.totalScore : '-',
      'ระดับความเสี่ยง 8Q': p.eightQ ? p.eightQ.riskLabel : 'ไม่มีความเสี่ยง (2Q ผ่าน)',
      'สถานะการดูแล/ส่งต่อ': p.followUpStatus,
      'รพ.สต. พี่เลี้ยง': p.mentorHospital,
      'ผู้ประเมิน': p.surveyorName,
      'ตำแหน่ง/สังกัด': p.surveyorRole,
      'เบอร์โทรผู้ประเมิน': p.surveyorPhone || '-',
      'หมายเหตุ/การดูแล': p.notes || '-',
    };
  });

  // 2. Prepare Summary Sheet
  const totalScreened = patients.length;
  const totalAssessmentRounds = patients.reduce(
    (sum, p) => sum + getPatientAssessmentRounds(p).length,
    0
  );
  const depressionSuicideGroupCount = patients.filter(
    (p) => p.screeningGroup === 'DEPRESSION_SUICIDE'
  ).length;
  const violenceRiskGroupCount = patients.filter(
    (p) => p.screeningGroup === 'VIOLENCE_RISK'
  ).length;
  const unspecifiedGroupCount = totalScreened - depressionSuicideGroupCount - violenceRiskGroupCount;

  const highRisk = patients.filter((p) => p.eightQ?.riskLevel === 'HIGH').length;
  const mediumRisk = patients.filter((p) => p.eightQ?.riskLevel === 'MEDIUM').length;
  const lowRisk = patients.filter((p) => p.eightQ?.riskLevel === 'LOW').length;
  const noRisk = totalScreened - highRisk - mediumRisk - lowRisk;

  const tambonCounts: Record<string, { total: number; high: number }> = {};
  patients.forEach((p) => {
    if (!tambonCounts[p.tambon]) {
      tambonCounts[p.tambon] = { total: 0, high: 0 };
    }
    tambonCounts[p.tambon].total += 1;
    if (p.eightQ?.riskLevel === 'HIGH') {
      tambonCounts[p.tambon].high += 1;
    }
  });

  const summaryRows = [
    { 'หัวข้อสรุป': 'ชื่อระบบ', 'รายละเอียด': 'คนเชียงกลางไม่ทิ้งกัน - ระบบประเมินเพื่อคัดกรองคนไข้ที่เสี่ยงการฆ่าตัวตาย' },
    { 'หัวข้อสรุป': 'หน่วยงานรับผิดชอบ', 'รายละเอียด': 'โรงพยาบาลเชียงกลาง จังหวัดน่าน' },
    { 'หัวข้อสรุป': 'ผู้พัฒนาระบบ', 'รายละเอียด': 'สมศักดิ์ สุทธการ' },
    { 'หัวข้อสรุป': 'วันที่ออกรายงาน', 'รายละเอียด': new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { 'หัวข้อสรุป': 'ผู้ออกรายงาน', 'รายละเอียด': `${currentUser.fullName} (${currentUser.roleLabel})` },
    { 'หัวข้อสรุป': 'ขอบเขตพื้นที่ในรายงาน', 'รายละเอียด': currentUser.role === 'ADMIN' ? 'ทุกตำบลในอำเภอเชียงกลาง' : `ตำบล${currentUser.tambon} (${currentUser.hospital})` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปจำนวนผู้รับการคัดกรอง ==', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': 'จำนวนผู้ได้รับการคัดกรองทั้งหมด', 'รายละเอียด': `${totalScreened} คน (รวมประวัติการประเมินทั้งหมด ${totalAssessmentRounds} ครั้ง)` },
    {
      'หัวข้อสรุป': 'กลุ่มเป้าหมาย (ส่วนที่ 1): เครียดซึมเศร้า อยากตาย',
      'รายละเอียด': `${depressionSuicideGroupCount} คน (${totalScreened > 0 ? ((depressionSuicideGroupCount / totalScreened) * 100).toFixed(1) : 0}%)`,
    },
    {
      'หัวข้อสรุป': 'กลุ่มเป้าหมาย (ส่วนที่ 1): กลุ่มเสี่ยงก่อความรุนแรง',
      'รายละเอียด': `${violenceRiskGroupCount} คน (${totalScreened > 0 ? ((violenceRiskGroupCount / totalScreened) * 100).toFixed(1) : 0}%)`,
    },
    ...(unspecifiedGroupCount > 0
      ? [{ 'หัวข้อสรุป': 'กลุ่มเป้าหมาย (ส่วนที่ 1): ยังไม่ระบุ', 'รายละเอียด': `${unspecifiedGroupCount} คน` }]
      : []),
    { 'หัวข้อสรุป': 'เสี่ยงรุนแรง (8Q >= 17)', 'รายละเอียด': `${highRisk} คน (${totalScreened > 0 ? ((highRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'เสี่ยงปานกลาง (8Q 9-16)', 'รายละเอียด': `${mediumRisk} คน (${totalScreened > 0 ? ((mediumRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'เสี่ยงน้อย (8Q 1-8)', 'รายละเอียด': `${lowRisk} คน (${totalScreened > 0 ? ((lowRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'ไม่มีความเสี่ยง / ปกติ', 'รายละเอียด': `${noRisk} คน (${totalScreened > 0 ? ((noRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปสถิติระดับความเครียด (กรมสุขภาพจิต 5 ระดับ) ==', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '😃 ระดับ 1: ไม่เครียด', 'รายละเอียด': `${patients.filter((p) => (p.stressAssessment?.level || 'NONE') === 'NONE').length} คน` },
    { 'หัวข้อสรุป': '😊 ระดับ 2: เครียดน้อย', 'รายละเอียด': `${patients.filter((p) => p.stressAssessment?.level === 'LOW').length} คน` },
    { 'หัวข้อสรุป': '😐 ระดับ 3: เครียดปานกลาง', 'รายละเอียด': `${patients.filter((p) => p.stressAssessment?.level === 'MILD').length} คน` },
    { 'หัวข้อสรุป': '😟 ระดับ 4: เครียดสูง', 'รายละเอียด': `${patients.filter((p) => p.stressAssessment?.level === 'MODERATE').length} คน` },
    { 'หัวข้อสรุป': '😫 ระดับ 5: เครียดรุนแรงมาก', 'รายละเอียด': `${patients.filter((p) => p.stressAssessment?.level === 'SEVERE').length} คน` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปสถิติพฤติกรรมก้าวร้าวรุนแรง (Overt Aggression Scale: OAS) ==', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': 'จำนวนผู้ได้รับการประเมิน OAS', 'รายละเอียด': `${patients.filter((p) => p.oasAssessment !== undefined).length} คน` },
    { 'หัวข้อสรุป': '🔴 OAS เสี่ยงรุนแรงมาก (>= 9 หรือข้อใด 4)', 'รายละเอียด': `${patients.filter((p) => p.oasAssessment?.riskLevel === 'HIGH').length} คน` },
    { 'หัวข้อสรุป': '🟠 OAS เสี่ยงปานกลาง (4-8 คะแนน)', 'รายละเอียด': `${patients.filter((p) => p.oasAssessment?.riskLevel === 'MEDIUM').length} คน` },
    { 'หัวข้อสรุป': '🟡 OAS เสี่ยงน้อย (1-3 คะแนน)', 'รายละเอียด': `${patients.filter((p) => p.oasAssessment?.riskLevel === 'LOW').length} คน` },
    { 'หัวข้อสรุป': '🟢 OAS ปกติ (0 คะแนน)', 'รายละเอียด': `${patients.filter((p) => p.oasAssessment && p.oasAssessment.riskLevel === 'NONE').length} คน` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปสถิติแยกตามตำบล (อำเภอเชียงกลาง) ==', 'รายละเอียด': '' },
    ...Object.entries(tambonCounts).map(([tambon, data]) => ({
      'หัวข้อสรุป': `ตำบล ${tambon}`,
      'รายละเอียด': `คัดกรอง ${data.total} คน (เสี่ยงรุนแรง ${data.high} คน)`,
    })),
  ];

  // 3. Prepare Multi-Round History Sheet
  const historyRows: Record<string, string | number>[] = [];
  patients.forEach((p) => {
    const rounds = getPatientAssessmentRounds(p);
    rounds.forEach((r) => {
      const stress = getStressLevelDetails(r.stressAssessment?.level || 'NONE');
      const groupLabel =
        (r.screeningGroup ?? p.screeningGroup) === 'DEPRESSION_SUICIDE'
          ? 'เครียดซึมเศร้า อยากตาย'
          : (r.screeningGroup ?? p.screeningGroup) === 'VIOLENCE_RISK'
          ? 'กลุ่มเสี่ยงก่อความรุนแรง'
          : 'ไม่ระบุ';
      historyRows.push({
        'รหัสคนไข้': p.id,
        'ชื่อ-สกุล': p.fullName,
        'หมู่บ้าน': p.villageName,
        'ตำบล': p.tambon,
        'ประเมินครั้งที่': r.roundNumber,
        'วันที่ประเมิน': r.screeningDate,
        'กลุ่มคัดกรอง': groupLabel,
        'ระดับความเครียด (1-5)': `${stress.emoji} ${stress.label} (${stress.score}/5)`,
        'ผล 2Q Plus': r.twoQ.hasDepressionRisk ? 'เสี่ยงซึมเศร้า' : 'ปกติ',
        'คะแนน OAS รวม (0-16)': r.oasAssessment ? r.oasAssessment.totalScore : '-',
        'OAS วาจา': r.oasAssessment ? r.oasAssessment.verbalScore : '-',
        'OAS สิ่งของ': r.oasAssessment ? r.oasAssessment.propertyScore : '-',
        'OAS ตนเอง': r.oasAssessment ? r.oasAssessment.selfScore : '-',
        'OAS ผู้อื่น': r.oasAssessment ? r.oasAssessment.otherScore : '-',
        'ระดับความเสี่ยง OAS': r.oasAssessment ? r.oasAssessment.riskLabel : 'ยังไม่ได้ประเมิน',
        'คะแนน 8Q': r.eightQ ? r.eightQ.totalScore : 0,
        'ระดับความเสี่ยง 8Q': r.eightQ ? r.eightQ.riskLabel : 'ปกติ (2Q ผ่าน)',
        'สถานะติดตาม': r.followUpStatus,
        'ผู้ประเมิน': r.surveyorName || p.surveyorName,
        'ตำแหน่งผู้ประเมิน': r.surveyorRole || p.surveyorRole,
        'หมายเหตุ': r.notes || '-',
      });
    });
  });

  // Create workbook and append worksheets
  const wb = XLSX.utils.book_new();

  const wsPatients = XLSX.utils.json_to_sheet(patientRows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsHistory = XLSX.utils.json_to_sheet(historyRows);

  // Set column widths for better readability
  wsPatients['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 16 }, // จำนวนครั้ง
    { wch: 14 }, // วันที่
    { wch: 24 }, // กลุ่มคัดกรอง (ส่วนที่ 1)
    { wch: 22 }, // ชื่อสกุล
    { wch: 18 }, // บัตร
    { wch: 8 },  // อายุ
    { wch: 6 },  // เพศ
    { wch: 12 }, // บ้านเลขที่
    { wch: 10 }, // หมู่ที่
    { wch: 20 }, // หมู่บ้าน
    { wch: 14 }, // ตำบล
    { wch: 12 }, // อำเภอ
    { wch: 10 }, // จังหวัด
    { wch: 14 }, // โทร
    { wch: 30 }, // โรคประจำตัว
    { wch: 20 }, // ผู้ดูแล
    { wch: 16 }, // ความสัมพันธ์
    { wch: 14 }, // โทรผู้ดูแล
    { wch: 24 }, // ความเครียด
    { wch: 16 }, // OAS วาจา
    { wch: 16 }, // OAS สิ่งของ
    { wch: 16 }, // OAS ตนเอง
    { wch: 16 }, // OAS ผู้อื่น
    { wch: 16 }, // OAS รวม
    { wch: 24 }, // OAS ระดับ
    { wch: 24 }, // ผู้ประเมิน OAS
    { wch: 22 }, // 2Q ผล
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 }, // คะแนน 8Q
    { wch: 28 }, // ระดับความเสี่ยง
    { wch: 22 }, // สถานะ
    { wch: 20 }, // รพสต
    { wch: 20 }, // ผู้ประเมิน
    { wch: 22 },
    { wch: 14 },
    { wch: 35 },
  ];

  wsSummary['!cols'] = [
    { wch: 35 },
    { wch: 60 },
  ];

  wsHistory['!cols'] = [
    { wch: 14 }, // รหัสคนไข้
    { wch: 22 }, // ชื่อ-สกุล
    { wch: 18 }, // หมู่บ้าน
    { wch: 14 }, // ตำบล
    { wch: 14 }, // ครั้งที่
    { wch: 14 }, // วันที่
    { wch: 22 }, // กลุ่มคัดกรอง
    { wch: 22 }, // ความเครียด
    { wch: 16 }, // 2Q
    { wch: 16 }, // OAS รวม
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 24 }, // OAS ระดับ
    { wch: 12 }, // 8Q
    { wch: 24 }, // 8Q ระดับ
    { wch: 22 }, // สถานะ
    { wch: 20 }, // ผู้ประเมิน
    { wch: 22 },
    { wch: 32 }, // หมายเหตุ
  ];

  XLSX.utils.book_append_sheet(wb, wsPatients, 'ทะเบียนคัดกรองคนไข้');
  XLSX.utils.book_append_sheet(wb, wsHistory, 'ประวัติประเมินรายครั้ง');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปภาพรวมสถิติ');

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
};

export const exportMembersToExcel = (
  users: User[],
  fileNamePrefix: string = 'รายชื่อสมาชิก_คนเชียงกลางไม่ทิ้งกัน'
) => {
  const userRows = users.map((u, index) => ({
    'ลำดับ': index + 1,
    'ชื่อ-สกุล': u.fullName,
    'ชื่อผู้ใช้ (Username)': u.username,
    'อีเมล': u.email,
    'สิทธิ์ในระบบ': u.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : u.role === 'HEALTH_OFFICER' ? 'เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง)' : 'นสช. ประจำหมู่บ้าน',
    'ตำแหน่งแสดง': u.roleLabel,
    'ตำบลที่รับผิดชอบ': u.tambon,
    'หมู่บ้านที่รับผิดชอบ': u.village,
    'รพ.สต. พี่เลี้ยง / สังกัด': u.hospital,
    'เบอร์โทรศัพท์': u.phone || '-',
    'วันที่ลงทะเบียน': u.createdAt,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(userRows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 16 },
    { wch: 26 },
    { wch: 24 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อสมาชิก');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
};
