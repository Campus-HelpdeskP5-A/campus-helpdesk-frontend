// بانر تحذيري "غير مانع" — بيظهر بس مش بيمنع اليوزر إنه يكمل يكتب أو يسجل التذكرة عادي
export default function EmergencyBanner() {
  return (
    <div
      role="alert"
      style={{
        border: '2px solid var(--danger)',
        background: 'rgba(220, 38, 38, 0.08)',
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>
        ⚠️ ده وصف بيدل على حالة طارئة محتملة
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)' }}>
        نظام التذاكر ده مش خدمة استجابة طوارئ ومش بيوصل حد فورًا. لو في خطر حقيقي على حياة أو سلامة حد،
        اتصل فورًا بالجهات الرسمية قبل ما تكمل تسجيل التذكرة:
      </div>
      <ul style={{ margin: '8px 0 0', paddingInlineStart: 20, fontSize: 13, fontWeight: 600 }}>
        <li>الإسعاف: 123</li>
        <li>المطافئ: 180</li>
        <li>الشرطة: 122</li>
        <li>أمن الحرم الجامعي: (حط هنا رقم أمن الجامعة الرسمي)</li>
      </ul>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        تقدر تكمل تسجيل التذكرة، لكن التسجيل هنا مش بديل عن الاتصال بالطوارئ.
      </div>
    </div>
  )
}