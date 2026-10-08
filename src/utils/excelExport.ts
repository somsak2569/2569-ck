import * as XLSX from 'xlsx';
import { PatientScreening, User } from '../types';

export const exportPatientDataToExcel = (
  patients: PatientScreening[],
  currentUser: User,
  fileNamePrefix: string = 'รายงานคัดกรองความเสี่ยงฆ่าตัวตาย_คนเชียงกลางไม่ทิ้งกัน'
) => {
  // 1. Prepare Patient Details Sheet
  const patientRows = patients.map((p, index) => {
    return {
      'ลำดับ': index + 1,
      'วันที่ประเมิน': p.screeningDate,
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
    { 'หัวข้อสรุป': 'หน่วยงานรับผิดชอบ', 'รายละเอียด': 'สำนักงานสาธารณสุขอำเภอเชียงกลาง จังหวัดน่าน' },
    { 'หัวข้อสรุป': 'ผู้พัฒนาระบบ', 'รายละเอียด': 'สมศักดิ์ สุทธการ' },
    { 'หัวข้อสรุป': 'วันที่ออกรายงาน', 'รายละเอียด': new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { 'หัวข้อสรุป': 'ผู้ออกรายงาน', 'รายละเอียด': `${currentUser.fullName} (${currentUser.roleLabel})` },
    { 'หัวข้อสรุป': 'ขอบเขตพื้นที่ในรายงาน', 'รายละเอียด': currentUser.role === 'ADMIN' ? 'ทุกตำบลในอำเภอเชียงกลาง' : `ตำบล${currentUser.tambon} (${currentUser.hospital})` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปจำนวนผู้รับการคัดกรอง ==', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': 'จำนวนผู้ได้รับการคัดกรองทั้งหมด', 'รายละเอียด': `${totalScreened} คน` },
    { 'หัวข้อสรุป': 'เสี่ยงรุนแรง (8Q >= 17)', 'รายละเอียด': `${highRisk} คน (${totalScreened > 0 ? ((highRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'เสี่ยงปานกลาง (8Q 9-16)', 'รายละเอียด': `${mediumRisk} คน (${totalScreened > 0 ? ((mediumRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'เสี่ยงน้อย (8Q 1-8)', 'รายละเอียด': `${lowRisk} คน (${totalScreened > 0 ? ((lowRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': 'ไม่มีความเสี่ยง / ปกติ', 'รายละเอียด': `${noRisk} คน (${totalScreened > 0 ? ((noRisk / totalScreened) * 100).toFixed(1) : 0}%)` },
    { 'หัวข้อสรุป': '', 'รายละเอียด': '' },
    { 'หัวข้อสรุป': '== สรุปสถิติแยกตามตำบล (อำเภอเชียงกลาง) ==', 'รายละเอียด': '' },
    ...Object.entries(tambonCounts).map(([tambon, data]) => ({
      'หัวข้อสรุป': `ตำบล ${tambon}`,
      'รายละเอียด': `คัดกรอง ${data.total} คน (เสี่ยงรุนแรง ${data.high} คน)`,
    })),
  ];

  // Create workbook and append worksheets
  const wb = XLSX.utils.book_new();

  const wsPatients = XLSX.utils.json_to_sheet(patientRows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  // Set column widths for better readability
  wsPatients['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 12 }, // วันที่
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

  XLSX.utils.book_append_sheet(wb, wsPatients, 'ทะเบียนคัดกรองคนไข้');
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
    'สิทธิ์ในระบบ': u.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : u.role === 'HEALTH_OFFICER' ? 'เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง)' : 'อสม. ประจำหมู่บ้าน',
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
