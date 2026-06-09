import { GoogleGenAI } from "@google/genai";
import { ParentInquiry, SchoolRequest, TeacherRegistration } from "./models.js";

const hasRealGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key !== "MOCK_KEY");
};

export const getFallbackReport = () => `# RTA Executive Analytics Report (Simulated)

## 1. Student Demands Analysis
- **Core Market Focus**: Home Tuition requests are dominated by local city-level demand.
- **Top Academic Requirements**: Higher secondary grades looking for Mathematics, Physics, Chemistry, and Science tutors.
- **Board Distribution**: Track CBSE, ICSE, and State Board demand to guide local teacher sourcing.

## 2. Tutor Vetting & Talent Pool
- **Teacher Density**: New applicants should be prioritized by city, subjects, and verification status.
- **Specializations**: Strong matches come from qualified science, mathematics, and computer educators.
- **Approval Status**: Keep verification active before assigning teachers to families or institutions.

## 3. Alerts & Data Anomalies
- No severe system alerts in simulated mode.
- **Preemptive Recommendation**: Validate phone numbers and city fields before operational follow-up.

## 4. Strategic Operations Counsel
- **Free Trial Conversions**: Promote the 2 Days Free Demo prominently in parent outreach.
- **Institute Linkups**: Build partnerships with schools and coaching institutes in active cities.`;

export const generateAdminReport = async () => {
  const [parents, teachers, schools] = await Promise.all([
    ParentInquiry.find().sort({ createdAt: -1 }).lean(),
    TeacherRegistration.find().sort({ createdAt: -1 }).lean(),
    SchoolRequest.find().sort({ createdAt: -1 }).lean(),
  ]);

  if (!hasRealGeminiKey()) {
    return getFallbackReport();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const dataSummary = {
    parentCount: parents.length,
    teacherCount: teachers.length,
    schoolInquiryCount: schools.length,
    parentsSample: parents.map((p) => ({
      city: p.city,
      class: p.studentClass,
      board: p.board,
      subjects: p.subjects,
    })),
    teachersSample: teachers.map((t) => ({
      city: t.city,
      qualification: t.qualification,
      experience: t.experience,
      subjects: t.subjects,
      isApproved: t.isApproved,
    })),
    schoolsSample: schools.map((s) => ({ location: s.location, details: s.details })),
  };

  const prompt = `Analyze this live registration data for Raft Tutor Axis and compile a strategic administrative report in markdown:
${JSON.stringify(dataSummary, null, 2)}

Cover student demand, teacher readiness, suspicious data patterns, and operational growth recommendations. Keep the tone concise and executive.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an Elite Business Analyst and Education Consultant assisting the founders of Raft Tutor Axis.",
    },
  });

  return response.text || getFallbackReport();
};
