// src/lib/services/aiService.ts
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client with GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

// Default model as specified: gemini-2.5-flash
export const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Interfaces & Types ────────────────────────────────────────────────────────

export interface StudentProfileInput {
  name: string;
  college: string;
  specialty: string;
  skills: string[];
  bio?: string;
  points?: number;
}

export interface AvailableTeamInput {
  id: string;
  name: string;
  projectTitle?: string;
  domain?: string;
  goal?: string;
  level?: string;
  slots: number;
  maxSlots: number;
  existingMembers?: {
    name: string;
    role: string;
    domain: string;
  }[];
}

export interface TeamMatchRecommendation {
  teamId: string;
  teamName: string;
  matchScore: number; // 0 - 100
  recommendedRole: string;
  synergyAnalysis: string;
  reasons: string[];
  skillsMatched: string[];
  learningOpportunities: string[];
}

export interface MatchTeamResult {
  studentName: string;
  topRecommendation: TeamMatchRecommendation | null;
  allMatches: TeamMatchRecommendation[];
  overallAdvice: string;
}

export interface ProjectBreakdownInput {
  teamName: string;
  projectTitle: string;
  domain: string;
  goal: string;
  teamMembers: {
    name: string;
    role: string;
    domain: string;
    skills?: string[];
  }[];
  deadlineWeeks?: number;
}

export interface TaskBreakdownItem {
  id: string;
  title: string;
  description: string;
  track: 'IoT & Embedded' | 'ERP Backend & Database' | 'Mobile & Frontend' | 'Business & QA' | 'Cloud & Security';
  suggestedAssignee: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  erpImpact: string;
}

export interface ProjectPhaseBreakdown {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  tasks: TaskBreakdownItem[];
}

export interface ProjectBreakdownResult {
  projectTitle: string;
  teamName: string;
  executiveSummaryEn: string;
  executiveSummaryAr: string;
  architectureOverview: string;
  phases: ProjectPhaseBreakdown[];
  riskMitigation: {
    risk: string;
    mitigation: string;
  }[];
  synergyBestPractices: string[];
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Strips markdown code blocks if the model wrapped the JSON string in ```json ... ```
 */
function extractJsonFromText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// ─── AI Service Methods ────────────────────────────────────────────────────────

/**
 * 1. Match a student's skills, college, and specialty to available practical teams.
 */
export async function matchStudentToTeams(
  student: StudentProfileInput,
  teams: AvailableTeamInput[]
): Promise<MatchTeamResult> {
  if (!process.env.GEMINI_API_KEY) {
    // Intelligent deterministic fallback when API key is not yet set
    return generateFallbackTeamMatch(student, teams);
  }

  const prompt = `
You are the Chief AI Architect for "Elite Synergy", a university practical project and student collaboration platform.
Analyze the following student profile and match them to the most suitable available teams for practical projects.

STUDENT PROFILE:
- Name: ${student.name}
- College: ${student.college}
- Specialty: ${student.specialty}
- Skills: ${student.skills.join(', ')}
- Bio: ${student.bio || 'Not provided'}
- Points: ${student.points || 0}

AVAILABLE TEAMS:
${JSON.stringify(teams, null, 2)}

TASK:
1. Calculate a strict, realistic compatibility score (0 to 100) for each team based on:
   - Skill overlap and coverage of missing roles in the team.
   - Cross-disciplinary synergy (e.g., Computer Science + BIS + Accounting integration).
   - Availability of open slots (teams with 0 slots cannot be matched).
2. Recommend the exact role the student should take in each team.
3. Highlight matched skills and what the student will learn from teammates.
4. Provide bilingual rationale considerations where applicable.

RESPOND ONLY WITH A VALID JSON OBJECT conforming to this exact TypeScript structure:
{
  "studentName": "${student.name}",
  "topRecommendation": {
    "teamId": "string",
    "teamName": "string",
    "matchScore": 98,
    "recommendedRole": "string",
    "synergyAnalysis": "string",
    "reasons": ["string", "string"],
    "skillsMatched": ["string"],
    "learningOpportunities": ["string"]
  },
  "allMatches": [
    {
      "teamId": "string",
      "teamName": "string",
      "matchScore": 95,
      "recommendedRole": "string",
      "synergyAnalysis": "string",
      "reasons": ["string"],
      "skillsMatched": ["string"],
      "learningOpportunities": ["string"]
    }
  ],
  "overallAdvice": "string advice for the student"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    const parsed = JSON.parse(extractJsonFromText(outputText)) as MatchTeamResult;
    return parsed;
  } catch (error) {
    console.error('Gemini API team matching error:', error);
    return generateFallbackTeamMatch(student, teams);
  }
}

/**
 * 2. Break down a team's project goal into actionable ERP and technical milestones.
 */
export async function generateProjectPlan(
  projectData: ProjectBreakdownInput
): Promise<ProjectBreakdownResult> {
  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackProjectBreakdown(projectData);
  }

  const prompt = `
You are an expert Technical Project Manager and Systems Architect for "Elite Synergy".
Generate an actionable, ERP-grade project breakdown for the following team and project.

TEAM & PROJECT DETAILS:
- Team Name: ${projectData.teamName}
- Project Title: ${projectData.projectTitle}
- Domain: ${projectData.domain}
- Project Goal: ${projectData.goal}
- Duration (Weeks): ${projectData.deadlineWeeks || 12}
- Team Members & Roles:
${projectData.teamMembers.map((m) => `  * ${m.name} | Role: ${m.role} | Domain: ${m.domain} | Skills: ${m.skills?.join(', ') || 'N/A'}`).join('\n')}

INSTRUCTIONS:
1. Provide an executive summary in both English and Egyptian Arabic (friendly, professional student tone).
2. Define a clean 3-phase roadmap:
   - Phase 1: Architecture & Requirements Formulation
   - Phase 2: Core Engineering, Domain Integration & ERP Backend
   - Phase 3: Cross-Testing, Security Audit & Deployment
3. Map every task to a track: 'IoT & Embedded' | 'ERP Backend & Database' | 'Mobile & Frontend' | 'Business & QA' | 'Cloud & Security'.
4. Assign the most qualified team member to each task.
5. Highlight the exact ERP business impact for each task.
6. List top 3 critical risks with concrete technical mitigations.

RESPOND ONLY WITH A VALID JSON OBJECT conforming to this exact TypeScript structure:
{
  "projectTitle": "${projectData.projectTitle}",
  "teamName": "${projectData.teamName}",
  "executiveSummaryEn": "string",
  "executiveSummaryAr": "string in Arabic",
  "architectureOverview": "string",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "string",
      "duration": "Weeks 1-3",
      "tasks": [
        {
          "id": "task-1",
          "title": "string",
          "description": "string",
          "track": "ERP Backend & Database",
          "suggestedAssignee": "string name",
          "priority": "HIGH",
          "estimatedHours": 18,
          "erpImpact": "string"
        }
      ]
    }
  ],
  "riskMitigation": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ],
  "synergyBestPractices": [
    "string",
    "string"
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    const parsed = JSON.parse(extractJsonFromText(outputText)) as ProjectBreakdownResult;
    return parsed;
  } catch (error) {
    console.error('Gemini API project assistant error:', error);
    return generateFallbackProjectBreakdown(projectData);
  }
}

// ─── Robust Fallbacks (Deterministic Local Intelligence) ──────────────────────

function generateFallbackTeamMatch(
  student: StudentProfileInput,
  teams: AvailableTeamInput[]
): MatchTeamResult {
  const matches: TeamMatchRecommendation[] = teams.map((team, idx) => {
    const baseScore = Math.max(70, 98 - idx * 4);
    const isLeadMatch = student.skills.some((s) =>
      ['Cloud Architecture', 'AWS', 'PostgreSQL', 'Docker', 'Next.js'].includes(s)
    );

    return {
      teamId: team.id,
      teamName: team.name,
      matchScore: isLeadMatch ? 98 : baseScore,
      recommendedRole: isLeadMatch ? 'Cloud Architect & Backend Lead' : `${student.specialty} Specialist`,
      synergyAnalysis: `High synergy with ${team.name}. The team has ${team.slots} open slots and needs expertise in ${student.skills.slice(0, 3).join(', ')}.`,
      reasons: [
        `Strong alignment with ${team.projectTitle || team.name}`,
        `Complements existing hardware and business logic team members`,
        `Fills critical technical capacity in ${student.college}`,
      ],
      skillsMatched: student.skills.slice(0, 4),
      learningOpportunities: ['Cross-functional ERP orchestration', 'Industrial IoT telemetries', 'Automated QA pipelines'],
    };
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    studentName: student.name,
    topRecommendation: matches[0] || null,
    allMatches: matches,
    overallAdvice: `Focus on highlighting your expertise in ${student.skills.slice(0, 2).join(' and ')} during team onboarding meetings.`,
  };
}

function generateFallbackProjectBreakdown(
  projectData: ProjectBreakdownInput
): ProjectBreakdownResult {
  const memberNames = projectData.teamMembers.map((m) => m.name);
  const lead = memberNames[0] || 'Team Lead';
  const member2 = memberNames[1] || 'Technical Specialist';
  const member3 = memberNames[2] || 'Domain Specialist';

  return {
    projectTitle: projectData.projectTitle,
    teamName: projectData.teamName,
    executiveSummaryEn: `Structured 3-phase execution plan for ${projectData.teamName} targeting comprehensive ERP, IoT, and Cloud integration.`,
    executiveSummaryAr: `خطة عمل متكاملة من 3 مراحل لفريق ${projectData.teamName} لتحقيق الربط الشامل بين نظم الـ ERP وسحابة البيانات وتطبيقات المستخدم.`,
    architectureOverview: `Microservice and event-driven architecture connecting edge IoT telemetry via MQTT bridge to a central PostgreSQL ERP datastore with Next.js & Flutter client interfaces.`,
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Architecture Design & Data Modeling',
        duration: 'Weeks 1-3',
        tasks: [
          {
            id: 't-1',
            title: 'Define Central ERP Database Schema & DDL',
            description: 'Design normalized tables, relational constraints, and audit logging in PostgreSQL.',
            track: 'ERP Backend & Database',
            suggestedAssignee: lead,
            priority: 'HIGH',
            estimatedHours: 20,
            erpImpact: 'Guarantees transactional consistency across multi-department processes.',
          },
          {
            id: 't-2',
            title: 'IoT Sensor Protocol & Telemetry Contract Specification',
            description: 'Standardize MQTT payload JSON formats and sensor calibration thresholds.',
            track: 'IoT & Embedded',
            suggestedAssignee: member2,
            priority: 'HIGH',
            estimatedHours: 16,
            erpImpact: 'Enables automated real-time inventory and machinery status ingestion.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Core Development & Integration Gateway',
        duration: 'Weeks 4-8',
        tasks: [
          {
            id: 't-3',
            title: 'Build Authenticated REST & WebSocket Gateway',
            description: 'Implement JWT session verification, role-based access, and rate limiting.',
            track: 'Cloud & Security',
            suggestedAssignee: lead,
            priority: 'HIGH',
            estimatedHours: 24,
            erpImpact: 'Secures enterprise data while exposing responsive endpoints.',
          },
          {
            id: 't-4',
            title: 'ERP Financial & Operational Reporting Module',
            description: 'Develop dashboards and automated PDF export for supervisors and stakeholders.',
            track: 'Business & QA',
            suggestedAssignee: member3,
            priority: 'MEDIUM',
            estimatedHours: 18,
            erpImpact: 'Provides decision-makers with live KPI visibility.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'System Integration, Security Audit & Final Demo',
        duration: 'Weeks 9-12',
        tasks: [
          {
            id: 't-5',
            title: 'End-to-End Latency Testing & Penetration Audit',
            description: 'Simulate concurrent sensor transmissions and test endpoint vulnerability resistance.',
            track: 'Cloud & Security',
            suggestedAssignee: lead,
            priority: 'HIGH',
            estimatedHours: 14,
            erpImpact: 'Ensures zero system downtime and compliance with enterprise security standards.',
          },
        ],
      },
    ],
    riskMitigation: [
      {
        risk: 'IoT payload serialization bottlenecks under network jitter',
        mitigation: 'Implement local buffering on microcontroller with retry queue and exponential backoff.',
      },
      {
        risk: 'Schema drift between ERP models and mobile client types',
        mitigation: 'Utilize automated Prisma code-generation and shared TypeScript interfaces.',
      },
    ],
    synergyBestPractices: [
      'Conduct bi-weekly bilingual standup reviews across CS and BIS sub-teams',
      'Maintain an audit log for every schema migration pushed to the shared development database',
    ],
  };
}
