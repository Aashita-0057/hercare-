// Seed script — creates CLEARLY-LABELLED SAMPLE data only.
// Every Facility record has isSample: true and demo-marked names so nothing
// can be mistaken for a verified real-world doctor. Helplines listed are the
// official public government numbers (112/181/1098/Kiran/Quitline/iCall).
// Run: npx prisma db seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const j = (arr: string[]) => JSON.stringify(arr);

async function main() {
  // ---------- FACILITIES (all isSample: true) ----------
  const facilities = [
    {
      name: "DEMO District Hospital — Sampletown",
      kind: "hospital", ownership: "government",
      doctorName: null, isFemaleDoctor: false, femaleDoctorAvail: true,
      specialty: "General gynaecology & obstetrics",
      address: "Main Road, Sampletown", state: "Demo Pradesh", district: "Sample District", block: "Sample Block I",
      phone: "1800000001", feeText: "Free (OPD)", feeVerified: true, freeConfirmed: true,
      openingHours: "24×7", services: j(["Labour room", "Gynae OPD", "Blood bank", "Women ward"]),
      hasWomenWard: true, lastVerifiedAt: null,
    },
    {
      name: "DEMO Community Health Centre — Riverpur",
      kind: "chc", ownership: "government",
      specialty: "Family health",
      address: "NH Side, Riverpur", state: "Demo Pradesh", district: "Sample District", block: "Sample Block II",
      phone: "1800000002", feeText: "Free", feeVerified: true, freeConfirmed: true,
      openingHours: "Mon–Sat 9am–5pm; delivery rounds mornings & evenings",
      services: j(["Antenatal check-up", "Delivery", "Family planning", "Vaccination"]),
      languagesSpoken: j(["Hindi", "English"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Primary Health Centre — Villagesample",
      kind: "phc", ownership: "government",
      specialty: "Basic care + ANM",
      address: "Panchayat Road, Villagesample", state: "Demo Pradesh", district: "Hill District", block: "Hill Block",
      village: "Villagesample",
      feeText: "Free", feeVerified: true, freeConfirmed: true,
      openingHours: "Tue/Thu/Sat mornings (demo pattern)",
      services: j(["ANM visits", "Iron & folic acid", "Weight & BP check", "Vaccination"]),
      languagesSpoken: j(["Hindi"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Women's Clinic (Dr. Sample A.)",
      kind: "clinic", ownership: "private",
      doctorName: "Dr. Sample A. (DEMO)", isFemaleDoctor: true,
      specialty: "Gynaecologist", qualifications: "MBBS, MD OBG (demo)",
      address: "Market Chowk, Sampletown", state: "Demo Pradesh", district: "Sample District",
      phone: "1800000004", feeText: "₹300 (consult)", feeVerified: true, freeConfirmed: false,
      openingHours: "Mon–Fri 5–8pm", services: j(["Scan", "Pregnancy care"]),
      languagesSpoken: j(["Hindi", "English"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO General Physician — Dr. Example B.",
      kind: "doctor", ownership: "private",
      doctorName: "Dr. Example B. (DEMO)", isFemaleDoctor: false,
      specialty: "General medicine", qualifications: "MBBS (demo)",
      address: "Station Road, Hill Town", state: "Demo Pradesh", district: "Hill District",
      phone: "1800000005", feeText: "Fee not verified", feeVerified: false, freeConfirmed: false,
      services: j(["Fever care", "Diabetes follow-up"]),
      languagesSpoken: j(["Hindi"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO De-addiction Centre (Women's Wing)",
      kind: "rehab", ownership: "ngo",
      specialty: "Substance use recovery",
      address: "Green Campus, Sampletown", state: "Demo Pradesh", district: "Sample District",
      phone: "1800000006", feeText: "Sliding scale — fee not verified", feeVerified: false,
      openingHours: "Admission anytime via helpline",
      services: j(["Medically supervised detox referral", "Counselling", "Family sessions", "Women-only dormitory"]),
      hasWomenWard: true, confidentialityInfo: "Demo record — real deployments must verify confidentiality practice on a site visit before claiming it.",
      languagesSpoken: j(["Hindi", "English"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Psychiatric Out-patient Clinic",
      kind: "psychiatric", ownership: "government",
      specialty: "Mental health",
      address: "Behind District Hospital, Sampletown", state: "Demo Pradesh", district: "Sample District",
      feeText: "Free", feeVerified: true, freeConfirmed: true,
      openingHours: "Wed 10am–2pm (demo)", services: j(["Depression & anxiety care", "De-addiction OPD", "Medicines free of cost"]),
      languagesSpoken: j(["Hindi"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Counselling Helpline Centre (Counsellor C.)",
      kind: "counsellor", ownership: "private",
      doctorName: "Counsellor C. (DEMO)", isFemaleDoctor: true,
      specialty: "Clinical psychologist", qualifications: "MPhil Clinical Psych (demo)",
      address: "Online + Sampletown clinic", state: "Demo Pradesh", district: "Sample District",
      phone: "1800000008", feeText: "₹500 (demo, not verified)", feeVerified: false,
      services: j(["Individual therapy", "Couples", "Adolescent"]),
      languagesSpoken: j(["English", "Hindi", "Tamil"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Women's Support Centre — Sakhi (demo)",
      kind: "support_centre", ownership: "ngo",
      specialty: "Crisis support",
      address: "Old Bus Stand, Hill Town", state: "Demo Pradesh", district: "Hill District",
      phone: "1800000009", feeText: "Free", feeVerified: true, freeConfirmed: true,
      openingHours: "24×7 door", services: j(["Safe temporary stay", "Escort to hospital/police on request", "Legal referral"]),
      confidentialityInfo: "Demo: address not publicised on leaflets in real operation.",
      languagesSpoken: j(["Hindi"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO District Legal Aid Committee",
      kind: "legal_aid", ownership: "government",
      address: "Court Lane, Sampletown", state: "Demo Pradesh", district: "Sample District",
      phone: "1800000010", feeText: "Free", feeVerified: true, freeConfirmed: true,
      openingHours: "Mon–Sat 10am–5pm", services: j(["Free lawyer for women", "FIR/complaint guidance", "Dowry & harassment cases"]),
      languagesSpoken: j(["Hindi", "English"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO NGO Health Van — Hill District",
      kind: "ngo", ownership: "ngo",
      address: "Rotating villages (demo schedule)", state: "Demo Pradesh", district: "Hill District", block: "Hill Block",
      feeText: "Free", feeVerified: true, freeConfirmed: true,
      services: j(["Screening camps", "Referral slips", "Hygiene kits"]),
      languagesSpoken: j(["Hindi"]), lastVerifiedAt: null,
    },
    {
      name: "DEMO Maternity Home (Private)",
      kind: "hospital", ownership: "private",
      doctorName: null, isFemaleDoctor: false, femaleDoctorAvail: null,
      specialty: "Obstetrics",
      address: "Ring Road, Sampletown", state: "Demo Pradesh", district: "Sample District",
      phone: "1800000012", feeText: "Fee not verified", feeVerified: false,
      services: j(["Delivery", "C-section"]),
      languagesSpoken: j(["Hindi", "English"]), lastVerifiedAt: null,
    },
  ];

  for (const f of facilities) {
    await prisma.facility.create({ data: { ...f, isSample: true } });
  }

  // ---------- HELPLINES (real, official public numbers) ----------
  const helplines = [
    { name: "Emergency Response Support System", number: "112", description: "Police, ambulance, fire — all-in-one, free, all India", isEmergency: true, availability: "24×7", categories: j(["emergency", "women", "child", "mental-health"]) },
    { name: "Women Helpline", number: "181", description: "Abuse & distress support, referral to One Stop Centres", isEmergency: false, availability: "24×7 (varies by state)", categories: j(["women", "emergency"]) },
    { name: "Childline", number: "1098", description: "For children in danger or distress", isEmergency: false, availability: "24×7", categories: j(["child", "emergency"]) },
    { name: "Kiran Mental Health Helpline", number: "1800-599-0019", description: "Free counselling in 14+ languages", isEmergency: false, availability: "24×7", categories: j(["mental-health"]) },
    { name: "National De-addiction Helpline (MNAM)", number: "1800-11-2356", description: "Quit support for alcohol, tobacco & drugs", isEmergency: false, availability: "24×7", categories: j(["addiction", "mental-health"]) },
    { name: "iCall (TISS)", number: "9152987821", description: "Psychosocial counselling, Mon–Sat 10am–8pm", isEmergency: false, availability: "Mon–Sat 10:00–20:00", categories: j(["mental-health"]) },
  ];
  for (const h of helplines) {
    const exists = await prisma.helpline.findFirst({ where: { number: h.number } });
    if (!exists) await prisma.helpline.create({ data: h });
  }

  // ---------- ARTICLES (en + hi) ----------
  const articles: {
    slug: string; category: string; icon: string;
    en: { title: string; summary: string; body: string; when: string };
    hi: { title: string; summary: string; body: string; when: string };
  }[] = [
    {
      slug: "iron-your-body", category: "lifecycle", icon: "🩸",
      en: {
        title: "Iron & your monthly cycle",
        summary: "Why so many Indian women feel tired all the time — and the cheap fix.",
        body:
          "## Why it matters\nAlmost half of Indian women of reproductive age are anaemic. Monthly periods, pregnancy and poor dietary iron add up quietly — tiredness, breathlessness on stairs, pale inner lids, hair fall and dizziness are the common signals.\n\n## Simple steps\n- One iron-and-folic-acid tablet weekly is free at every PHC/ANM — ask for it, it is your right.\n- Vitamin C helps: lemon, amla, orange with meals.\n- Tea and coffee within 2 hours of eating block iron — shift them away from meals.\n- Cook in a kadhai — cast-iron cooking genuinely raises food iron.\n\n## Get tested\nA ₹20–50 haemoglobin test at any government facility tells you your real level. Heavy bleeding (soaking a pad every hour for 2+ hours) is NOT normal and needs a doctor.",
        when: "Persistent tiredness, breathlessness, very heavy or irregular periods, dizziness — see a doctor; if you faint or cannot breathe, call 112.",
      },
      hi: {
        title: "लोहा और आपका मासिक धर्म",
        summary: "भारतीय महिलाओं में थकान की आम व सस्ती जड़—समझें और उपाय करें।",
        body:
          "## क्यों ज़रूरी\nभारत की लगभग आधी प्रजनन-उम्र की महिलाएँ अनीमिया से पीड़ित हैं। मासिक धर्म, गर्भधारण और भोजन में लोहे की कमी चुपचाप जमती है — थकान, सीढ़ियों पर साँस फूलना, पलकों का सफेद पड़ना, बाल झड़ना और चक्कर आम संकेत हैं।\n\n## सरल उपाय\n- हर सप्ताह एक आयरन-फॉलिक एसिड गोली हर PHC/आशा में मुफ़्त — माँगें, यह आपका अधिकार है।\n- विटामिन C मदद करता है: नींबू, आँवला, मॉस भोजन के साथ।\n- खाने से 2 घंटे पहले-बाद चाय कॉफी लोहे को रोकती है — समय बदलें।\n- कड़ाही में खाना पकाने से भोजन का लोहा सच में बढ़ता है।\n\n## जाँच कराएँ\n₹20–50 का हीमोग्लोबिन टेस्ट हर सरकारी केंद्र पर असली स्तर बताता है। एक घंटे में एक पैड भीग जाना (2+ घंटे तक) सामान्य नहीं — डॉक्टर दिखाएँ।",
        when: "लगातार थकान, साँस फूलना, बहुत ज़्यादा या अनियमित मासिक धर्म, चक्कर — डॉक्टर को दिखाएँ; बेहोशी या साँस में दिक्कत हो तो 112 डायल करें।",
      },
    },
    {
      slug: "periods-normal-what", category: "lifecycle", icon: "🌸",
      en: {
        title: "Periods: what is normal, what is not",
        summary: "Cycle range, pain that is too much, and when bleeding needs a doctor.",
        body:
          "## The normal window\nCycles every 21–35 days, lasting 2–7 days, with cramps that work-day life still continues through. First periods can be irregular for years; they always stop by ~51 (average 46–48 in India).\n\n## Not normal\n- Soaking a pad hourly, clots bigger than a lemon, periods >7 days\n- Pain that stops school/work even with medicine\n- Bleeding after sex or after menopause, ever\n- No period 3 months when you could be pregnant\n\n## Myths to drop\nPeriod blood is not 'dirty'; you can exercise, wash hair, and pray during periods. Rest if the body asks — that is choice, not rule.",
        when: "Any 'not normal' sign above → gynaecologist within days. Sudden severe pain + fainting → 112.",
      },
      hi: {
        title: "मासिक धर्म: क्या सामान्य, क्या नहीं",
        summary: "चक्र की सीमा, बहुत ज़्यादा दर्द, और कब रक्तस्राव में चाहिए डॉक्टर।",
        body:
          "## सामान्य दायरा\n21–35 दिन में चक्र, 2–7 दिन रहना, इतनी मरोड़ कि दिन का काम चले। पहली periods वर्षों तक बेतर्तीब हो सकती हैं; ~51 वर्ष तक हमेशा रुकनी चाहिए (भारत में औसत 46–48)।\n\n## सामान्य नहीं\n- घंटे में एक पैड भीगना, नींबू से बड़े थक्के, 7 दिन से ज़्यादा\n- दर्द जो दवा के बाद भी पढ़ाई/काम रोक दे\n- सेक्स के बाद या रजोनिवृत्ति के बाद कभी भी रक्तस्राव\n- संभावित गर्भधारण में 3 माह मासिक धर्म न आना\n\n## छोड़ने लायक अंधविश्वास\nमासिक का खून 'गंदा' नहीं; इसमें अभ्यास, बाल धोना, प्रार्थना सब ठीक। शरीर माँगे तो आराम करें — यह नियम नहीं, विकल्प है।",
        when: "ऊपर कोई भी 'सामान्य नहीं' चिह्न → कुछ दिनों में स्त्री रोग विशेषज्ञ। अचानक तेज़ दर्द + बेहोशी → 112।",
      },
    },
    {
      slug: "pap-and-breast", category: "preventive", icon: "🛡",
      en: {
        title: "Cervical & breast checks — the two saves",
        summary: "India's two most common women cancers are the easiest to catch early.",
        body:
          "## Cervical (neck of womb)\nSecond most common cancer in Indian women, and almost fully preventable. From age 30: a vinegar/acetic-acid visual screen (VIA — free at PHCs, 5 minutes) or pap/HPV test every few years as your state advises. Treat the pre-cancer and cancer never forms.\n\n## Breast\nLump in 9 of 10 cases is harmless, but every lump must be checked. Know your normal once a month (day after periods). Any lump, dimpling, nipple discharge or one-side change → surgical OPD. From 40, clinical breast exam yearly at a government facility.\n\n## Free-of-cost\nCancer Institute OPDs and district hospitals screen free. 'Too late to bother' is the only wrong choice.",
        when: "Any lump, post-menopausal bleeding, bleeding after sex, foul discharge — same-week doctor visit.",
      },
      hi: {
        title: "गर्भाशय-ग्रीवा और स्तन जाँच — दो बचतें",
        summary: "भारत की सबसे आम दो महिला-कैंसर सबसे आसान हैं जल्दी पकड़ने में।",
        body:
          "## सर्वाइकल (गर्भाशय-ग्रीवा)\nभारतीय महिलाओं में दूसरी सबसे आम कैंसर, और लगभग पूरी रोकने-योग्य। 30 वर्ष से: सिरका/एसिटिक-अम्ल विज़ुअल स्क्रीन (VIA — PHC पर मुफ़्त, 5 मिनट) या pap/HPV जाँच जैसे आपके राज्य सलाह दें। पहले-कैंसर का इलाज हो जाए तो कैंसर बनती ही नहीं।\n\n## स्तन\n10 में 9 गाँठ निर्दोष, पर हर गाँठ जाँच-योग्य। महीने में एक बार (period के अगले दिन) अपना सामान्य जान लें। कोई गाँठ, खिंचाव, निप्पल से रिसना, एक-तरफा बदलाव → सर्जरी OPD। 40 से हर वर्ष सरकारी केंद्र पर क्लिनिकल स्तन जाँच।\n\n## मुफ़्त\nकैंसर संस्थान OPD और जिला अस्पताल मुफ़्त जाँचते हैं। 'देर हो गई, छोड़ो' ही एकमात्र गलत विकल्प है।",
        when: "कोई भी गाँठ, रजोनिवृत्ति-पश्चात् रक्तस्राव, सेक्स के बाद रक्तस्राव, बदबूदार स्राव — उसी सप्ताह डॉक्टर।",
      },
    },
    {
      slug: "bp-after-40", category: "preventive", icon: "❤️‍🩹",
      en: {
        title: "BP and sugar after 40 (or earlier)",
        summary: "Silent, cheap to find, deadly to ignore — the two checks every woman skips.",
        body:
          "## Why women specifically\nAfter menopause a woman's BP and sugar risk rise sharply — often before any symptom. High BP is India's biggest stroke cause and strokes hit women harder.\n\n## The checks\n- BP: yearly from 30, at any PHC — free, 3 minutes. Normal is under 140/90 for this purpose; ask for the exact target.\n- Sugar: fasting glucose or HbA1c every 3 years from 40 (yearly if overweight, family history, or had gestational diabetes).\n- Cholesterol: with sugar test when doctor advises.\n\n## If a number is off\nOne reading is not a verdict — recheck twice, resting 5 minutes. Then medicines, if needed, are cheap generics. The danger is not the tablet; it is the uncontrolled decade before it.",
        when: "BP ≥160/100, sugar with vomiting/confusion, or sudden worst-ever headache / one-side weakness → emergency same hour.",
      },
      hi: {
        title: "40 के बाद बीपी और शुगर (या पहले भी)",
        summary: "चुप, खोजने में सस्ती, नज़रअंदाज़ में घातक — दो जाँच हर महिला टालती है।",
        body:
          "## खासकर महिलाएँ क्यों\nरजोनिवृत्ति के बाद महिला का बीपी और शुगर खतरा तेज़ी से बढ़ता है — अक्सर किसी लक्षण से पहले। उच्च रक्तचाप भारत में घातक स्ट्रोक का सबसे बड़ा कारण है, और स्ट्रोक महिलाओं को ज़्यादा नुकसान पहुँचाते हैं।\n\n## जाँच\n- बीपी: 30 से हर वर्ष, किसी PHC — मुफ़्त, 3 मिनट। इस काम के लिए सामान्य 140/90 से कम; सटीक लक्ष्य डॉक्टर से पूछें।\n- शुगर: 40 से हर 3 वर्ष फास्टिंग ग्लूकोज या HbA1c (वज़न ज़्यादा, पुरानी परिवारिक शुगर, या गर्भ-शुगर रही हो तो हर वर्ष)।\n- कोलेस्ट्रॉल: डॉक्टर की सलाह पर शुगर के साथ।\n\n## संख्या बिगड़े तो\nएक रीडिंग फ़ैसला नहीं — 5 मिनट आराम के बाद दोबारा जाँचें। फिर ज़रूरत लगे तो दवाएँ सस्ती जनरिक हैं। खतरा गोली का नहीं, उससे पहले अनियंत्रित दशक का है।",
        when: "बीपी ≥160/100, शुगर के साथ उल्टी/बेहोशी, या अचानक सबसे तेज़ सिरदर्द/एक-तरफा कमज़ोरी → उसी घंटे आपातकाल।",
      },
    },
    {
      slug: "sleep-stress-women", category: "wellness", icon: "😴",
      en: {
        title: "Sleep, stress and the double shift",
        summary: "Work, home, care-duty — women's sleep debt is real and treatable.",
        body:
          "## The pattern\nMost Indian women run a double shift: outside work plus unpaid home and care work that starts before dawn and ends after everyone sleeps. Cortisol (stress hormone) then blocks deep sleep — tiredness breeds more stress, a true loop, not personal weakness.\n\n## Small levers that work\n- Fixed wind-down 45 min before target sleep: phone away, dim light, warm water wash.\n- No tea/coffee after 5 pm; if sleepless 3+ nights weekly for a month, that is a medical symptom — tell a health worker, it is treatable.\n- Share the load explicitly: one named task each to other adults in the home, not 'help'.\n- 10 outdoor minutes of morning light steadies body clock better than any supplement.\n\n## Watch for\nSnoring with daytime sleeps, restless legs, low mood with early waking — all have specific treatments; naming them to a doctor speeds help.",
        when: "Sleepless nights most days for a month, or low mood >2 weeks, or any thought of self-harm → Kiran 1800-599-0019 free, or a doctor; self-harm thoughts → 112 now.",
      },
      hi: {
        title: "नींद, तनाव और दोहरी ड्यूटी",
        summary: "काम, घर, देखभाल — महिलाओं की नींद-कर्ज़ असली है और ठीक होती है।",
        body:
          "## ढर्रा\nज़्यादातर भारतीय महिलाएँ दोहरी ड्यूटी चलाती हैं: बाहर का काम और घर-देखभाल का बिना-पगार काम जो सुबह सबसे पहले और रात सबके बाद। तनाव-हार्मोन फिर गहरी नींद रोकते हैं — थकान और तनाव एक असली चक्र है, व्यक्तिगत कमज़ोरी नहीं।\n\n## छोटे काम-करने-वाले पहलू\n- लक्षित नींद से 45 मिनट पहले तय रीत: फ़ोन दूर, मंद रोशनी, गुनगुने पानी से धुलाई।\n- शाम 5 के बाद चाय/कॉफी नहीं; एक माह में हफ्ते के 3+ रातें नींद न आए तो यह चिकित्सा-लक्षण है — स्वास्थ्यकर्मी को बताएँ, ठीक होता है।\n- बोझ साफ़-साफ़ बाँटें: घर के हर वयस्क को एक नाम-दिए काम, 'मदद' नहीं।\n- सुबह 10 मिनट बाहर की रोशनी कोई भी सप्लीमेंट से बेहतर घड़ी-तंत्र संतुलती है।\n\n## पहचानें\nखर्राटे दिन में नींद, बेचैन पैर, सुबह-जल्दी-उठने वाला उदासी — सबकी विशिष्ट दवाएँ हैं; डॉक्टर को नाम बताएँ तो मदद तेज़।",
        when: "एक माह तक ज़्यादातर रातें अनिद्रा, या 2 सप्ताह से ज़्यादा उदासी, या आत्म-क्षति का कोई विचार → किरण 1800-599-0019 मुफ़्त, या डॉक्टर; आत्म-क्षति के विचार → अभी 112।",
      },
    },
    {
      slug: "myth-period-pregnancy", category: "myths", icon: "❌",
      en: {
        title: "Myth-busters: periods & pregnancy",
        summary: "Six common beliefs, checked against science.",
        body:
          "## Myth 1: Periods stop if you have sex during them.\nNo. Pregnancy from period sex is unlikely but possible — sperm live days inside.\n\n## Myth 2: A woman cannot get pregnant the first time / if she is on top / standing.\nAll false. Position and order do not prevent a live sperm meeting the egg.\n\n## Myth 3: During periods you must not wash hair / cook / enter temple.\nHygiene during periods protects health — warm washing reduces cramp pain. No science behind restrictions; worship is never barred.\n\n## Myth 4: Papaya and pineapples induce periods / abortion.\nFood quantities do not end a pregnancy. Large raw papaya extracts show weak lab evidence only. Any bleeding in pregnancy needs a doctor, not fruit.\n\n## Myth 5: Morning sickness means carrying a girl.\nGender is decided by the father's chromosome at the first moment — sickness reflects hormone levels, not the baby's sex.\n\n## Myth 6: Iron tablets make pregnancy deliveries 'difficult' or the baby 'too big'.\nIron prevents maternal anaemia and low birth weight — the opposite of the fear. If tablets upset you, ask for a different salt/timing.",
        when: "Use these to answer relatives confidently; for a real health decision, the doctor's word wins.",
      },
      hi: {
        title: "अंधविश्वास-भंजक: मासिक धर्म और गर्भधारण",
        summary: "छह आम मान्यताएँ, विज्ञान से जाँची।",
        body:
          "## 1: मासिक में सेक्स से मासिक बंद होते\nनहीं। मासिक-सेक्स से गर्भ असंभव नहीं — शुक्राणु अंदर दिन जीते हैं।\n\n## 2: पहली बार/ऊपर रहने/खड़े होने से गर्भ नहीं\nसब गलत। स्थिति-क्रम जीवित शुक्राणु-अंडा मिलन नहीं रोकते।\n\n## 3: मासिक में बाल न धोए/खाना न बनाए/मंदिर न जाएँ\nमासिक में धुलाई स्वास्थ्य-रक्षक — गरम पानी दर्द घटाता है। रोक के पीछे विज्ञान नहीं; पूजा कभी वर्जित नहीं।\n\n## 4: पपीता-अनानास मासिक/गर्भपात लाते\nभोजन-मात्रा गर्भ नहीं रोकती। बड़ा कच्चा पपीता-सार सिर्फ़ प्रयोगशाला-कमज़ोर प्रमाण। गर्भ में रक्तस्राव में फल नहीं डॉक्टर चाहिए।\n\n## 5: उल्टी = कन्या\nलिंग बाबा के गुणसूत्र से पहले पल में तय। उल्टी हार्मोन-स्तर दिखाती, लिंग नहीं।\n\n## 6: आयरन गोली डिलीवरी कठिन/बच्चा बड़ा\nआयरन मातृ-रक्तता और कम-वज़न रोकती — डर का ठीक उलटा। गोली से तकलीफ़ हो तो दूसरा लवण/समय पूछें।",
        when: "रिश्तेदारों को आत्मविश्वास से जवाब दें; असली स्वास्थ्य-निर्णय में डॉक्टर की बात ही जीते।",
      },
    },
    {
      slug: "quit-not-alone", category: "wellness", icon: "🍃",
      en: {
        title: "Quitting substances: you don't do it alone",
        summary: "Withdrawal is medicine's job, willpower is yours — split the work.",
        body:
          "## Why willpower fails\nAlcohol and sleeping-pill withdrawal can seize and kill — the brain has adapted physically. That is not moral failure, it is physiology. Tobacco is rarely dangerous to stop but is the hardest to stay off without support.\n\n## The safe order\n1. Talk to MNAM Quitline 1800-11-2356 (free) or a psychiatric clinic OPD.\n2. Alcohol/benzodiazepine dependence: medically supervised detox first, always.\n3. Then one counsellor who knows women's lives (shame, safety, family pressure) — women-only groups help most.\n4. Track daily in the Wellness Journal — a difficult day is data, not a verdict.\n\n## For a woman worrying about a family member\nNagging backfires; 'I am worried + here is one number + I will sit with you while you call' is the sentence that opens doors. And you deserve support too — Al-Anon-style family groups exist.",
        when: "Seizure, confusion, hallucination, no sleep 2+ days during cutting down → emergency now, call 112.",
      },
      hi: {
        title: "नशा छोड़ना: अकेले नहीं करना",
        summary: "डिटॉक्स दवा का काम, इच्छाशक्ति आपकी — काम बाँटें।",
        body:
          "## इच्छाशक्ति क्यों चूकती\nशराब व नींद-गोली के बिना मिर्गी-मौत हो सकती — मस्तिष्क शारीरिक रूप ढल चुका। यह नैतिक असफलता नहीं, शरीर-क्रिया है। तंबाकू छोड़ना कम खतरनाक पर सबसे कठिन बिना-साथ।\n\n## सुरक्षित क्रम\n1. MNAM क्विटलाइन 1800-11-2356 (मुफ़्त) या मानसिक-स्वास्थ्य OPD से बात।\n2. शराब/बेंजोडायज़ेपाइन-निर्भरता: पहले चिकित्सा-देखरेख डिटॉक्स, हमेशा।\n3. फिर एक काउंसलर जो महिला-जीवन जानें (शर्म, सुरक्षा, परिवार-दबाव) — महिला-मात्र समूह सबसे लाभ।\n4. रोज़ वेल्नेस जर्नल में दर्ज — कठिन दिन आँकड़ा हैं, फ़ैसला नहीं।\n\n## परिवार के किसी सदस्य की चिंता करती महिला\nटोकना पलटकर ख़िलाफ़ जवाब देता है; 'मैं चिंतित हूँ + एक नंबर + आप कॉल करें मैं साथ हूँ' द्वार खोलता। और आपका भी ख़याल ज़रूरी है — परिवार-सहयोग समूह भी मिलते हैं।",
        when: "काटते समय मिर्गी, भ्रम, माया दिखना, 2+ दिन नींद न आए → अभी आपातकाल, 112।",
      },
    },
    {
      slug: "digital-safety", category: "safety", icon: "📱",
      en: {
        title: "Digital safety basics for women",
        summary: "Stalking apps, morphed images, OTP fraud — quick shields.",
        body:
          "## Find hidden tracking\nCheck phone for 'family link/minder/Cerberus'-type apps you did not install; Play Store → installed apps review. Turn OFF unknown device-admin apps. Location sharing: Google Timeline → disable, then review 'shared with'.\n\n## If images are morphed or leaked\nTake screenshots WITH URL, then cybercrime portal 1930 or nearest cyber cell — platforms remove morphed content fast once a complaint number exists. You did nothing wrong; the crime is theirs.\n\n## OTP & 'verification' fraud\nNo bank/police ever ask your OTP or a video verification on WhatsApp links. Hang up, call the official number on the card back.\n\n## Shared-device hygiene\nPrivate window for sensitive browsing, notification previews off, log out of accounts on shared phones, unique passcode per app-lock.",
        when: "Someone threatens with images/morality, or you find a tracker you did not install → 112/1930 and a Women's Helpline 181 the same day.",
      },
      hi: {
        title: "महिलाओं के लिए डिजिटल-सुरक्षा बुनियाद",
        summary: "पीछा-ऐप, मॉर्फ़ छवि, OTP-ठगी — तुरंत कवच।",
        body:
          "## छिपा ट्रैकिंग खोजें\nफ़ोन में 'family link/minder/Cerberus' जैसे आपके-न-लगाए ऐप देखें; Store → इंस्टॉल्ड रीव्यू। अज्ञात device-admin बंद। लोकेशन-शेयरिंग: Timeline बंद, फिर 'shared with' पड़ताल।\n\n## मॉर्फ़/लीक छवि हो तो\nURL-सह screenshot, फिर cybercrime पोर्टल 1930 या नज़दीकी साइबर सेल — शिकायत-नंबर पर मंच हटाते हैं। आपने कुछ ग़लत नहीं; अपराध उनका।\n\n## OTP/सत्यापन ठगी\nकोई बैंक/पुलिस OTP या WhatsApp-लिंक वीडियो-सत्यापन नहीं माँगता। काटें, कार्ड-पिछले आधिकारिक नंबर।\n\n## साझा-फ़ोन\nसंवेदनशील ब्राउज़िंग InPrivate, नोटिफ़-पूर्व्यू बंद, साझा पर लॉगआउट, ऐप-लॉक अलग कोड।",
        when: "छवि/अश्लील धमकी, या आपके-न-लगाया ट्रैकर मिले → उसी दिन 112/1930 और 181।",
      },
    },
  ];

  for (const a of articles) {
    const created = await prisma.article.create({
      data: { slug: a.slug, category: a.category, icon: a.icon },
    });
    await prisma.articleTranslation.create({
      data: { articleId: created.id, lang: "en", title: a.en.title, summary: a.en.summary, body: a.en.body, whenToSeek: a.en.when },
    });
    await prisma.articleTranslation.create({
      data: { articleId: created.id, lang: "hi", title: a.hi.title, summary: a.hi.summary, body: a.hi.body, whenToSeek: a.hi.when },
    });
  }

  // ---------- RECOVERY STORIES (illustrative, no real testimonies) ----------
  const stories = [
    {
      title: "The first 15 minutes",
      pseudonym: "A., 34",
      content:
        "Illustrative story (not a real person): A. kept smoking 'just one' every stressful evening until she noticed the wave theory — cravings peaked around 10 minutes and fell. She started washing the day's dishes whenever the wave rose. Day 21 she slipped once and felt the journal 🪨 entry gave her more information than her guilt. Two months later the difficult days were the exception.",
    },
    {
      title: "My mother found the Quitline",
      pseudonym: "S., 41",
      content:
        "Illustrative story (not a real person): S.'s husband drank nightly and arguments had become routine. Instead of nagging, his wife called MNAM 1800-11-2356 herself, sat with him during the first call, and they visited the district psychiatric OPD together. Detox needed medicines first — the doctor said so, and the doctor was right. He is in month 4 with a weekly counsellor.",
    },
    {
      title: "Painkiller to programme",
      pseudonym: "R., 28",
      content:
        "Illustrative story (not a real person): After a fracture, R.'s painkillers quietly became daily. Recognising it at 28 felt like shame; the women-only group at a rehab centre turned it into a schedule — taper with medicines, then Tuesday/Thursday sessions. Her journal calendar currently reads 68 🍃.",
    },
  ];
  for (const s of stories) {
    const exists = await prisma.recoveryStory.findFirst({ where: { title: s.title } });
    if (!exists) {
      await prisma.recoveryStory.create({
        data: { ...s, consentOnFile: false, isIllustrative: true },
      });
    }
  }

  console.log(`Seeded: ${facilities.length} sample facilities, ${helplines.length} helplines, ${articles.length} articles (en+hi), ${stories.length} illustrative stories.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
