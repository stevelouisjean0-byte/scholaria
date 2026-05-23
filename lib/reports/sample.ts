/**
 * Sample job memory used to render a preview deliverable before any real
 * agents have run. Lives in lib so /preview/sample-report and any internal
 * test routes import from one canonical fixture.
 */
import type { JobMemory } from "@/lib/memory";

export const SAMPLE_FILENAME = "patel-dissertation-ch3.docx";
export const SAMPLE_JOB_ID = "ms_pra72example";
export const SAMPLE_MANUSCRIPT = { wordCount: 8420, pageCount: 32 };

export const SAMPLE_MEMORY: JobMemory = {
  jobId: SAMPLE_JOB_ID,
  updatedAt: new Date().toISOString(),
  intake: {
    degreeLevel: "Ed.D.",
    assignmentType: "Dissertation chapter (Chapter 3 — Methodology)",
    deadlineIso: null,
    formattingStyle: "APA7",
    professorFeedback: "Chair flagged synthesis gaps between framework and literature.",
    areasOfConcern: ["transitions", "citation completeness", "methodological alignment"]
  },
  scope: {
    complexity: "advanced",
    category: "Educational leadership · qualitative case study",
    servicePackage: "Doctoral · chapter review",
    priority: "rush",
    assignedAgents: ["professional_editor", "research_support"]
  },
  reviews: {
    professional_editor: {
      agentKey: "professional_editor",
      scholarlyTone: 86,
      clarity: 82,
      apaCompliance: 91,
      findings: [
        {
          id: "pe-001",
          page: 12,
          section: "§2.3",
          severity: "major",
          type: "synthesis",
          excerpt:
            "Transformational leadership theory was foundational in this study, and the literature reviewed broadly supports the themes discussed.",
          issue:
            "The transition between the theoretical framework and the literature review lacks sufficient scholarly connection. The chapter shifts to a thematic treatment without re-stating how transformational leadership theory should organise the synthesis that follows.",
          recommendation:
            "Add a bridging paragraph immediately after the framework introduction that explicitly explains how transformational leadership theory informs each theme discussed in §2.4 through §2.7."
        },
        {
          id: "pe-002",
          page: 17,
          section: "§2.5",
          severity: "major",
          type: "citation",
          excerpt:
            "Participation rates improved significantly following the intervention (Reyes, 2022).",
          issue:
            "The citation on page 17 appears within the narrative but is absent from the reference section. The source (Reyes, 2022) cannot be located.",
          recommendation:
            "Verify APA 7 formatting requirements and either remove the in-text citation or include the complete reference entry with author, year, title, source, and DOI in the reference list."
        },
        {
          id: "pe-003",
          page: 14,
          section: "§2.4",
          severity: "moderate",
          type: "tone",
          excerpt: "The literature is really clear about this, and it definitely supports the intervention.",
          issue: "Register shifts to colloquial here. Words like “really” and “definitely” weaken the analytical voice.",
          recommendation:
            "Rewrite to: \"The literature is consistent on this point, and the evidence supports the intervention.\""
        },
        {
          id: "pe-004",
          page: 22,
          section: "§3.1",
          severity: "moderate",
          type: "structure",
          excerpt: "This chapter will discuss the methodology used in this study.",
          issue: "Empty chapter opener — restates the heading rather than orienting the reader.",
          recommendation:
            "Open with a one-sentence statement of the methodological stance (e.g. \"This study employs a qualitative multi-site case design grounded in transformational leadership theory.\")."
        }
      ],
      summary:
        "Tone and clarity are strong throughout. The chapter's principal weakness is in synthesis: the theoretical framework introduced at the start is not used to organise the literature review that follows. Citations are largely consistent but one orphan was identified."
    },
    research_support: {
      agentKey: "research_support",
      scholarlyTone: 88,
      clarity: 84,
      literatureSynthesis: 78,
      methodologyAlignment: 84,
      citationAccuracy: 88,
      findings: [
        {
          id: "rs-001",
          page: 24,
          section: "§3.4",
          severity: "major",
          type: "methodology",
          excerpt:
            "Research Question 2 examines whether transformational leadership practices differ across cohorts.",
          issue:
            "RQ2 is framed comparatively across cohorts, but the sampling described in §3.4 is purposive within a single site.",
          recommendation:
            "Either widen the sampling strategy to include at least one comparison site or reframe RQ2 as a single-site inquiry into within-cohort variation."
        },
        {
          id: "rs-002",
          page: 9,
          section: "§2.2",
          severity: "moderate",
          type: "synthesis",
          excerpt:
            "Themes 1 and 3 both address professional learning communities and their effects on adaptive capacity.",
          issue:
            "Theme 1 and Theme 3 perform similar analytical work. Their distinct labels create the appearance of redundancy that a committee will notice before any reviewer can defend it.",
          recommendation:
            "Consolidate Theme 1 and Theme 3 into a single theme, or differentiate their analytical purpose explicitly in the paragraph that introduces each."
        },
        {
          id: "rs-003",
          page: 11,
          section: "§2.3",
          severity: "minor",
          type: "citation",
          excerpt: "Recent scholarship (Bass & Riggio, 2018) has expanded the original four-I model.",
          issue:
            "Bass & Riggio (2018) is appropriate, but the chapter would benefit from at least one citation post-2020 to demonstrate recency.",
          recommendation:
            "Add one to two more recent references (2020+) to anchor transformational leadership theory in current scholarship."
        }
      ],
      summary:
        "Synthesis depth is good but uneven. The principal methodological concern is RQ2's comparative framing against a single-site sampling strategy — this will be the committee's first defense question."
    }
  },
  qa: {
    passed: true,
    qualityScore: 87,
    submissionReadiness: 84,
    notes:
      "All findings are anchored to verbatim excerpts. Recommendations are explicit and actionable. Two major findings require revision before submission. Released."
  },
  report: {
    executiveSummary:
      "Chapter 3 reads as a competent and largely well-organised methodology and literature treatment. The chapter is held back by two principal issues. First, the theoretical framework introduced in Chapter 1 disappears once the literature review opens — themes are presented without the organising lens that transformational leadership theory should provide. Second, Research Question 2 is framed comparatively across cohorts while the sampling described in §3.4 is purposive within a single site. The reviewing agents recommend addressing these two before the committee meeting; the remaining findings are tone, structure, and citation hygiene that can be revised in a single editorial pass.",
    revisionPlan: [
      "p. 12. Add a bridging paragraph between the framework and the literature review that explicitly explains how transformational leadership theory organises the themes that follow.",
      "p. 24. Resolve the alignment between RQ2 and the sampling strategy — either widen sampling or reframe RQ2 as a single-site inquiry.",
      "p. 9. Consolidate Theme 1 and Theme 3 or differentiate their analytical purpose in the opening paragraph of each.",
      "p. 17. Locate or remove the orphaned Reyes (2022) citation and verify the reference list entry.",
      "p. 14. Replace colloquial phrasings (\"really\", \"definitely\") with scholarly register.",
      "p. 22. Replace the empty chapter opener with a one-sentence statement of methodological stance.",
      "p. 11. Add one to two post-2020 citations to the framework section to demonstrate recency."
    ],
    deliverables: [
      { label: "Scholarly review report", url: "/api/jobs/ms_pra72example/report.pdf", kind: "pdf" },
      { label: "Annotated manuscript", url: "/api/jobs/ms_pra72example/annotated.pdf", kind: "pdf" }
    ]
  }
};
