/**
 * JavisCoach & Fitness AI - Dynamic Fitness & Nutrition Engine
 */

// Helper: encode image path so spaces work on GitHub Pages (e.g. "Biceps Curls.gif" → "Biceps%20Curls.gif")
function imgPath(path) {
  if (!path) return '';
  // encode each path segment separately to preserve the slash
  return path.split('/').map(seg => encodeURIComponent(seg)).join('/');
}

const DEFAULT_PROFILE = {
  gender: 'male',
  age: 28,
  weight: 70,
  height: 175,
  activity: 1.55,
  goal: 'fat_loss',
  workoutDays: 4,
  equipment: 'dumbbells',
  constraints: 'knee_pain',
  dietary: 'none'
};

let state = {
  theme: localStorage.getItem('javis_theme') || 'light', // light | dark | ocean
  profile: JSON.parse(localStorage.getItem('javis_profile')) || DEFAULT_PROFILE,
  todayMeals: JSON.parse(localStorage.getItem('javis_today_meals')) || [],
  checkedExercises: JSON.parse(localStorage.getItem('javis_checked_ex')) || {}
};

// Exercise Posture & Visual Demonstration Database
const EXERCISE_GUIDE_DATABASE = {
  'Triceps': {
    category: 'arms',
    title: 'Triceps Overhead Extension (เหยียดหลังแขน)',
    muscle: 'กล้ามเนื้อหลังแขน (Triceps Brachii)',
    image: 'images/Triceps Overhead Extension.webp',
    steps: [
      'ชูดัมเบลขึ้นเหนือศีรษะด้วยสองมือ หรือถือดัมเบลเดี่ยว งอข้อศอกส่งดัมเบลลงไปด้านหลังศีรษะ',
      'รักษาแขนท่อนบนให้อยู่นิ่งใกล้หู ไม่กางข้อศอกออกกว้าง (หายใจเข้า)',
      'ออกแรงเหยียดหลังแขนดันดัมเบลกลับขึ้นเหนือศีรษะจนแขนตึง (หายใจออก)'
    ],
    safety: '🛡️ เกร็งหน้าท้องไม่ให้หลังแอ่นขณะชูดัมเบลขึ้นเหนือศีรษะ'
  },
  'Biceps': {
    category: 'arms',
    title: 'Biceps Curls (พับแขนเล่นหน้าแขน)',
    muscle: 'กล้ามเนื้อหน้าแขน (Biceps Brachii)',
    image: 'images/Biceps Curls.gif',
    steps: [
      'ยืนหรือนั่งตรง ถือดัมเบลสองข้างข้างลำตัว หันฝ่ามือออกด้านหน้า',
      'ล็อกข้อศอกแนบข้างลำตัว ออกแรงเกร็งพับแขนยกดัมเบลขึ้นหาไหล่ (หายใจออก)',
      'ค่อยๆ คลายแขนชะลอน้ำหนักห้อยดัมเบลลงสู่ท่าเดิม (หายใจเข้า)'
    ],
    safety: '⚠️ ห้ามใช้แรงเหวี่ยงลำตัว ช่วยยกดัมเบล ให้ใช้แรงจากหน้าแขนควบคุมล้วนๆ'
  },
  'Flyes': {
    category: 'shoulders_back',
    title: 'Reverse Flyes (กางแขนบริหารหลังส่วนบน)',
    muscle: 'หัวไหล่ด้านหลัง (Rear Deltoids), หลังส่วนบน (Rhomboids)',
    image: 'images/Reverse Flyes.gif',
    steps: [
      'พับสะโพกก้มลำตัวทำมุม 45 องศา หลังตรง ถือดัมเบลแขนห้อยลงด้านหน้า',
      'กางแขนออกข้างลำตัว งอข้อศอกเล็กน้อย บีบสะบักเข้าหากัน (หายใจออก)',
      'ค่อยๆ ลดแขนกลับลงสู่ท่าเริ่มต้นอย่างควบคุม (หายใจเข้า)'
    ],
    safety: '🛡️ เกร็งแกนกลางลำตัวรักษาหลังตรง เพื่อป้องกันอาการปวดหลังส่วนล่าง'
  },
  'Superman': {
    category: 'shoulders_back',
    title: 'Superman Hold (เกร็งหลังส่วนล่าง)',
    muscle: 'กล้ามเนื้อหลังส่วนล่าง (Erector Spinae), ก้น (Glutes)',
    image: 'images/Superman-exercise.gif',
    steps: [
      'นอนคว่ำบนเสื่อ เหยียดแขนสองข้างไปด้านหน้า เหยียดขาไปด้านหลัง',
      'เกร็งหลังและก้น ออกแรงยกอก แขน และขาลอยขึ้นเหนือพื้นพร้อมกัน (หายใจออก)',
      'เกร็งค้างไว้ 2-3 วินาที แล้วค่อยๆ ลดลำตัวลงแตะพื้น (หายใจเข้า)'
    ],
    safety: '🛡️ เป็นท่าเสริมสร้างความแข็งแรงของหลังส่วนล่างที่ปลอดภัยสูง ไม่ต้องใช้อุปกรณ์'
  },
  'Seated Calf Raises': {
    category: 'legs',
    title: 'Seated Calf Raises (เขย่งปลายเท้านั่งเล่นน่อง - เซฟเข่า)',
    muscle: 'กล้ามเนื้อน่องลึก (Soleus Muscle)',
    image: 'images/Weighted-Seated-Calf-Raise.gif',
    steps: [
      'นั่งบนม้านั่งหรือเก้าอี้ วางแผ่นดัมเบลบนเข่าสองข้าง วางปลายเท้าแบนบนพื้นหรือแผ่นยืด',
      'ออกแรงปลายเท้าเขย่งส้นเท้าขึ้นสูงที่สุดเท่าที่จะทำได้ เกร็งน่องค้างไว้ 1 วินาที (หายใจออก)',
      'ค่อยๆ ลดส้นเท้าลงช้าๆ จนส้นเท้าแตะพื้น (หายใจเข้า)'
    ],
    safety: '🛡️ ท่านั่งช่วยเซฟเข่าและหลัง 100% เหมาะสำหรับผู้ที่มีข้อจำกัดปวดเข่า'
  },
  'Standing Calf Raises': {
    category: 'legs',
    title: 'Standing Calf Raises (เขย่งน่องยืนเล่น)',
    muscle: 'กล้ามเนื้อน่องหลัก (Gastrocnemius Muscle)',
    image: 'images/Standing Calf Raises.gif',
    steps: [
      'ยืนตรง ขากว้างเท่าช่วงสะโพก มือจับเก้าอี้หรือผนังเพื่อประคองตัว',
      'ออกแรงปลายเท้าเขย่งส้นเท้าขึ้นสูงที่สุด เกร็งน่องค้างไว้ 1-2 วินาที (หายใจออก)',
      'ค่อยๆ ชะลอลดส้นเท้าลงแตะพื้น (หายใจเข้า)'
    ],
    safety: '🛡️ ปลอดภัยต่อข้อต่อสูง ช่วยเสริมความมั่นคงของข้อเท้า'
  },
  'Clamshells': {
    category: 'legs',
    title: 'Clamshells (นอนตะแคงกางขาบริหารก้น - เซฟเข่า)',
    muscle: 'กล้ามเนื้อก้นด้านข้าง (Gluteus Medius)',
    image: 'images/Clamshells.webp',
    steps: [
      'นอนตะแคงข้าง งอเข่าทำมุม 90 องศา วางส้นเท้าแตะกัน',
      'เกร็งก้น ออกแรงกางเข่าด้านบนขึ้นโดยให้ส้นเท้ายังแตะติดกันอยู่ (หายใจออก)',
      'ค้างไว้ 1 วินาที แล้วค่อยๆ ลดเข่าลงชิดกัน (หายใจเข้า)'
    ],
    safety: '🛡️ ท่านี้เซฟเข่า 100% ช่วยกระชับก้นและลดอาการปวดสะโพก'
  },
  'Glute Bridge': {
    category: 'legs',
    title: 'Glute Bridge (สะพานโค้งเกร็งก้น - เซฟเข่า)',
    muscle: 'กล้ามเนื้อก้น (Glutes), ต้นขาด้านหลัง (Hamstrings) & แกนกลางลำตัว',
    image: 'images/Glute Bridge.gif',
    steps: [
      'นอนหงายบนเสื่อ ชันเข่าขึ้นทั้งสองข้าง ชันขากว้างเท่าความกว้างสะโพก วางเท้าแบนกับพื้น',
      'เกร็งหน้าท้องและเกร็งก้น ออกแรงดันสะโพกยกขึ้นจนลำตัวตั้งแต่ไหล่ถึงเข่าเป็นแนวเส้นตรง',
      'เกร็งก้นค้างไว้ที่จุดสูงสุด 1-2 วินาที (หายใจออก)',
      'ค่อยๆ ลดสะโพกลงเกือบแตะพื้น แล้วทำซ้ำ (หายใจเข้า)'
    ],
    safety: '🛡️ ท่านี้ปลอดภัยต่อข้อเข่า 100% ไม่สร้างแรงกระแทก เหมาะสำหรับผู้ที่มีอาการปวดเข่าหรือ BMI สูง'
  },
  'Squats': {
    category: 'legs',
    title: 'Dumbbell Squats (สควอท)',
    muscle: 'ต้นขาด้านหน้า (Quadriceps), ก้น (Glutes)',
    image: 'images/Dumbbell Squats.gif',
    steps: [
      'ยืนตรง ขากว้างเท่าช่วงไหล่ เปิดปลายเท้าออกเล็กน้อย ถือดัมเบลแนบข้างลำตัวหรือระดับอก',
      'หย่อนสะโพกไปด้านหลังเหมือนกำลังจะนั่งเก้าอี้ ย่อเข่าลงจนด้ามขนานพื้น (หลังตรง ไม่โก้ง)',
      'ออกแรงส้นเท้าดันลำตัวกลับขึ้นสู่ท่าเริ่มต้น หายใจออก'
    ],
    safety: '⚠️ ห้ามให้เข่ายื่นเลยปลายเท้ามากเกินไป และรักษาหลังให้ตรงตลอดเวลา'
  },
  'Lunges': {
    category: 'legs',
    title: 'Dumbbell Lunges (ก้าวขา ย่อตัว)',
    muscle: 'ต้นขาด้านหน้า, ก้น & แฮมสตริง',
    image: 'images/Dumbbell Lunges.gif',
    steps: [
      'ยืนตรง ถือดัมเบลข้างลำตัว ก้าวขาขวาไปด้านหน้า 1 ก้าวใหญ่',
      'ย่อตัวลงตรงๆ ให้เข่าหน้าทำมุม 90 องศา และเข่าหลังเฉียดพื้น (หลังตรง)',
      'ดันตัวกลับขึ้นท่าเดิม ทำสลับขาขวาและขาซ้าย'
    ],
    safety: '⚠️ รักษาสมดุลลำตัว ไม่ให้เข่าด้านหน้าบิดเข้าด้านใน'
  },
  'Deadlift': {
    category: 'legs',
    title: 'Romanian Deadlift (พับสะโพกเล่นหลังขาและก้น)',
    muscle: 'ต้นขาด้านหลัง (Hamstrings), ก้น & หลังส่วนล่าง',
    image: 'images/Romanian Deadlift.gif',
    steps: [
      'ยืนขากว้างเท่าสะโพก ถือดัมเบลไว้หน้าขา งอเข่าเล็กน้อย',
      'พับสะโพกผลักก้นไปด้านหลัง ก้มลำตัวลงให้ดัมเบลเลื่อนชิดหน้าขาลงไประดับใต้เข่า (หลังตรง)',
      'เกร็งก้นออกแรงดันสะโพกกลับมาท่าเดิม'
    ],
    safety: '🛡️ รักษาหลังให้ตรงตลอดเวลา ห้ามโก่งหลังเด็ดขาด'
  },
  'Push-ups': {
    category: 'chest',
    title: 'Incline Push-ups (วิดพื้นชันขึ้น)',
    muscle: 'กล้ามเนื้ออก (Chest), ไหล่ด้านหน้า (Deltoids), หลังแขน (Triceps)',
    image: 'images/incline-push-up-bench.gif',
    steps: [
      'วางมือบนขอบโต๊ะหรือม้านั่ง กว้างกว่าช่วงไหล่เล็กน้อย ถอยขาออกไปให้ลำตัวเป็นเส้นตรง',
      'งอข้อศอกลดหน้าอกลงเข้าหาขอบโต๊ะ ชะลอตัวลงอย่างควบคุม (หายใจเข้า)',
      'ออกแรงดันอกดันลำตัวกลับขึ้นสู่ท่าเดิม (หายใจออก)'
    ],
    safety: '🛡️ ท่าชันขึ้นช่วยลดภาระน้ำหนักตัว เหมาะสำหรับผู้เริ่มต้นเซฟข้อมือและหลัง'
  },
  'Bench Press': {
    category: 'chest',
    title: 'Dumbbell Bench Press / Floor Press (ดันดัมเบลเล่นอก)',
    muscle: 'กล้ามเนื้ออกส่วนกลาง (Pectoralis Major), หลังแขน',
    image: 'images/Floor Press.webp',
    steps: [
      'นอนหงายบนม้านั่งหรือพื้นห้อง ถือดัมเบลสองข้างไว้ระดับข้างอก ข้อศอกทำมุม 45 องศากับลำตัว',
      'ออกแรงดันดัมเบลขึ้นตรงๆ เหนืออก จนแขนตึงเกือบสุด (หายใจออก)',
      'ค่อยๆ คุมดัมเบลลงมาที่ระดับข้างอกอย่างช้าๆ (หายใจเข้า)'
    ],
    safety: '⚠️ อย่ากางข้อศอกออก 90 องศาขนานไหล่ เพราะอาจทำให้ข้อต่อไหล่บาดเจ็บได้'
  },
  'Inverted Rows': {
    category: 'shoulders_back',
    title: 'Doorway Inverted Rows (โหนตัวเกร็งหลัง)',
    muscle: 'กล้ามเนื้อหลังส่วนบน & หน้าแขน',
    image: 'images/Doorway Inverted Row.gif',
    steps: [
      'จับขอบประตูหรือราวที่มั่นคง ถอยเท้าเข้าหาขอบประตู เอนลำตัวไปด้านหลังลำตัวตรง',
      'ออกแรงหนีบสะบัก ดึงหน้าอกเข้าหาขอบประตู (หายใจออก)',
      'ค่อยๆ เหยียดแขนชะลอตัวกลับสู่ท่าเดิม (หายใจเข้า)'
    ],
    safety: '🛡️ เช็กขอบประตูหรือราวยึดให้แข็งแรงมั่นคงก่อนออกแรงดึง'
  },
  'Rows': {
    category: 'shoulders_back',
    title: 'Dumbbell Rows (พายดัมเบลเล่นหลัง)',
    muscle: 'กล้ามเนื้อหลังส่วนบน (Latissimus Dorsi, Rhomboids)',
    image: 'images/Dumbbell Rows.gif',
    steps: [
      'พับสะโพกก้มลำตัวลงทำมุม 45 องศา หลังตรง เกร็งหน้าท้อง ถือดัมเบลแขนห้อยลง',
      'ดึงข้อศอกไปด้านหลังเฉียงขึ้นข้างลำตัว เกร็งกล้ามเนื้อหลังหนีบสะบักเข้าหากัน (หายใจออก)',
      'ค่อยๆ คลายแขนห้อยลงสู่ท่าเดิม (หายใจเข้า)'
    ],
    safety: '🛡️ เกร็งหน้าท้องรักษาหลังให้ตรงตลอดเวลา ห้ามโก่งหลังเด็ดขาด'
  },
  'Shoulder Press': {
    category: 'shoulders_back',
    title: 'Dumbbell Shoulder Press (ดันดัมเบลเล่นไหล่)',
    muscle: 'กล้ามเนื้อไหล่ (Deltoids), ทราพีเซียส (Trapezius)',
    image: 'images/Dumbbell Shoulder Press.gif',
    steps: [
      'นั่งหรือยืนตรง ถือดัมเบลสองข้างระดับหู ตั้งข้อศอกทำมุม 90 องศา',
      'เกร็งหน้าท้อง ออกแรงดันดัมเบลขึ้นเหนือศีรษะให้ดัมเบลเข้าใกล้กัน (หายใจออก)',
      'ค่อยๆ ลดดัมเบลลงระดับหูอย่างควบคุม (หายใจเข้า)'
    ],
    safety: '⚠️ ระวังอย่าแอ่นหลังขณะดันดัมเบลขึ้น หากหนักเกินไปให้ลดน้ำหนักดัมเบลลง'
  },
  'Lateral Raises': {
    category: 'shoulders_back',
    title: 'Lateral Raises (กางแขนเล่นไหล่ข้าง)',
    muscle: 'กล้ามเนื้อไหล่ด้านข้าง (Lateral Deltoids)',
    image: 'images/Alternate-Dumbbell-Lateral-Raise.gif',
    steps: [
      'ยืนตรง ถือดัมเบลสองข้างข้างลำตัว งอข้อศอกเล็กน้อย',
      'เกร็งไหล่กางแขนออกข้างลำตัวขึ้นจนดัมเบลอยู่ระดับขนานไหล่ (หายใจออก)',
      'ค่อยๆ ชะลอลดดัมเบลลงข้างลำตัว (หายใจเข้า)'
    ],
    safety: '⚠️ ห้ามใช้แรงเหวี่ยงลำตัว และอย่ายกขึ้นสูงเกินระดับไหล่'
  },
  'Front Raises': {
    category: 'shoulders_back',
    title: 'Front Raises (ยกดัมเบลด้านหน้า)',
    muscle: 'กล้ามเนื้อไหล่ด้านหน้า (Anterior Deltoids)',
    image: 'images/Front Raises.gif',
    steps: [
      'ยืนตรง ถือดัมเบลไว้หน้าต้นขา',
      'เกร็งไหล่ดันดัมเบลยกขึ้นด้านหน้าตรงๆ จนระดับขนานไหล่ (หายใจออก)',
      'ค่อยๆ ชะลอลดดัมเบลลงท่าเดิม (หายใจเข้า)'
    ],
    safety: '🛡️ รักษาลำตัวให้นิ่ง ไม่เอนตัวไปด้านหลังขณะยก'
  },
  'Side Plank': {
    category: 'core',
    title: 'Side Plank Hold (แพลงก์ข้างเกร็งเอว)',
    muscle: 'กล้ามเนื้อท้องข้าง (Obliques) & แกนกลางลำตัว',
    image: 'images/bid-side-plank.jpg',
    steps: [
      'นอนตะแคงข้าง ตั้งข้อศอกท่อนล่างบนพื้นตรงกับไหล่',
      'ยกสะโพกขึ้นจากพื้น ลำตัวเป็นแนวเส้นตรงตั้งแต่ศีรษะถึงเท้า',
      'เกร็งเอวและหน้าท้องค้างไว้ตามเวลา หายใจเข้าออกสม่ำเสมอ'
    ],
    safety: '🛡️ หากหนักเกินไป สามารถวางเข่าด้านล่างแตะพื้นเพื่อลดแรงกดได้'
  },
  'Deadbug': {
    category: 'core',
    title: 'Deadbug (เกร็งหน้าท้องเซฟหลัง)',
    muscle: 'แกนกลางลำตัวลึก (Transverse Abdominis)',
    image: 'images/Dead-Bug.gif',
    steps: [
      'นอนหงาย ชูแขนสองข้างขึ้น ชันเข่า 90 องศาลอยเหนือพื้น หลังส่วนล่างกดแนบเสื่อ',
      'ค่อยๆ เหยียดแขนขวาไปหลังศีรษะ พร้อมเหยียดขาซ้ายไปด้านหน้า (อย่าให้หลังแอ่น)',
      'ดึงกลับท่าเดิม แล้วทำสลับข้าง (แขนซ้าย + ขาขวา)'
    ],
    safety: '🛡️ เซฟหลังส่วนล่าง 100% เหมาะอย่างยิ่งสำหรับผู้ที่มีอาการปวดหลัง'
  },
  'Plank': {
    category: 'core',
    title: 'Plank Hold (แพลงก์เกร็งหน้าท้องเซฟหลัง)',
    muscle: 'แกนกลางลำตัว (Core), หน้าท้อง (Rectus Abdominis)',
    image: 'images/bid-side-plank.jpg',
    steps: [
      'วางข้อศอกและแขนท่อนล่างบนพื้น ขนานกัน กว้างเท่าช่วงไหล่',
      'ตั้งปลายเท้า ยกสะโพกขึ้น เกร็งหน้าท้องและก้น ลำตัวเป็นแนวเส้นตรงตั้งแต่ศีรษะถึงส้นเท้า',
      'ค้างไว้ตามเวลา หายใจเข้าออกสม่ำเสมอ ห้ามกลั้นหายใจ'
    ],
    safety: '🛡️ ห้ามปล่อยให้สะโพกดิ่งตกหรือโด่งสูงเกินไป เพื่อป้องกันอาการปวดหลังส่วนล่าง'
  },
  'Mountain Climbers': {
    category: 'core',
    title: 'Low Impact Mountain Climbers (ปีนเขา)',
    muscle: 'แกนกลางลำตัว, หน้าท้อง & คาร์ดิโอ',
    image: 'images/Low Impact Mountain Climbers.gif',
    steps: [
      'ตั้งท่าแพลงก์มือดันพื้น แขนตึง ลำตัวเป็นเส้นตรง',
      'แทงเข่าขวาเข้าหาอก เกร็งหน้าท้อง แล้วถอยกลับ',
      'แทงเข่าซ้ายเข้าหาอก สลับข้างอย่างต่อเนื่องด้วยจังหวะสม่ำเสมอ'
    ],
    safety: '🛡️ แทงเข่าแบบช้าๆ ชัดๆ (Low Impact) เซฟเข่าและข้อมือ'
  },
  'Crunches': {
    category: 'core',
    title: 'Bicycle Crunches (ปั่นจักรยานเกร็งหน้าท้อง)',
    muscle: 'หน้าท้องส่วนบน ส่วนล่าง & ท้องข้าง',
    image: 'images/Bicycle Crunches.gif',
    steps: [
      'นอนหงาย เอามือแตะข้างศีรษะ ชันเข่าลอยขึ้น',
      'บิดลำตัวนำข้อศอกซ้ายไปแตะเข่าขวา พร้อมเหยียดขาซ้ายออกไปด้านหน้า',
      'สลับบิดข้อศอกขวาไปแตะเข่าซ้าย ทำต่อเนื่องเหมือนปั่นจักรยาน'
    ],
    safety: '⚠️ อย่าใช้มือทึ้งหรือดึงคอ ให้ใช้แรงเกร็งจากหน้าท้องในการหมุนลำตัว'
  },
  'Cardio': {
    category: 'cardio_rest',
    title: 'Low-Impact Step Jacks & Shadow Boxing (คาร์ดิโอไร้แรงกระแทก)',
    muscle: 'หัวใจและระบบหมุนเวียนเลือด (Cardiovascular System), เผาผลาญไขมัน',
    image: 'images/shadow-boxing-workout.gif',
    steps: [
      'ยืนตรง ก้าวขาขวาออกข้างพร้อมยกแขนสองข้างขึ้นเหนือศีรษะ จากนั้นก้าวขากลับ',
      'สลับก้าวขาซ้ายออกข้าง ทำต่อเนื่องด้วยความเร็วสม่ำเสมอ',
      'ต่อด้วยตั้งการ์ด ชกหมัดแย็บ-หมัดตรงสลับซ้ายขวา เกร็งลำตัว'
    ],
    safety: '🛡️ ท่านี้ไม่มีการกระโดด ช่วยเผาผลาญแคลอรีสูงโดยไม่ทำร้ายข้อเข่า'
  },
  'Walking': {
    category: 'cardio_rest',
    title: 'Light Walking (เดินเล่นชิลๆ ผ่อนคลาย/ฟังเพลง)',
    muscle: 'กล้ามเนื้อขา, ระบบหมุนเวียนเลือด & การฟื้นฟูจิตใจ',
    image: 'images/Light Walking.jpg',
    steps: [
      'ใส่รองเท้าผ้าใบสบายๆ ออกไปเดินเล่นสวนสาธารณะ ในบ้าน หรือลานหมู่บ้าน',
      'เดินด้วยจังหวะก้าวสบายๆ ไม่ต้องเร่งสปีด (โซน 1-2) หายใจเข้าลึกๆ ผ่อนคลาย',
      'ฟังเพลงหรือพอดแคสต์โปรดขณะเดิน เพื่อให้สมองและร่างกายได้พักผ่อนอย่างเต็มที่'
    ],
    safety: '☕ วันพักผ่อนการเดินช่วยกระตุ้นการไหลเวียนเลือด นำสารอาหารไปซ่อมแซมกล้ามเนื้อได้ดีขึ้น'
  },
  'JumpRope': {
    category: 'cardio_rest',
    title: 'Light Jump Rope (กระโดดเชือกเบาๆ สลับพัก)',
    muscle: 'น่อง, ต้นขา & ระบบเผาผลาญ (Cardio Engine)',
    image: 'images/Skip-Jump-Rope.gif',
    steps: [
      'ปรับความยาวเชือกให้พอดี ยืนบนปลายเท้า ย่อเข่าเล็กน้อย',
      'หมุนข้อศอกและข้อมือเบาๆ กระโดดสูงจากพื้นเพียง 1-2 นิ้ว นุ่มนวล',
      'กระโดด 30 วินาที สลับเดินพัก 30 วินาที ทำเบาๆ 5-10 นาทีตามความสมัครใจ'
    ],
    safety: '🛡️ กระโดดบนพื้นนุ่มหรือเสื่อออกกำลังกาย ห้ามกระโดดบนพื้นคอนกรีตแข็งเพื่อเซฟเข่า'
  },
  'Stretching': {
    category: 'cardio_rest',
    title: 'Gentle Stretching (ยืดเหยียดผ่อนคลายกล้ามเนื้อ)',
    muscle: 'ทั่วร่างกาย (Full Body Flexibility)',
    image: 'images/stretches.jpg',
    steps: [
      'ยืดเหยียดกล้ามเนื้อส่วนขา อก หลัง และไหล่ช้าๆ',
      'ค้างไว้ในแต่ละท่า 15-30 วินาที โดยไม่กระตุก',
      'หายใจเข้า-ออกลึกๆ ยาวๆ ผ่อนคลายความตึงเครียด'
    ],
    safety: '🛡️ ยืดให้รู้สึกตึงสบายๆ ห้ามฝืนยืดจนรู้สึกเจ็บ'
  },
  'Sleep': {
    category: 'cardio_rest',
    title: 'Deep Sleep & Rest (นอนหลับชาร์จแบตร่างกาย)',
    muscle: 'ฟื้นฟูและสร้างเสริมกล้ามเนื้อทั่วร่างกาย (Muscle Recovery & Growth)',
    image: 'images/Deep Sleep & Rest.jpg',
    steps: [
      'ปิดไฟในห้องนอนให้มืดสนิท ปรับอุณหภูมิห้องให้เย็นสบายพอดี (23-25 องศา)',
      'งดเล่นมือถือก่อนนอน 30 นาที เพื่อให้ออร์โมนเมลาโทนินทำงานเต็มที่',
      'เข้านอนและตื่นนอนให้เป็นเวลา นอนหลับต่อเนื่อง 7-8 ชั่วโมง'
    ],
    safety: '💤 การนอนหลับคือกุญแจสำคัญที่สุดที่โกรทฮอร์โมน (Growth Hormone) จะถูกหลั่งเพื่อซ่อมแซมร่างกาย'
  }
};

// Theme Switcher Engine
function setTheme(themeName) {
  state.theme = themeName;
  localStorage.setItem('javis_theme', themeName);

  document.body.classList.remove('theme-light', 'theme-dark', 'theme-ocean');
  document.body.classList.add(`theme-${themeName}`);

  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`theme-btn-${themeName}`);
  if (activeBtn) activeBtn.classList.add('active');

  const themeLabel = themeName === 'light' ? 'โหมดสว่าง' : themeName === 'dark' ? 'โหมดมืด' : 'โหมดพาสเทล';
  showToast(`เปลี่ยนธีมหน้าจอเป็น ${themeLabel} เรียบร้อย! 🎨`);
}

// Health Metrics Calculation Engine (Mifflin-St Jeor & WHO PAL)
function calculateMetrics(profile) {
  const gender = profile.gender || 'male';
  const age = parseFloat(profile.age) || 28;
  const weight = parseFloat(profile.weight) || 70;
  const height = parseFloat(profile.height) || 175;
  const activity = parseFloat(profile.activity) || 1.55;
  const goal = profile.goal || 'fat_loss';
  
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = 'น้ำหนักน้อย';
  else if (bmi < 23) bmiCategory = 'สมส่วน';
  else if (bmi < 25) bmiCategory = 'ท้วม';
  else if (bmi < 30) bmiCategory = 'อ้วนระดับ 1';
  else bmiCategory = 'อ้วนระดับ 2';

  // BMR Calculation (Mifflin-St Jeor Equation, 1990)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'male' ? Math.round(bmr + 5) : Math.round(bmr - 161);

  // TDEE Calculation (WHO PAL Multipliers)
  const tdee = Math.round(bmr * activity);

  // Target Calories based on Goal & Energy Balance Science
  let targetCal = tdee;
  if (goal === 'fat_loss') targetCal = tdee - 450;
  else if (goal === 'muscle_gain') targetCal = tdee + 300;
  else if (goal === 'toning') targetCal = tdee - 200;
  targetCal = Math.max(1200, Math.round(targetCal));

  // Target Macros
  const proteinG = Math.round(weight * (goal === 'muscle_gain' ? 2.2 : 2.0));
  const proteinKcal = proteinG * 4;
  const fatKcal = targetCal * 0.25;
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = targetCal - (proteinKcal + fatKcal);
  const carbsG = Math.max(50, Math.round(carbsKcal / 4));

  return { bmi, bmiCategory, bmr, tdee, targetCal, proteinG, carbsG, fatG, weight, age, activity };
}

/**
 * Dynamic Workout Schedule Generator
 */
function generateWeeklyWorkout(profile) {
  const metrics = calculateMetrics(profile);
  const { bmi, tdee } = metrics;
  const goal = profile.goal || 'fat_loss';
  const constraints = profile.constraints || 'none';
  const equipment = profile.equipment || 'dumbbells';

  const isHighBMI = bmi >= 25;
  const isKneePain = constraints === 'knee_pain' || isHighBMI;
  const isBackPain = constraints === 'back_pain';

  let setsReps = '3 เซ็ต x 12-15 ครั้ง';
  let restInterval = 'พัก 60 วินาที/เซ็ต';
  let intensityTag = 'ระดับปานกลาง';

  if (goal === 'muscle_gain') {
    setsReps = '4 เซ็ต x 8-10 ครั้ง (Focus: Progressive Overload)';
    restInterval = 'พัก 90 วินาที/เซ็ต';
    intensityTag = 'ระดับสูง (Strength & Hypertrophy)';
  } else if (goal === 'fat_loss') {
    setsReps = '3-4 เซ็ต x 15 ครั้ง (Focus: High Caloric Burn)';
    restInterval = 'พัก 45 วินาที/เซ็ต';
    intensityTag = 'ระดับเผาผลาญสูง (Fat Burn Focus)';
  } else if (goal === 'toning') {
    setsReps = '3 เซ็ต x 12-15 ครั้ง (Focus: Time Under Tension)';
    restInterval = 'พัก 60 วินาที/เซ็ต';
    intensityTag = 'ระดับกระชับสัดส่วน';
  }

  const strengthBurnKcal = Math.round(tdee * 0.14);
  const cardioBurnKcal = Math.round(tdee * 0.16);

  const legEx1 = isKneePain ? 'Glute Bridge (สะพานโค้งเกร็งก้น - เซฟเข่า)' : 'Dumbbell Squats (สควอท)';
  const legEx2 = isKneePain ? 'Seated Calf Raises (เขย่งปลายเท้า)' : 'Dumbbell Lunges (ก้าวขา ย่อตัว)';
  const legEx3 = isKneePain ? 'Clamshells (นอนตะแคงกางขาบริหารก้น)' : 'Romanian Deadlift (พับสะโพก)';

  const pushEx = equipment === 'bodyweight' ? 'Incline Push-ups (วิดพื้นชันขึ้น)' : 'Dumbbell Floor Press (ดันดัมเบลเล่นอก)';
  const pullEx = equipment === 'bodyweight' ? 'Doorway Inverted Rows (โหนตัวเกร็งหลัง)' : 'Dumbbell Rows (พายดัมเบลเล่นหลัง)';
  const coreEx = isBackPain ? 'Plank Hold (แพลงก์เกร็งหน้าท้อง 30-45 วินาที)' : 'Deadbug (เกร็งหน้าท้องเซฟหลัง)';

  const hiitCardioEx = isKneePain 
    ? 'Low-Impact Step Jacks & Shadow Boxing (คาร์ดิโอไร้แรงกระแทกเข่า)' 
    : 'Jumping Jacks & Mountain Climbers (คาร์ดิโอเผาผลาญไขมัน)';

  return [
    {
      day: 'วันจันทร์', focus: 'Chest & Triceps (อกและหลังแขน)', isRest: false,
      estimatedBurn: strengthBurnKcal, intensity: intensityTag,
      exercises: [
        { id: 'mon_1', name: pushEx, detail: setsReps },
        { id: 'mon_2', name: 'Incline Push-ups (วิดพื้นชันขึ้น)', detail: setsReps },
        { id: 'mon_3', name: 'Triceps Overhead Extension (เหยียดหลังแขน)', detail: setsReps },
        { id: 'mon_4', name: coreEx, detail: `3 เซ็ต (${restInterval})` }
      ]
    },
    {
      day: 'วันอังคาร', focus: 'Back & Biceps (หลังและหน้าแขน)', isRest: false,
      estimatedBurn: strengthBurnKcal, intensity: intensityTag,
      exercises: [
        { id: 'tue_1', name: pullEx, detail: setsReps },
        { id: 'tue_2', name: 'Reverse Flyes (กางแขนบริหารหลังส่วนบน)', detail: setsReps },
        { id: 'tue_3', name: 'Biceps Curls (พับแขนเล่นหน้าแขน)', detail: setsReps },
        { id: 'tue_4', name: 'Superman Hold (เกร็งหลังส่วนล่าง)', detail: `3 เซ็ต (${restInterval})` }
      ]
    },
    {
      day: 'วันพุธ', focus: '☕ ACTIVE RECOVERY (วันพักผ่อนสบายๆ เดินเล่น/กระโดดเชือก)', isRest: true,
      estimatedBurn: Math.round(tdee * 0.08), intensity: 'ผ่อนคลายร่างกาย & ซ่อมแซมกล้ามเนื้อ',
      exercises: [
        { id: 'wed_1', name: 'Light Walking (เดินเล่นชิลๆ ฟังเพลง/รับลม)', detail: '20-30 นาที (เดินสปีดสบายๆ โซน 1-2 ผ่อนคลายสมอง)' },
        { id: 'wed_2', name: 'Light Jump Rope (กระโดดเชือกเบาๆ สลับพัก)', detail: '5-10 นาที (สลับพักตามชอบ สำหรับวันที่อยากขยับตัว)' },
        { id: 'wed_3', name: 'Gentle Stretching (ยืดเหยียดผ่อนคลายกล้ามเนื้อ)', detail: '10-15 นาที (ลดอาการเมื่อยล้าสะสม)' }
      ]
    },
    {
      day: 'วันพฤหัสบดี', focus: `Lower Body & Glutes (ช่วงขาและก้น - คำนวณเซฟเข่าตาม BMI ${bmi})`, isRest: false,
      estimatedBurn: strengthBurnKcal, intensity: intensityTag,
      exercises: [
        { id: 'thu_1', name: legEx1, detail: setsReps },
        { id: 'thu_2', name: legEx2, detail: setsReps },
        { id: 'thu_3', name: legEx3, detail: setsReps },
        { id: 'thu_4', name: 'Standing Calf Raises (เขย่งน่อง)', detail: `3 เซ็ต x 20 ครั้ง` }
      ]
    },
    {
      day: 'วันศุกร์', focus: 'Shoulders & Core (ไหล่และแกนกลางลำตัว)', isRest: false,
      estimatedBurn: strengthBurnKcal, intensity: intensityTag,
      exercises: [
        { id: 'fri_1', name: 'Dumbbell Shoulder Press (ดันดัมเบลเล่นไหล่)', detail: setsReps },
        { id: 'fri_2', name: 'Lateral Raises (กางแขนเล่นไหล่ข้าง)', detail: setsReps },
        { id: 'fri_3', name: 'Front Raises (ยกดัมเบลด้านหน้า)', detail: setsReps },
        { id: 'fri_4', name: 'Side Plank Hold (แพลงก์ข้าง)', detail: '3 เซ็ต x 30 วินาที/ข้าง' }
      ]
    },
    {
      day: 'วันเสาร์', focus: `HIIT & Full Body Cardio (เผาผลาญแคลอรีตามเป้า TDEE ${tdee} kcal)`, isRest: false,
      estimatedBurn: cardioBurnKcal, intensity: 'ความเข้มข้นสูง (Fat Burn Peak)',
      exercises: [
        { id: 'sat_1', name: hiitCardioEx, detail: '45 วินาที / พัก 15 วินาที (5 รอบ)' },
        { id: 'sat_2', name: 'Low Impact Mountain Climbers (ปีนเขา - คลีน)', detail: '3 เซ็ต x 30 วินาที' },
        { id: 'sat_3', name: 'Bicycle Crunches (ปั่นจักรยานเกร็งหน้าท้อง)', detail: setsReps }
      ]
    },
    {
      day: 'วันอาทิตย์', focus: '🛋️ RECHARGE DAY (วันพักผ่อนรีชาร์จพลังฟื้นฟูร่างกาย)', isRest: true,
      estimatedBurn: Math.round(tdee * 0.05), intensity: 'ฟื้นฟูกล้ามเนื้อเต็มที่',
      exercises: [
        { id: 'sun_1', name: 'Casual Outdoor Walk (เดินเล่นห้าง/สวนสาธารณะ)', detail: '30-45 นาที (เดินเพลินๆ นับก้าวผ่อนคลาย)' },
        { id: 'sun_2', name: 'Deep Sleep & Rest (นอนหลับชาร์จแบตร่างกาย)', detail: 'นอนหลับ 7-8 ชม. (ช่วงเวลาที่กล้ามเนื้อสร้างตัวดีที่สุด!)' }
      ]
    }
  ];
}

// Render Dashboard Views
function renderDashboard() {
  const metrics = calculateMetrics(state.profile);
  
  const bmiEl = document.getElementById('user-bmi');
  const bmrEl = document.getElementById('user-bmr');
  const tdeeEl = document.getElementById('user-tdee');

  if (bmiEl) bmiEl.textContent = `${metrics.bmi}`;
  if (bmrEl) bmrEl.textContent = `${metrics.bmr.toLocaleString()}`;
  if (tdeeEl) tdeeEl.textContent = `${metrics.tdee.toLocaleString()}`;
  
  let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
  state.todayMeals.forEach(m => {
    totalKcal += m.kcal;
    totalP += m.protein;
    totalC += m.carbs;
    totalF += m.fat;
  });

  const targetCalEl = document.getElementById('display-target-cal');
  const loggedCalEl = document.getElementById('display-logged-cal');
  if (targetCalEl) targetCalEl.textContent = metrics.targetCal.toLocaleString();
  if (loggedCalEl) loggedCalEl.textContent = totalKcal.toLocaleString();
  
  const calPercent = Math.min(100, Math.round((totalKcal / metrics.targetCal) * 100));
  const calProgressBar = document.getElementById('cal-progress-bar');
  if (calProgressBar) calProgressBar.style.width = calPercent + '%';

  const pEl = document.getElementById('protein-logged');
  const cEl = document.getElementById('carbs-logged');
  const fEl = document.getElementById('fat-logged');
  if (pEl) pEl.textContent = `${totalP} / ${metrics.proteinG}g`;
  if (cEl) cEl.textContent = `${totalC} / ${metrics.carbsG}g`;
  if (fEl) fEl.textContent = `${totalF} / ${metrics.fatG}g`;

  const pPct = Math.min(100, Math.round((totalP / metrics.proteinG) * 100));
  const cPct = Math.min(100, Math.round((totalC / metrics.carbsG) * 100));
  const fPct = Math.min(100, Math.round((totalF / metrics.fatG) * 100));

  const pBar = document.getElementById('protein-bar');
  const cBar = document.getElementById('carbs-bar');
  const fBar = document.getElementById('fat-bar');
  if (pBar) pBar.style.width = pPct + '%';
  if (cBar) cBar.style.width = cPct + '%';
  if (fBar) fBar.style.width = fPct + '%';

  renderWorkoutSchedule();
  renderMealsList();
  renderExportText(metrics, totalKcal, totalP, totalC, totalF);
  updateModalLivePreview();
  updateEndOfDayCalorieGuidance(metrics, totalKcal, totalP);
  renderExerciseLibrary(currentLibraryCategory);
}

// Exercise Library Catalog Filter & Renderer
let currentLibraryCategory = 'all';

function filterLibraryCategory(cat) {
  currentLibraryCategory = cat;
  document.querySelectorAll('.lib-cat-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`lib-cat-${cat}`);
  if (activeBtn) activeBtn.classList.add('active');

  const searchQuery = document.getElementById('library-search-input')?.value || '';
  renderExerciseLibrary(currentLibraryCategory, searchQuery);
}

function filterLibraryBySearch() {
  const searchQuery = document.getElementById('library-search-input')?.value || '';
  renderExerciseLibrary(currentLibraryCategory, searchQuery);
}

function renderExerciseLibrary(catFilter = 'all', searchQuery = '') {
  const grid = document.getElementById('exercise-library-grid');
  const countBadge = document.getElementById('library-count-badge');
  if (!grid) return;

  const query = searchQuery.trim().toLowerCase();
  let entries = Object.entries(EXERCISE_GUIDE_DATABASE);

  if (catFilter !== 'all') {
    entries = entries.filter(([key, ex]) => ex.category === catFilter);
  }

  if (query) {
    entries = entries.filter(([key, ex]) => 
      ex.title.toLowerCase().includes(query) || 
      ex.muscle.toLowerCase().includes(query) ||
      key.toLowerCase().includes(query)
    );
  }

  if (countBadge) {
    countBadge.textContent = `${entries.length} ท่าที่แสดงผล`;
  }

  grid.innerHTML = '';
  if (entries.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-sub);">
        🔍 ไม่พบท่าออกกำลังกายที่ตรงกับคำค้นหาของคุณ
      </div>
    `;
    return;
  }

  const categoryNames = {
    chest: '🏋️‍♂️ หน้าอก',
    arms: '💪 แขน',
    legs: '🦵 ขา & ก้น',
    shoulders_back: '🛡️ ไหล่ & หลัง',
    core: '🧘‍♂️ แกนกลางลำตัว',
    cardio_rest: '🏃‍♂️ คาร์ดิโอ & พักผ่อน'
  };

  entries.forEach(([key, ex]) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-subcard); border-radius:var(--radius-lg); border:1px solid var(--border-color); overflow:hidden; display:flex; flex-direction:column; justify-space-between; transition:transform 0.2s, box-shadow 0.2s;';
    
    const escapedTitle = ex.title.replace(/'/g, "\\'");
    let imgHtml = '';
    if (ex.image) {
      imgHtml = `
        <div style="position:relative; width:100%; height:160px; overflow:hidden; background:var(--bg-card); cursor:pointer;" onclick="openImageLightbox('${imgPath(ex.image)}', '${escapedTitle}')">
          <img src="${imgPath(ex.image)}" alt="${ex.title}" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.75); color:#fff; padding:2px 8px; border-radius:10px; font-size:0.68rem; font-weight:600; backdrop-filter:blur(4px);">
            🔍 ขยายเต็มจอ
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        ${imgHtml}
        <div style="padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:6px;">
            <strong style="color:var(--text-main); font-size:0.88rem; line-height:1.3;">${ex.title}</strong>
          </div>
          <div style="font-size:0.72rem; color:var(--primary); font-weight:600; margin-bottom:6px;">
            💪 ${ex.muscle}
          </div>
          <div style="font-size:0.72rem; color:var(--text-sub); line-height:1.4; max-height:48px; overflow:hidden; text-overflow:ellipsis;">
            • ${ex.steps[0]}
          </div>
        </div>
      </div>
      <div style="padding:8px 12px 12px 12px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); background:var(--bg-card);">
        <span style="font-size:0.68rem; background:var(--bg-input); border:1px solid var(--border-color); padding:2px 6px; border-radius:8px; color:var(--text-sub); font-weight:600;">
          ${categoryNames[ex.category] || 'ออกกำลังกาย'}
        </span>
        <button class="btn-secondary" style="font-size:0.72rem; padding:4px 10px;" onclick="openExerciseGuideModal('${key}')">
          📖 วิธีเล่น & ข้อควรระวัง
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// End-of-Day Dynamic Calorie Analyzer Guidance
function updateEndOfDayCalorieGuidance(metrics, loggedCal, loggedP) {
  const guidanceEl = document.getElementById('end-of-day-guidance');
  if (!guidanceEl) return;

  const remainCal = metrics.targetCal - loggedCal;
  const remainP = metrics.proteinG - loggedP;
  const goal = state.profile.goal;

  if (remainCal > 300) {
    let adviceText = '';
    if (goal === 'fat_loss') {
      adviceText = `<strong>หากลดน้ำหนัก แต่ทานยังขาดอีก ${remainCal.toLocaleString()} kcal:</strong> ไม่ควรปล่อยให้ขาดมากเกินไปจนต่ำกว่า BMR (${metrics.bmr.toLocaleString()} kcal) เพราะจะทำให้ระบบเผาผลาญปรับลดลงและสูญเสียมวลกล้ามเนื้อ! ไม่จำเป็นต้องทานมื้อใหญ่แน่นท้อง แต่แนะนำ <u>เลือกเติมมื้อดึกย่อยง่าย 140-200 kcal</u> ดังนี้ครับ:`;
    } else if (goal === 'muscle_gain') {
      adviceText = `<strong>เป้าหมายสร้างกล้ามเนื้อ แต่แคลขาดอีก ${remainCal.toLocaleString()} kcal:</strong> จำเป็นต้องกินเพิ่มให้ถึงเป้าหมาย! เพราะการขาดแคลอรีซ้ำๆ จะทำให้กล้ามเนื้อไม่ซ่อมแซมเต็มที่ แนะนำมื้อดึกย่อยง่ายดังนี้ครับ:`;
    } else {
      adviceText = `<strong>พลังงานวันนี้ยังขาดอีก ${remainCal.toLocaleString()} kcal:</strong> เพื่อสุขภาพและการฟื้นฟูร่างกายที่สมบูรณ์ แนะนำเติมมื้อเบาๆ ย่อยง่ายก่อนนอนครับ:`;
    }

    guidanceEl.innerHTML = `
      <div style="color:var(--accent-amber); font-weight:700; font-size:0.85rem; margin-bottom:6px;">
        🌙 วิเคราะห์ปลายวัน: ทานยังขาดอีก ~${remainCal.toLocaleString()} kcal (โปรตีนขาด ${Math.max(0, remainP)}g)
      </div>
      <p style="color:var(--text-main); margin-bottom:8px;">${adviceText}</p>
      <div style="background:var(--bg-card); padding:8px 10px; border-radius:var(--radius-md); border:1px dashed var(--border-color); font-size:0.75rem; line-height:1.6;">
        🥣 <strong>4 เมนูมื้อดึกย่อยง่าย ไม่จุกแน่นท้อง (140-180 kcal):</strong><br>
        1. 🥛 <strong>เวย์โปรตีน 1 สกู๊ป / นม High Protein 7-11</strong> (~140 kcal | P 25g)<br>
        2. 🥚 <strong>ไข่ต้ม 2 ฟอง (ไข่ขาวล้วน/เต็มฟอง 1)</strong> (~140 kcal | P 12g)<br>
        3. 🥣 <strong>กรีกโยเกิร์ต 0% Fat + อัลมอนด์ 5 เม็ด</strong> (~150 kcal | P 14g)<br>
        4. 🍌 <strong>กล้วยหอม 1 ลูก + นมถั่วเหลืองหวานน้อย</strong> (~160 kcal | P 8g)
      </div>
    `;
  } else if (remainCal >= 0 && remainCal <= 300) {
    guidanceEl.innerHTML = `
      <div style="color:var(--accent-emerald); font-weight:700; font-size:0.85rem;">
        ✅ วิเคราะห์ปลายวัน: แคลอรีทานอยู่ในระดับสมบูรณ์แบบ! (${loggedCal.toLocaleString()} / ${metrics.targetCal.toLocaleString()} kcal)
      </div>
      <p style="color:var(--text-sub); margin-top:4px;">
        คุณทำได้ดีมากครับ! ทานได้ใกล้เคียงเป้าหมายในโซนเผาผลาญที่ปลอดภัย ดื่มน้ำเปล่าและนอนหลับพักผ่อน 7-8 ชม. เพื่อให้ร่างกายฟื้นฟูกล้ามเนื้อได้เต็มที่ครับ! 💙
      </p>
    `;
  } else {
    const overCal = Math.abs(remainCal);
    guidanceEl.innerHTML = `
      <div style="color:var(--accent-amber); font-weight:700; font-size:0.85rem;">
        ⚠️ วิเคราะห์ปลายวัน: ทานเกินเป้าหมายไป ~${overCal.toLocaleString()} kcal
      </div>
      <p style="color:var(--text-sub); margin-top:4px;">
        ไม่ต้องกังวลครับ! ไม่แนะนำให้อดอาหารในวันถัดไป ให้เน้นดื่มน้ำมากๆ และทำตามตารางออกกำลังกายวันพรุ่งนี้ตามปกติ ร่างกายจะปรับสมดุลเองครับ 💪
      </p>
    `;
  }
}

// Reset Today's Logged Calories & Meals
function resetTodayMeals() {
  if (confirm('คุณต้องการรีเซ็ตมื้ออาหารและแคลอรีที่กินไปแล้วของวันนี้ให้เป็น 0 ใช่หรือไม่?')) {
    state.todayMeals = [];
    localStorage.setItem('javis_today_meals', JSON.stringify(state.todayMeals));
    renderDashboard();
    showToast('รีเซ็ตแคลอรีวันนี้เป็น 0 kcal เรียบร้อยแล้ว! 🔄');
  }
}

// Remove Individual Meal Entry
function removeMealItem(index) {
  const removedItem = state.todayMeals[index];
  if (!removedItem) return;
  
  state.todayMeals.splice(index, 1);
  localStorage.setItem('javis_today_meals', JSON.stringify(state.todayMeals));
  renderDashboard();
  showToast(`ลบรายการ "${removedItem.name}" เรียบร้อยแล้ว 🗑️`);
}

// Real-time Live Preview inside User Profile Modal
function updateModalLivePreview() {
  const gender = document.getElementById('form-gender')?.value || state.profile.gender;
  const age = parseFloat(document.getElementById('form-age')?.value) || state.profile.age;
  const weight = parseFloat(document.getElementById('form-weight')?.value) || state.profile.weight;
  const height = parseFloat(document.getElementById('form-height')?.value) || state.profile.height;
  const activity = parseFloat(document.getElementById('form-activity')?.value) || state.profile.activity;
  const goal = document.getElementById('form-goal')?.value || state.profile.goal;

  const previewMetrics = calculateMetrics({ gender, age, weight, height, activity, goal });
  const previewBox = document.getElementById('modal-live-preview');
  if (previewBox) {
    previewBox.innerHTML = `
      ⚡ <strong>ผลคำนวณสด:</strong> BMI: ${previewMetrics.bmi} (${previewMetrics.bmiCategory}) | BMR: ${previewMetrics.bmr.toLocaleString()} kcal | TDEE: ${previewMetrics.tdee.toLocaleString()} kcal | 🎯 <strong>เป้าหมายกิน: ${previewMetrics.targetCal.toLocaleString()} kcal/วัน</strong> (P:${previewMetrics.proteinG}g C:${previewMetrics.carbsG}g F:${previewMetrics.fatG}g)
    `;
  }
}

// Fullscreen Image Lightbox Viewer
function openImageLightbox(imgUrl, captionTitle) {
  const imgEl = document.getElementById('lightbox-image');
  const captionEl = document.getElementById('lightbox-caption');
  if (imgEl) imgEl.src = imgUrl;
  if (captionEl) captionEl.innerHTML = `🔍 ${captionTitle} (แตะที่ใดก็ได้เพื่อปิด)`;
  openModal('modal-image-lightbox');
}

// Open Exercise Guide Modal with Posture Diagram & Instructions
function openExerciseGuideModal(exName) {
  let key = '';
  if (exName.includes('Triceps')) key = 'Triceps';
  else if (exName.includes('Biceps')) key = 'Biceps';
  else if (exName.includes('Lateral')) key = 'Lateral Raises';
  else if (exName.includes('Front')) key = 'Front Raises';
  else if (exName.includes('Shoulder Press')) key = 'Shoulder Press';
  else if (exName.includes('Reverse Flyes') || exName.includes('Flyes')) key = 'Flyes';
  else if (exName.includes('Inverted Rows')) key = 'Inverted Rows';
  else if (exName.includes('Row')) key = 'Rows';
  else if (exName.includes('Superman')) key = 'Superman';
  else if (exName.includes('Seated Calf')) key = 'Seated Calf Raises';
  else if (exName.includes('Standing Calf') || exName.includes('Calf')) key = 'Standing Calf Raises';
  else if (exName.includes('Clamshell')) key = 'Clamshells';
  else if (exName.includes('Bridge')) key = 'Glute Bridge';
  else if (exName.includes('Squat')) key = 'Squats';
  else if (exName.includes('Lunge')) key = 'Lunges';
  else if (exName.includes('Deadlift')) key = 'Deadlift';
  else if (exName.includes('Push-ups')) key = 'Push-ups';
  else if (exName.includes('Bench Press') || exName.includes('Floor Press')) key = 'Bench Press';
  else if (exName.includes('Side Plank')) key = 'Side Plank';
  else if (exName.includes('Plank')) key = 'Plank';
  else if (exName.includes('Deadbug')) key = 'Deadbug';
  else if (exName.includes('Mountain Climbers') || exName.includes('ปีนเขา')) key = 'Mountain Climbers';
  else if (exName.includes('Crunches') || exName.includes('จักรยาน')) key = 'Crunches';
  else if (exName.includes('Stretching') || exName.includes('ยืดเหยียด')) key = 'Stretching';
  else if (exName.includes('Sleep') || exName.includes('นอนหลับ')) key = 'Sleep';
  else if (exName.includes('Walk') || exName.includes('เดิน')) key = 'Walking';
  else if (exName.includes('Jump') || exName.includes('กระโดดเชือก')) key = 'JumpRope';
  else if (exName.includes('Jacks') || exName.includes('Boxing') || exName.includes('Cardio')) key = 'Cardio';

  const info = EXERCISE_GUIDE_DATABASE[key] || {
    title: exName,
    muscle: 'กล้ามเนื้อเฉพาะส่วน (Target Muscle Group)',
    image: '',
    steps: [
      'จัดระเบียบลำตัว เกร็งแกนกลางลำตัวให้มั่นคง รักษาแนวหลังให้ตรง',
      'ออกแรงเคลื่อนไหวอย่างควบคุม ชะลอจังหวะลง 2 วินาที และออกแรงดัน/ดึง 1 วินาที',
      'หายใจออกเมื่อออกแรงหนัก และหายใจเข้าเมื่อผ่อนแรงกลับสู่ท่าเดิม'
    ],
    safety: '🛡️ ทำด้วยน้ำหนักและแรงที่ควบคุมได้เสมอ ป้องกันอาการบาดเจ็บ'
  };
  
  const titleEl = document.getElementById('ex-guide-title');
  const bodyEl = document.getElementById('ex-guide-body');
  if (titleEl) titleEl.textContent = `🖼️ ${info.title}`;

  if (bodyEl) {
    let imgHtml = '';
    const escapedTitle = info.title.replace(/'/g, "\\'");
    if (info.image) {
      imgHtml = `
        <div style="text-align:center; margin-bottom:12px; cursor:pointer; position:relative;" onclick="openImageLightbox('${imgPath(info.image)}', '${escapedTitle}')" title="แตะขยายรูปเต็มจอ">
          <img src="${imgPath(info.image)}" alt="${info.title}" style="width:100%; max-height:220px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border-color); transition:transform 0.2s ease;">
          <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.7); color:#fff; padding:4px 8px; border-radius:12px; font-size:0.7rem; font-weight:600; backdrop-filter:blur(4px); display:flex; align-items:center; gap:4px;">
            🔍 แตะขยายเต็มจอ
          </div>
        </div>
      `;
    }

    let stepsHtml = '';
    info.steps.forEach((st) => {
      stepsHtml += `<li style="margin-bottom:4px;">${st}</li>`;
    });

    bodyEl.innerHTML = `
      ${imgHtml}
      <div style="background:var(--bg-subcard); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:10px;">
        <span style="color:var(--primary); font-weight:700;">💪 กล้ามเนื้อหลักที่ทำงาน:</span> ${info.muscle}
      </div>
      <div style="margin-bottom:10px;">
        <strong style="color:var(--text-main);">📝 ขั้นตอนและวิธีปฏิบัติอย่างถูกต้อง:</strong>
        <ol style="padding-left:20px; margin-top:4px; color:var(--text-sub);">
          ${stepsHtml}
        </ol>
      </div>
      <div style="background:var(--primary-glow); padding:8px 10px; border-radius:var(--radius-md); border:1px solid var(--primary); font-size:0.78rem;">
        ${info.safety}
      </div>
    `;
  }

  openModal('modal-exercise-guide');
}

function renderWorkoutSchedule() {
  const container = document.getElementById('workout-schedule-container');
  const calibInfo = document.getElementById('workout-tdee-calibration-info');
  if (!container) return;

  const metrics = calculateMetrics(state.profile);
  const program = generateWeeklyWorkout(state.profile);

  if (calibInfo) {
    const goalNames = {
      fat_loss: 'ลดน้ำหนักและเผาผลาญไขมัน',
      muscle_gain: 'สร้างกล้ามเนื้อและเพิ่มมวล',
      toning: 'กระชับหุ่นและสร้างความฟิต',
      health: 'เพื่อสุขภาพดีและความแข็งแรง'
    };
    
    calibInfo.innerHTML = `
      <div style="color:var(--primary); font-weight:700; margin-bottom:4px; font-size:0.82rem;">
        ⚡ ตารางออกกำลังกายคำนวณปรับตาม BMR (${metrics.bmr.toLocaleString()} kcal) & TDEE (${metrics.tdee.toLocaleString()} kcal)
      </div>
      <div>
        • <strong>เป้าหมาย:</strong> ${goalNames[state.profile.goal]}<br>
        • <strong>อัตราเผาผลาญต่อมื้อ:</strong> ~${Math.round(metrics.tdee * 0.14).toLocaleString()} - ${Math.round(metrics.tdee * 0.16).toLocaleString()} kcal/วัน<br>
        • <strong>การเซฟข้อต่อ:</strong> ${metrics.bmi >= 25 || state.profile.constraints === 'knee_pain' ? '🛡️ ปรับเป็นท่า Low-Impact เซฟเข่าอัตโนมัติ (BMI ' + metrics.bmi + ')' : '✅ สภาวะร่างกายปกติ พร้อมเล่นท่า Compound'}
      </div>
    `;
  }

  container.innerHTML = '';
  program.forEach(dayPlan => {
    const card = document.createElement('div');
    card.className = 'workout-day-card';
    
    const isRest = dayPlan.isRest;
    const headerClass = isRest ? 'workout-day-header rest-day' : 'workout-day-header';
    const dayIcon = isRest ? '💤' : '🏋️‍♂️';

    let exercisesHtml = '';
    dayPlan.exercises.forEach(ex => {
      const isChecked = !!state.checkedExercises[ex.id];
      const checkedClass = isChecked ? 'completed' : '';
      const checkMark = isChecked ? '✓' : '';
      const escapedExName = ex.name.replace(/'/g, "\\'");

      const optionalTagHtml = isRest 
        ? `<span style="font-size:0.68rem; color:var(--accent-amber); font-weight:600; margin-left:6px;">✨ ทางเลือก (ทำหรือไม่ก็ได้)</span>`
        : '';

      exercisesHtml += `
        <div class="exercise-item ${checkedClass}" onclick="toggleExerciseCheck('${ex.id}')">
          <div class="custom-checkbox">${checkMark}</div>
          <div class="ex-info">
            <div class="ex-name" style="display:flex; justify-content:space-between; align-items:center;">
              <span>${ex.name} ${optionalTagHtml}</span>
              <button onclick="event.stopPropagation(); openExerciseGuideModal('${escapedExName}');" style="border:1px solid var(--border-color); background:var(--bg-input); color:var(--primary); padding:2px 8px; border-radius:12px; font-size:0.72rem; cursor:pointer; font-weight:600;" title="คลิกดูตัวอย่างท่าและคำแนะนำ">
                📷 ดูท่า
              </button>
            </div>
            <div class="ex-detail">${ex.detail}</div>
          </div>
        </div>
      `;
    });

    const badgeText = isRest ? '✨ ทางเลือก (ทำหรือไม่ก็ได้)' : `🔥 ~${dayPlan.estimatedBurn} kcal`;

    card.innerHTML = `
      <div class="${headerClass}">
        <div class="day-name">
          <span>${dayIcon}</span> ${dayPlan.day} - <span style="color: var(--primary);">${dayPlan.focus}</span>
        </div>
        <span class="badge" style="font-size:0.68rem;">${badgeText}</span>
      </div>
      <div class="exercise-list">
        <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px; padding-left:4px;">
          ⚡ ${isRest ? '💡 สภาวะวันพัก: พักผ่อน 100% หรือเลือกขยับตัวเบาๆ ตามสะดวก' : 'ปรับตาม TDEE: ' + dayPlan.intensity}
        </div>
        ${exercisesHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleExerciseCheck(id) {
  state.checkedExercises[id] = !state.checkedExercises[id];
  localStorage.setItem('javis_checked_ex', JSON.stringify(state.checkedExercises));
  renderWorkoutSchedule();
  showToast(state.checkedExercises[id] ? 'เก่งมาก! ทำท่านี้สำเร็จแล้ว 💪' : 'ยกเลิกการติ๊ก');
}

function renderMealsList() {
  const container = document.getElementById('today-meals-container');
  if (!container) return;
  container.innerHTML = '';

  const slots = ['เช้า', 'เที่ยง', 'เย็น', 'มื้อย่อย'];
  const slotIcons = { 'เช้า': '🌅', 'เที่ยง': '☀️', 'เย็น': '🌙', 'มื้อย่อย': '🥑' };

  slots.forEach(slot => {
    const mealsWithIndex = state.todayMeals.map((m, originalIdx) => ({ ...m, originalIdx })).filter(m => m.slot === slot);
    const slotDiv = document.createElement('div');
    slotDiv.className = 'meal-slot';

    let itemsHtml = '';
    if (mealsWithIndex.length === 0) {
      itemsHtml = `<div class="meal-item"><span style="color:var(--text-muted); font-size:0.75rem;">ยังไม่ได้บันทึกเมนูมื้อนี้</span></div>`;
    } else {
      mealsWithIndex.forEach(m => {
        itemsHtml += `
          <div class="meal-item">
            <div>
              <span style="font-weight:600;">${m.name}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--primary); font-weight:700;">~${m.kcal} kcal | P:${m.protein}g</span>
              <button onclick="removeMealItem(${m.originalIdx})" style="border:none; background:transparent; color:var(--accent-rose); cursor:pointer; font-size:14px;" title="ลบรายการนี้">🗑️</button>
            </div>
          </div>
        `;
      });
    }

    slotDiv.innerHTML = `
      <div class="meal-slot-header">
        <span>${slotIcons[slot]}</span> มื้อ${slot}
      </div>
      ${itemsHtml}
    `;
    container.appendChild(slotDiv);
  });
}

// Mobile Dashboard Text Generator
function renderExportText(metrics, loggedCal, loggedP, loggedC, loggedF) {
  const goalNames = {
    fat_loss: 'ลดน้ำหนักและเผาผลาญไขมัน',
    muscle_gain: 'สร้างกล้ามเนื้อและเพิ่มมวล',
    toning: 'กระชับหุ่นและสร้างความฟิต',
    health: 'เพื่อสุขภาพดีและความแข็งแรง'
  };

  const program = generateWeeklyWorkout(state.profile);

  let workoutText = '';
  program.forEach(p => {
    workoutText += `[${p.day}] - ${p.focus} (🔥 เผาผลาญประมาณ ~${p.estimatedBurn} kcal)\n`;
    p.exercises.forEach(e => {
      const isChecked = !!state.checkedExercises[e.id];
      const box = isChecked ? '☑' : '☐';
      workoutText += `  ${box} ${e.name} : ${e.detail}\n`;
    });
    workoutText += `\n`;
  });

  let mealsText = '';
  const slots = ['เช้า', 'เที่ยง', 'เย็น', 'มื้อย่อย'];
  const slotIcons = { 'เช้า': '🌅', 'เที่ยง': '☀️', 'เย็น': '🌙', 'มื้อย่อย': '🥑' };
  
  slots.forEach(slot => {
    const mealsInSlot = state.todayMeals.filter(m => m.slot === slot);
    if (mealsInSlot.length > 0) {
      mealsInSlot.forEach(m => {
        mealsText += `${slotIcons[slot]} มื้อ${slot}: ${m.name} (~${m.kcal} kcal | P: ${m.protein}g)\n`;
      });
    } else {
      mealsText += `${slotIcons[slot]} มื้อ${slot}: - (~0 kcal | P: 0g)\n`;
    }
  });

  const text = `👋 สวัสดีครับ! โค้ช JavisCoach วิเคราะห์เป้าหมาย ${goalNames[state.profile.goal]} ให้คุณเรียบร้อยครับ
วางแผนแคลอรีและการออกกำลังกายแบบเซฟร่างกาย (คำนวณตาม BMR: ${metrics.bmr.toLocaleString()} kcal | TDEE: ${metrics.tdee.toLocaleString()} kcal)!

📊 TODAY'S DASHBOARD (สรุปเป้าหมายวันนี้)
• พลังงานเป้าหมาย: ${metrics.targetCal.toLocaleString()} kcal/วัน (ทานไปแล้ว ${loggedCal.toLocaleString()} kcal)
• โปรตีน: ${metrics.proteinG}g  |  คาร์บ: ${metrics.carbsG}g  |  ไขมัน: ${metrics.fatG}g

🏋️‍♂️ WORKOUT PROGRAM (ตารางออกกำลังกายสัปดาห์นี้ - คำนวณความเข้มข้นตาม TDEE)
${workoutText.trim()}

🥗 MEAL PLAN & TRACKER (แนะนำ/คำนวณอาหาร)
${mealsText.trim()}

💡 SMART TIPS (ทริคประจำวัน)
• ดื่มน้ำเปล่าอย่างน้อย 2.5 - 3 ลิตรต่อวัน เพื่อกระตุ้นการเผาผลาญและการฟื้นฟูกล้ามเนื้อ
• ทานโปรตีนให้กระจายในทุกมื้อ เพื่อรักษามวลกล้ามเนื้อและควบคุมความหิว

💙 JavisCoach ขอเป็นกำลังใจให้คุณพิชิตหุ่นในฝัน วินัยสม่ำเสมอ ลุยไปด้วยกันครับ!`;

  const box = document.getElementById('export-text-area');
  if (box) box.value = text;
}

function copyDashboardText() {
  const text = document.getElementById('export-text-area').value;
  navigator.clipboard.writeText(text).then(() => {
    showToast('คัดลอกข้อความ Mobile Dashboard เรียบร้อยแล้ว! 📋');
  }).catch(() => {
    showToast('เลือกข้อความแล้วกดคัดลอกด้วยตนเองได้เลยครับ');
  });
}

function selectPresetFood(name, kcal, protein, carbs, fat, slotDefault) {
  addFoodMeal(slotDefault || 'เที่ยง', name, kcal, protein, carbs, fat);
  closeModal('modal-food-scanner');
  showToast(`บันทึก ${name} แล้ว! 🥗`);
}

function addFoodMeal(slot, name, kcal, protein, carbs, fat) {
  state.todayMeals.push({
    slot, name,
    kcal: parseInt(kcal) || 0,
    protein: parseInt(protein) || 0,
    carbs: parseInt(carbs) || 0,
    fat: parseInt(fat) || 0
  });
  localStorage.setItem('javis_today_meals', JSON.stringify(state.todayMeals));
  renderDashboard();
}

function switchFoodModalTab(mode) {
  const btnAuto = document.getElementById('food-tab-btn-auto');
  const btnManual = document.getElementById('food-tab-btn-manual');
  const paneAuto = document.getElementById('food-modal-pane-auto');
  const paneManual = document.getElementById('food-modal-pane-manual');

  if (mode === 'auto') {
    btnAuto?.classList.add('active');
    btnManual?.classList.remove('active');
    if (paneAuto) paneAuto.style.display = 'block';
    if (paneManual) paneManual.style.display = 'none';
  } else {
    btnManual?.classList.add('active');
    btnAuto?.classList.remove('active');
    if (paneManual) paneManual.style.display = 'block';
    if (paneAuto) paneAuto.style.display = 'none';
  }
}

function switchFoodCategory(cat) {
  const btnMain = document.getElementById('food-cat-btn-main');
  const btnFruit = document.getElementById('food-cat-btn-fruit');
  const gridMain = document.getElementById('preset-grid-main');
  const gridFruit = document.getElementById('preset-grid-fruit');

  if (cat === 'main') {
    btnMain?.classList.add('active');
    btnFruit?.classList.remove('active');
    if (gridMain) gridMain.style.display = 'grid';
    if (gridFruit) gridFruit.style.display = 'none';
  } else {
    btnFruit?.classList.add('active');
    btnMain?.classList.remove('active');
    if (gridFruit) gridFruit.style.display = 'grid';
    if (gridMain) gridMain.style.display = 'none';
  }
}

function addManualFoodMeal() {
  const nameInput = document.getElementById('manual-food-name')?.value.trim();
  const slot = document.getElementById('manual-food-slot')?.value || 'เที่ยง';
  const kcalVal = parseInt(document.getElementById('manual-food-kcal')?.value) || 0;
  const pVal = parseInt(document.getElementById('manual-food-p')?.value) || 0;
  const cVal = parseInt(document.getElementById('manual-food-c')?.value) || 0;
  const fVal = parseInt(document.getElementById('manual-food-f')?.value) || 0;

  if (!nameInput && kcalVal === 0) {
    showToast('กรุณากรอกชื่ออาหาร หรือระบุแคลอรีด้วยครับ');
    return;
  }

  const name = nameInput || 'อาหารระบุค่าเอง';
  addFoodMeal(slot, name, kcalVal, pVal, cVal, fVal);

  if (document.getElementById('manual-food-name')) document.getElementById('manual-food-name').value = '';
  if (document.getElementById('manual-food-kcal')) document.getElementById('manual-food-kcal').value = '';
  if (document.getElementById('manual-food-p')) document.getElementById('manual-food-p').value = '';
  if (document.getElementById('manual-food-c')) document.getElementById('manual-food-c').value = '';
  if (document.getElementById('manual-food-f')) document.getElementById('manual-food-f').value = '';

  closeModal('modal-food-scanner');
  showToast(`บันทึกค่าโภชนาการ: ${name} (${kcalVal} kcal) เรียบร้อย! 🥗`);
}

function analyzeCustomFood() {
  const textInput = document.getElementById('custom-food-text').value.trim();
  if (!textInput) return;

  const slot = document.getElementById('custom-food-slot').value;
  const style = document.getElementById('custom-food-style')?.value || 'street';

  let estKcal = 400, estP = 22, estC = 50, estF = 12;
  let isFruit = false;
  
  if (textInput.includes('กล้วย')) {
    estKcal = 105; estP = 1; estC = 27; estF = 0; isFruit = true;
  } else if (textInput.includes('แอปเปิล') || textInput.includes('แอปเปิ้ล')) {
    estKcal = 95; estP = 0.5; estC = 25; estF = 0; isFruit = true;
  } else if (textInput.includes('แตงโม')) {
    estKcal = 45; estP = 0.9; estC = 11; estF = 0; isFruit = true;
  } else if (textInput.includes('ฝรั่ง')) {
    estKcal = 70; estP = 1.4; estC = 17; estF = 0.5; isFruit = true;
  } else if (textInput.includes('ส้ม')) {
    estKcal = 60; estP = 1.2; estC = 15; estF = 0.2; isFruit = true;
  } else if (textInput.includes('มะละกอ')) {
    estKcal = 60; estP = 0.7; estC = 15; estF = 0.2; isFruit = true;
  } else if (textInput.includes('กะเพรา')) {
    estKcal = 480; estP = 26; estC = 52; estF = 16;
  } else if (textInput.includes('ข้าวผัด')) {
    estKcal = 500; estP = 22; estC = 62; estF = 18;
  } else if (textInput.includes('ข้าวมันไก่')) {
    estKcal = 550; estP = 25; estC = 60; estF = 20;
  } else if (textInput.includes('ข้าวขาหมู')) {
    estKcal = 600; estP = 24; estC = 55; estF = 28;
  } else if (textInput.includes('หมูกรอบ')) {
    estKcal += 160; estF += 14;
  } else if (textInput.includes('อกไก่') || textInput.includes('เวย์')) {
    estKcal = 160; estP = 30; estC = 5; estF = 3;
  } else if (textInput.includes('สลัด') || textInput.includes('สุกี้')) {
    estKcal = 280; estP = 24; estC = 25; estF = 6;
  }

  if (textInput.includes('ไข่ดาว') || textInput.includes('ทอด')) {
    estKcal += 140; estF += 12;
  } else if (textInput.includes('ไข่เจียว')) {
    estKcal += 180; estF += 16;
  } else if (textInput.includes('ไข่ต้ม')) {
    estKcal += 70; estP += 6; estF += 5;
  }

  // Adjust for Street Food vs Clean Healthy Cooking (skip adjustment if it's fresh fruit)
  if (style === 'street' && !isFruit) {
    estKcal = Math.round(estKcal * 1.25);
    estF = Math.round(estF * 1.35);
    estC = Math.round(estC * 1.15);
  }

  const styleTag = isFruit ? ' (ผลไม้สด)' : style === 'street' ? ' (ร้านตามสั่งทั่วไป)' : ' (คลีนน้ำมันน้อย)';
  addFoodMeal(slot, textInput + styleTag, estKcal, estP, estC, estF);
  document.getElementById('custom-food-text').value = '';
  closeModal('modal-food-scanner');
  showToast(`วิเคราะห์อาหาร: ${textInput} (~${estKcal} kcal) เรียบร้อย!`);
}

function askSmartCoach() {
  const metrics = calculateMetrics(state.profile);
  let totalKcal = 0, totalP = 0;
  state.todayMeals.forEach(m => { totalKcal += m.kcal; totalP += m.protein; });

  const remainCal = Math.max(0, metrics.targetCal - totalKcal);
  const remainP = Math.max(0, metrics.proteinG - totalP);

  const userQuestion = document.getElementById('coach-input').value.trim();
  const chatContainer = document.getElementById('chat-container');

  if (userQuestion) {
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble user';
    userMsg.textContent = userQuestion;
    chatContainer.appendChild(userMsg);
    document.getElementById('coach-input').value = '';
  }

  let responseText = '';
  if (userQuestion.includes('ปลายวัน') || userQuestion.includes('แคลขาด') || userQuestion.includes('ไม่ถึง') || userQuestion.includes('กินเพิ่ม')) {
    responseText = `🌙 **คำแนะนำจากโค้ชเมื่อแคลอรีปลายวันยังไม่ถึงเป้า:**

คุณยังเหลือโควตาแคลอรีอีก **~${remainCal.toLocaleString()} kcal** (โปรตีนขาด **~${remainP}g**)

💡 **หลักการตัดสินใจ:**
1. **หากขาดมากกว่า 300 kcal:** **"ควรกินเพิ่มครับ!"** เพราะการกินน้อยเกินไปจนต่ำกว่า BMR ร่างกายจะปรับลดระบบเผาผลาญและสลายกล้ามเนื้อมาใช้
2. **เน้นมื้อดึกย่อยง่าย ไม่แน่นท้อง:**
   - 🥛 **เวย์โปรตีน 1 สกู๊ป หรือ นม High Protein 7-11** (~140 kcal | P 25g)
   - 🥚 **ไข่ต้ม 2 ฟอง** (~140 kcal | P 12g)
   - 🥣 **กรีกโยเกิร์ต 0% Fat + ถั่วอัลมอนด์ 5 เม็ด** (~150 kcal)
3. **ข้อห้ามยามดึก:** หลีกเลี่ยงอาหารของทอด/ของผัดมันๆ และแป้งหนักๆ เพราะจะทำให้นอนหลับยากและจุกแน่นท้องครับ!`;
  } else if (userQuestion.includes('กินอะไรดี') || userQuestion.includes('แนะนำอาหาร') || !userQuestion) {
    responseText = `💡 **คำแนะนำเมนูวันนี้จาก JavisCoach:**
คุณเหลือโควตาแคลอรีวันนี้ **~${remainCal.toLocaleString()} kcal** และโปรตีนขาดอีก **~${remainP}g**

ร้านแนะนำซื้อง่าย:
1. 🏪 **7-Eleven**: อกไก่นุ่ม (120 kcal | P 24g) + ข้าวกล้อง (160 kcal)
2. 🍳 **ร้านตามสั่ง**: สุกี้น้ำอกไก่ ไม่กระเทียมเจียว (280 kcal | P 26g)
3. 🏠 **ทำเองง่ายๆ**: ยำปลากระป๋อง + ไข่ต้ม 2 ฟอง (250 kcal | P 22g)`;
  } else if (userQuestion.includes('เจ็บเข่า') || userQuestion.includes('ปวดเข่า')) {
    responseText = `🩺 **คำแนะนำจากโค้ช:**
หากมีอาการปวดเข่า ให้เลี่ยงสควอทกระโดด แล้วทำท่า **Glute Bridge (ยกสะโพกเกร็งก้น)** แทน เพื่อเสริมสร้างกล้ามเนื้อก้นและต้นขาโดยไม่รับแรงกระแทกเข่าครับ!`;
  } else {
    responseText = `💪 **คำตอบจาก JavisCoach:**
สำหรับเป้าหมายของคุณ ทานโปรตีนให้ถึงเป้าหมายประจำวัน (${metrics.proteinG}g/วัน) ร่วมกับออกกำลังกายอย่างสม่ำเสมอ รับรองเห็นผลแน่นอนครับ!`;
  }

  setTimeout(() => {
    const coachMsg = document.createElement('div');
    coachMsg.className = 'chat-bubble coach';
    coachMsg.innerHTML = responseText.replace(/\n/g, '<br>');
    chatContainer.appendChild(coachMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 250);
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const activeTabBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if (activeTabBtn) activeTabBtn.classList.add('active');
  
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.add('active');

  document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
  if (tabId === 'tab-dashboard') document.getElementById('step-1')?.classList.add('active');
  else if (tabId === 'tab-workout') document.getElementById('step-2')?.classList.add('active');
  else if (tabId === 'tab-nutrition') document.getElementById('step-3')?.classList.add('active');

  if (tabId === 'tab-library') {
    renderExerciseLibrary(currentLibraryCategory);
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'modal-profile') updateModalLivePreview();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(msg) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function saveUserProfile(e) {
  if (e) e.preventDefault();
  
  state.profile = {
    gender: document.getElementById('form-gender')?.value || 'male',
    age: parseInt(document.getElementById('form-age')?.value) || 28,
    weight: parseFloat(document.getElementById('form-weight')?.value) || 70,
    height: parseFloat(document.getElementById('form-height')?.value) || 175,
    activity: parseFloat(document.getElementById('form-activity')?.value) || 1.55,
    goal: document.getElementById('form-goal')?.value || 'fat_loss',
    workoutDays: parseInt(document.getElementById('form-days')?.value) || 4,
    equipment: document.getElementById('form-equipment')?.value || 'dumbbells',
    constraints: document.getElementById('form-constraints')?.value || 'none',
    dietary: document.getElementById('form-dietary')?.value || 'none'
  };

  localStorage.setItem('javis_profile', JSON.stringify(state.profile));
  closeModal('modal-profile');
  renderDashboard();
  showToast('บันทึกข้อมูล คำนวณโควตา และปรับตารางออกกำลังกายใหม่เรียบร้อย! 🎯');
}

document.addEventListener('DOMContentLoaded', () => {
  setTheme(state.theme);

  const p = state.profile;
  if (document.getElementById('form-gender')) document.getElementById('form-gender').value = p.gender;
  if (document.getElementById('form-age')) document.getElementById('form-age').value = p.age;
  if (document.getElementById('form-weight')) document.getElementById('form-weight').value = p.weight;
  if (document.getElementById('form-height')) document.getElementById('form-height').value = p.height;
  if (document.getElementById('form-activity')) document.getElementById('form-activity').value = p.activity;
  if (document.getElementById('form-goal')) document.getElementById('form-goal').value = p.goal;
  if (document.getElementById('form-days')) document.getElementById('form-days').value = p.workoutDays;
  if (document.getElementById('form-equipment')) document.getElementById('form-equipment').value = p.equipment;
  if (document.getElementById('form-constraints')) document.getElementById('form-constraints').value = p.constraints;
  if (document.getElementById('form-dietary')) document.getElementById('form-dietary').value = p.dietary;

  const formInputs = ['form-gender', 'form-age', 'form-weight', 'form-height', 'form-activity', 'form-goal', 'form-days', 'form-equipment', 'form-constraints', 'form-dietary'];
  formInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateModalLivePreview);
      el.addEventListener('change', updateModalLivePreview);
    }
  });

  renderDashboard();
});
