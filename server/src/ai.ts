import { GoogleGenAI } from "@google/genai";
import { ParentInquiry, SchoolRequest, TeacherRegistration, Vacancy, SystemSettings } from "./models.js";

const hasRealGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key !== "MOCK_KEY");
};

// Generates strategic operational telemetry reports for Super Admin
export const generateAdminReport = async () => {
  const [parents, teachers, schools, settings] = await Promise.all([
    ParentInquiry.find().sort({ createdAt: -1 }).lean(),
    TeacherRegistration.find().sort({ createdAt: -1 }).lean(),
    SchoolRequest.find().sort({ createdAt: -1 }).lean(),
    SystemSettings.findOne(),
  ]);

  const fee = settings?.registrationFee ?? 149;

  const summaryData = {
    totalParents: parents.length,
    totalTeachers: teachers.length,
    totalSchools: schools.length,
    approvedTeachers: teachers.filter(t => t.isApproved).length,
    paidTeachers: teachers.filter(t => t.paymentStatus === "Paid" || t.paymentStatus === "Verified").length,
    cities: Array.from(new Set([...parents.map(p => p.city), ...teachers.map(t => t.city)])),
  };

  if (!hasRealGeminiKey()) {
    return `# RTA Analytics Dashboard (Simulated)
- **Talent Pool**: ${summaryData.totalTeachers} registered tutors, with ${summaryData.approvedTeachers} verified members.
- **Client Base**: ${summaryData.totalParents} parent inquiries mapped across ${summaryData.cities.length} cities.
- **Financial Status**: ${summaryData.paidTeachers} tutors have completed their ₹${fee} verification fee checkout.
- **Strategic Recommendation**: Increase sourcing of Mathematics and Science experts in ${summaryData.cities[0] || 'active zones'} to fulfill pending trial demo requests.`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Perform an executive study of Raft Tutor Axis data stats and output a professional operational roadmap in markdown format:
Live Telemetry: ${JSON.stringify(summaryData, null, 2)}
Suggest growth ideas for teacher onboarding, payment conversions, and regional expansions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Chief AI Strategy Officer at Raft Tutor Axis."
      }
    });
    return response.text || "Failed to generate AI executive analytics report.";
  } catch (error) {
    console.error("Gemini report error:", error);
    return "Error querying Gemini API model.";
  }
};

// AI Matchmaker for assigning tutors to parent inquiries
export const matchTutorsForParent = async (parentInquiryId: string) => {
  const parent = await ParentInquiry.findById(parentInquiryId).lean();
  if (!parent) throw new Error("Parent inquiry not found");

  // Fetch approved, verified teachers comfort with same mode/city
  const teachers = await TeacherRegistration.find({
    city: { $regex: new RegExp(parent.city, "i") },
    isApproved: true
  }).lean();

  if (teachers.length === 0) {
    return { matches: [], insight: "No approved tutors currently active in the client's city. Sourcing required." };
  }

  if (!hasRealGeminiKey()) {
    // Basic local matching heuristics fallback
    const scores = teachers.map(t => {
      let score = 0;
      // Match subjects keyword overlap
      const pSub = parent.subjects.toLowerCase();
      const tSub = t.subjects.toLowerCase();
      if (tSub.split(",").some(s => pSub.includes(s.trim()))) score += 40;
      // Match mode
      if (t.mode === "Both" || t.mode === parent.mode) score += 30;
      // Experience weighting
      const expNum = parseInt(t.experience) || 0;
      score += Math.min(expNum * 3, 30);

      return { tutor: t, score };
    }).sort((a, b) => b.score - a.score);

    return {
      matches: scores.slice(0, 3).map(s => ({
        id: s.tutor._id.toString(),
        name: s.tutor.name,
        score: s.score,
        experience: s.tutor.experience,
        qualification: s.tutor.qualification,
        phone: s.tutor.mobile,
      })),
      insight: "Matched based on local subject keyword relevance and mode constraints."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contextData = {
    parent: { subjects: parent.subjects, city: parent.city, mode: parent.mode, class: parent.studentClass },
    candidates: teachers.map(t => ({ id: t._id, name: t.name, subjects: t.subjects, mode: t.mode, exp: t.experience, qual: t.qualification }))
  };

  const prompt = `Given this parent tutoring request, rank the top 3 best matching tutor candidates from the database:
${JSON.stringify(contextData, null, 2)}
Return the list in structured JSON with candidate IDs, a match percentage score, and a one-sentence rationale for the recommendation. Do not output markdown codeblocks around the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Matchmaker failed, returning fallback:", error);
    return { matches: [], insight: "AI matchmaker failed, please match manually." };
  }
};

// AI Insights for Parents: Tips, roadmap based on subjects & class
export const generateParentInsights = async (parentInquiryId: string) => {
  const parent = await ParentInquiry.findById(parentInquiryId).lean();
  if (!parent) return "Parent inquiry record not found.";

  if (!hasRealGeminiKey()) {
    return `### Personalized Roadmap for Student (${parent.studentClass} - ${parent.board})
- **Subjects**: ${parent.subjects}
- **Recommended Schedule**: Allocate 1.5 hours daily for personalized coaching practice.
- **Focus Area**: Concentrate on key problem-solving concepts from the CBSE/ICSE board curriculum.
- **Auditing**: Review performance indicators at the end of the 2-day free trial demo.`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Generate a short educational guidance plan for a parent of a student in ${parent.studentClass} (${parent.board}) who needs tutoring in ${parent.subjects}. Highlight study strategies and milestones.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "Unable to compile guidance insights at this time.";
  } catch {
    return "Error compiling parent insights.";
  }
};

// AI Sourcing Insights for School Recruiter vacancies
export const generateSchoolHiringInsights = async (vacancyId: string) => {
  const vacancy = await Vacancy.findById(vacancyId).lean();
  if (!vacancy) return "Vacancy details not found.";

  if (!hasRealGeminiKey()) {
    return `### Recruitment Forecast: ${vacancy.title} (${vacancy.subject})
- **Board Target**: CBSE / ICSE requirements alignment.
- **Sourcing Strategy**: Tap into high-density local private coaching circles.
- **Salary Guidance**: Current local average for similar qualifications is ₹15,000 - ₹25,000/month.
- **Vetting Insight**: Ensure candidates have solid pedagogic demo round evaluations.`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Provide a concise hiring strategy report for a school vacancy details:
Title: ${vacancy.title}, Subject: ${vacancy.subject}, Board: ${vacancy.board}, City: ${vacancy.city}, Qualification: ${vacancy.qualification}.
Mention candidate expectations, salary benchmark recommendations, and sourcing tips.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "Failed to generate recruitment insights.";
  } catch {
    return "Recruitment insight module errored.";
  }
};

// Dynamic chatbot response matching platform parameters
export const chatAssistantResponse = async (message: string, chatHistory: any[]) => {
  const [parents, teachers, schools, settings] = await Promise.all([
    ParentInquiry.countDocuments(),
    TeacherRegistration.countDocuments({ isApproved: true }),
    SchoolRequest.countDocuments(),
    SystemSettings.findOne()
  ]);

  const fee = settings?.registrationFee ?? 149;

  const platformOverview = `Raft Tutor Axis has ${teachers} approved verified tutors across India, serving ${parents} families and ${schools} partner institutions. Registration fee for teachers is ₹${fee}. We offer a 2-day free demo class for parents.`;

  if (!hasRealGeminiKey()) {
    const msg = message.toLowerCase();
    if (msg.includes("fee") || msg.includes("charge") || msg.includes("price")) {
      return `Tutor registration is a one-time verification fee of ₹${fee}. For Parents, we offer 2 Days of completely Free trial demo classes, with no placement surcharges.`;
    }
    if (msg.includes("tutor") || msg.includes("teacher") || msg.includes("find")) {
      return `We can definitely map a certified tutor for your child! We currently have over ${teachers} active verified educators covering CBSE, ICSE, and State Boards. Register via our "Find Tutor" tab to book your free demo class.`;
    }
    return `Welcome to Raft Tutor Axis support desk! ${platformOverview} How can I help you register or find a tutor today?`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are the helpful live chat agent on the Raft Tutor Axis portal. Answer the user's question concisely.
Platform stats: ${platformOverview}
User question: "${message}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "Welcome to support! Please leave your number, and we will get back to you shortly.";
  } catch {
    return "Thank you for contacting Raft Tutor Axis! Our operations desk will get back to you.";
  }
};
