export type RtlLanguage = "ar" | "he"

interface RtlTranslation {
  ar: string
  he: string
}

const rtlTranslations: Record<string, RtlTranslation> = {
  "Payment Method": { ar: "طريقة الدفع", he: "אמצעי תשלום" },
  "All transactions are secure and encrypted": { ar: "جميع المعاملات آمنة ومشفرة", he: "כל העסקאות מאובטחות ומוצפנות" },
  "Name on Card": { ar: "الاسم على البطاقة", he: "שם על הכרטיס" },
  "John Doe": { ar: "أحمد محمد", he: "ישראל ישראלי" },
  "Card Number": { ar: "رقم البطاقة", he: "מספר כרטיס" },
  "Enter your 16-digit number.": { ar: "أدخل رقمك المكون من 16 رقمًا.", he: "הזן את המספר בן 16 הספרות שלך." },
  CVV: { ar: "رمز الأمان", he: "קוד אבטחה" },
  Month: { ar: "الشهر", he: "חודש" },
  Year: { ar: "السنة", he: "שנה" },
  "Billing Address": { ar: "عنوان الفواتير", he: "כתובת לחיוב" },
  "The billing address associated with your payment method": { ar: "عنوان الفواتير المرتبط بطريقة الدفع الخاصة بك", he: "כתובת החיוב המשויכת לאמצעי התשלום שלך" },
  "Same as shipping address": { ar: "نفس عنوان الشحن", he: "זהה לכתובת המשלוח" },
  Comments: { ar: "تعليقات", he: "הערות" },
  "Add any additional comments": { ar: "أضف أي تعليقات إضافية", he: "הוסף הערות נוספות" },
  Submit: { ar: "إرسال", he: "שלח" },
  Cancel: { ar: "إلغاء", he: "ביטול" },
  "No Team Members": { ar: "لا يوجد أعضاء في الفريق", he: "אין חברי צוות" },
  "Invite your team to collaborate on this project.": { ar: "قم بدعوة فريقك للتعاون في هذا المشروع.", he: "הזמן את הצוות שלך לשתף פעולה בפרויקט זה." },
  "Invite Members": { ar: "دعوة أعضاء", he: "הזמן חברים" },
  Syncing: { ar: "جارٍ المزامنة", he: "מסנכרן" },
  Updating: { ar: "جارٍ التحديث", he: "מעדכן" },
  Loading: { ar: "جارٍ التحميل", he: "טוען" },
  Add: { ar: "إضافة", he: "הוסף" },
  "Send a message...": { ar: "أرسل رسالة...", he: "שלח הודעה..." },
  "Record and send audio...": { ar: "سجل وأرسل صوتًا...", he: "הקלט ושלח אודיו..." },
  "Voice Mode": { ar: "الوضع الصوتي", he: "מצב קולי" },
  "Price Range": { ar: "نطاق السعر", he: "טווח מחירים" },
  "Set your budget range ($": { ar: "حدد نطاق ميزانيتك (﷼", he: "הגדר את טווח התקציב שלך (₪" },
  "Minimum price": { ar: "نطاق السعر", he: "טווח מחירים" },
  "Maximum price": { ar: "نطاق السعر", he: "טווח מחירים" },
  "Search...": { ar: "بحث...", he: "חיפוש..." },
  "12 results": { ar: "12 نتيجة", he: "12 תוצאות" },
  "This is content in a tooltip.": { ar: "هذا محتوى في تلميح.", he: "זה תוכן בטולטיפ." },
  "Ask, Search or Chat...": { ar: "اسأل، ابحث أو تحدث...", he: "שאל, חפש או שוחח..." },
  Auto: { ar: "تلقائي", he: "אוטומטי" },
  Agent: { ar: "وكيل", he: "סוכן" },
  Manual: { ar: "يدوي", he: "ידני" },
  "52% used": { ar: "52% مستخدم", he: "52% בשימוש" },
  Send: { ar: "إرسال", he: "שלח" },
  Info: { ar: "معلومات", he: "מידע" },
  "Input Secure": { ar: "السعر", he: "מחיר" },
  "Your connection is not secure.": { ar: "أدخل السعر بالريال السعودي.", he: "הזן את המחיר בשקלים." },
  "You should not enter any sensitive information on this site.": { ar: "سيتم تحويل السعر تلقائياً.", he: "המחיר יומר אוטומטית." },
  Favorite: { ar: "مفضل", he: "מועדף" },
  "https://": { ar: "ر.س", he: "₪" },
  "Two-factor authentication": { ar: "المصادقة الثنائية", he: "אימות דו-שלבי" },
  "Verify via email or phone number.": { ar: "التحقق عبر البريد الإلكتروني أو رقم الهاتف.", he: "אמת באמצעות אימייל או מספר טלפון." },
  Enable: { ar: "تفعيل", he: "הפעל" },
  "Your profile has been verified.": { ar: "تم التحقق من ملفك الشخصي.", he: "הפרופיל שלך אומת." },
  "Appearance Settings": { ar: "إعدادات المظهر", he: "הגדרות מראה" },
  "Compute Environment": { ar: "بيئة الحوسبة", he: "סביבת מחשוב" },
  "Select the compute environment for your cluster.": { ar: "اختر بيئة الحوسبة لمجموعتك.", he: "בחר את סביבת המחשוב לאשכול שלך." },
  Kubernetes: { ar: "كوبرنيتس", he: "קוברנטיס" },
  "Run GPU workloads on a K8s configured cluster. This is the default.": { ar: "تشغيل أحمال عمل GPU على مجموعة مُهيأة بـ K8s. هذا هو الافتراضي.", he: "הפעל עומסי עבודה של GPU באשכול מוגדר K8s. זו ברירת המחדל." },
  "Virtual Machine": { ar: "جهاز افتراضي", he: "מכונה וירטואלית" },
  "Access a VM configured cluster to run workloads. (Coming soon)": { ar: "الوصول إلى مجموعة VM مُهيأة لتشغيل أحمال العمل. (قريبًا)", he: "גש לאשכול VM מוגדר להפעלת עומסי העבודה. (בקרוב)" },
  "Number of GPUs": { ar: "عدد وحدات GPU", he: "מספר GPUs" },
  "You can add more later.": { ar: "يمكنك إضافة المزيد لاحقًا.", he: "תוכל להוסיף עוד מאוחר יותר." },
  Decrement: { ar: "إنقاص", he: "הפחת" },
  Increment: { ar: "زيادة", he: "הגדל" },
  "Wallpaper Tinting": { ar: "تلوين الخلفية", he: "צביעת טפט" },
  "Allow the wallpaper to be tinted.": { ar: "السماح بتلوين الخلفية.", he: "אפשר לטפט להיצבע." },
  Prompt: { ar: "الأمر", he: "פקודה" },
  "Ask, search, or make anything...": { ar: "اسأل، ابحث، أو أنشئ أي شيء...", he: "שאל, חפש, או צור משהו..." },
  "Add context": { ar: "أضف سياق", he: "הוסף הקשר" },
  "Mention a person, page, or date": { ar: "اذكر شخصًا أو صفحة أو تاريخًا", he: "הזכר אדם, עמוד או תאריך" },
  "Search pages...": { ar: "البحث في الصفحات...", he: "חפש עמודים..." },
  "Search pages": { ar: "البحث في الصفحات...", he: "חפש עמודים..." },
  "No pages found": { ar: "لم يتم العثور على صفحات", he: "לא נמצאו עמודים" },
  Pages: { ar: "الصفحات", he: "עמודים" },
  Users: { ar: "المستخدمون", he: "משתמשים" },
  "Attach file": { ar: "إرفاق ملف", he: "צרף קובץ" },
  "Select AI model": { ar: "اختر نموذج الذكاء الاصطناعي", he: "בחר מודל AI" },
  "Select Agent Mode": { ar: "اختر وضع الوكيل", he: "בחר מצב סוכן" },
  "Agent Mode": { ar: "وضع الوكيل", he: "מצב סוכן" },
  "Plan Mode": { ar: "وضع التخطيط", he: "מצב תכנון" },
  Beta: { ar: "تجريبي", he: "בטא" },
  "All Sources": { ar: "جميع المصادر", he: "כל המקורות" },
  "Web Search": { ar: "البحث على الويب", he: "חיפוש באינטרנט" },
  "Apps and Integrations": { ar: "التطبيقات والتكاملات", he: "אפליקציות ואינטגרציות" },
  "All Sources I can access": { ar: "جميع المصادر التي يمكنني الوصول إليها", he: "כל המקורות שיש לי גישה אליהם" },
  "Find or use knowledge in...": { ar: "ابحث أو استخدم المعرفة في...", he: "מצא או השתמש בידע ב..." },
  "Find knowledge": { ar: "ابحث أو استخدم المعرفة في...", he: "מצא או השתמש בידע ב..." },
  "No knowledge found": { ar: "لم يتم العثور على معرفة", he: "לא נמצא ידע" },
  Workspace: { ar: "مساحة العمل", he: "סביבת עבודה" },
  "- Workspace": { ar: "- مساحة العمل", he: "- סביבת עבודה" },
  "Help Center": { ar: "مركز المساعدة", he: "מרכז עזרה" },
  "Connect Apps": { ar: "ربط التطبيقات", he: "חבר אפליקציות" },
  "We'll only search in the sources selected here.": { ar: "سنبحث فقط في المصادر المحددة هنا.", he: "נחפש רק במקורות שנבחרו כאן." },
  "Meeting Notes": { ar: "ملاحظات الاجتماع", he: "הערות פגישה" },
  "Project Dashboard": { ar: "لوحة المشروع", he: "לוח מחוונים לפרויקט" },
  "Ideas & Brainstorming": { ar: "أفكار وعصف ذهني", he: "רעיונות וסיעור מוחות" },
  "Calendar & Events": { ar: "التقويم والأحداث", he: "יומן ואירועים" },
  Documentation: { ar: "التوثيق", he: "תיעוד" },
  "Goals & Objectives": { ar: "الأهداف والغايات", he: "מטרות ויעדים" },
  "Budget Planning": { ar: "تخطيط الميزانية", he: "תכנון תקציב" },
  "Team Directory": { ar: "دليل الفريق", he: "ספריית צוות" },
  "Technical Specs": { ar: "المواصفات التقنية", he: "מפרט טכני" },
  "Analytics Report": { ar: "تقرير التحليلات", he: "דוח אנליטיקה" },
  "Go Back": { ar: "رجوع", he: "חזור" },
  Archive: { ar: "أرشفة", he: "ארכיון" },
  Report: { ar: "إبلاغ", he: "דווח" },
  Snooze: { ar: "تأجيل", he: "נודניק" },
  "More Options": { ar: "خيارات أخرى", he: "אפשרויות נוספות" },
  "Mark as Read": { ar: "تحديد كمقروء", he: "סמן כנקרא" },
  "Add to Calendar": { ar: "إضافة إلى التقويم", he: "הוסף ליומן" },
  "Add to List": { ar: "إضافة إلى القائمة", he: "הוסף לרשימה" },
  "Label As...": { ar: "تصنيف كـ...", he: "תייג כ..." },
  Personal: { ar: "شخصي", he: "אישי" },
  Work: { ar: "عمل", he: "עבודה" },
  Other: { ar: "أخرى", he: "אחר" },
  Trash: { ar: "حذف", he: "מחק" },
  Previous: { ar: "السابق", he: "הקודם" },
  Next: { ar: "التالي", he: "הבא" },
  Copilot: { ar: "المساعد", he: "עוזר" },
  "Open Popover": { ar: "فتح القائمة", he: "פתח תפריט" },
  "Agent Tasks": { ar: "مهام الوكيل", he: "משימות סוכן" },
  "Agent task": { ar: "مهام الوكيل", he: "משימות סוכן" },
  "Describe your task in natural language.": { ar: "صف مهمتك بلغة طبيعية.", he: "תאר את המשימה שלך בשפה טבעית." },
  "Start a new task with Copilot": { ar: "ابدأ مهمة جديدة مع المساعد", he: "התחל משימה חדשה עם העוזר" },
  "Describe your task in natural language. Copilot will work in the background and open a pull request for your review.": { ar: "صف مهمتك بلغة طبيعية. سيعمل المساعد في الخلفية ويفتح طلب سحب لمراجعتك.", he: "תאר את המשימה שלך בשפה טבעית. העוזר יעבוד ברקע ויפתח בקשת משיכה לבדיקתך." },
  "I agree to the terms and conditions": { ar: "أوافق على الشروط والأحكام", he: "אני מסכים לתנאים וההגבלות" },
  "How did you hear about us?": { ar: "كيف سمعت عنا؟", he: "איך שמעת עלינו?" },
  "Select the option that best describes how you heard about us.": { ar: "اختر الخيار الذي يصف أفضل طريقة سمعت عنا من خلالها.", he: "בחר את האפשרות שמתארת בצורה הטובה ביותר כיצד שמעת עלינו." },
  "Social Media": { ar: "التواصل الاجتماعي", he: "חברתיות" },
  "Search Engine": { ar: "البحث", he: "חיפוש" },
  Referral: { ar: "إحالة", he: "הפניה" },
  "Processing your request": { ar: "جارٍ معالجة طلبك", he: "מעבד את הבקשה שלך" },
  "Please wait while we process your request. Do not refresh the page.": { ar: "يرجى الانتظار بينما نعالج طلبك. لا تقم بتحديث الصفحة.", he: "אנא המתן בזמן שאנו מעבדים את בקשתך. אל תרענן את הדף." },
  "1": { ar: "١", he: "1" },
  "2": { ar: "٢", he: "2" },
  "3": { ar: "٣", he: "3" },
  "200": { ar: "٢٠٠", he: "200" },
  "800": { ar: "٨٠٠", he: "800" },
}

const reverseTranslations = new Map<string, RtlTranslation>()
for (const [english, translation] of Object.entries(rtlTranslations)) {
  reverseTranslations.set(english, translation)
  reverseTranslations.set(translation.ar, translation)
  reverseTranslations.set(translation.he, translation)
}

function translateValue(value: string, language: RtlLanguage): string {
  const translation = reverseTranslations.get(value)
  return translation?.[language] ?? value
}

export function localizeRtlGallery(root: HTMLElement, language: RtlLanguage): void {
  root.dataset.lang = language
  root.lang = language

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const raw = node.nodeValue ?? ""
    const trimmed = raw.trim()
    if (trimmed) {
      const translated = translateValue(trimmed, language)
      if (translated !== trimmed) {
        const leading = raw.slice(0, raw.indexOf(trimmed))
        const trailing = raw.slice(raw.indexOf(trimmed) + trimmed.length)
        node.nodeValue = `${leading}${translated}${trailing}`
      }
    }
    node = walker.nextNode()
  }

  const translatedAttributes = [
    "aria-label",
    "data-mention-title",
    "data-menu-value",
    "data-tooltip",
    "placeholder",
    "title",
  ]
  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    translatedAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (value) {
        element.setAttribute(attribute, translateValue(value, language))
      }
    })
  })
}
