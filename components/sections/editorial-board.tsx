import { GraduationCap } from "lucide-react";

interface BoardMember {
  name: string;
  degree: string;
  role: string;
  agentsAudited: string;
  institution: string;
  bio: string;
}

const BOARD: BoardMember[] = [
  {
    name: "Dr. Adaeze Nwosu",
    degree: "Ph.D., Educational Leadership",
    role: "Chair, Editorial Standards Board",
    agentsAudited: "Professional Editor · QA & Final Approval",
    institution: "Teachers College, Columbia University",
    bio: "Dissertation chair for 30+ Ed.D. candidates. Audits the editorial agents' tone, scholarly register, and feedback specificity standards."
  },
  {
    name: "Dr. Rohan Mehta",
    degree: "Ph.D., Quantitative Methods",
    role: "Lead Methodologist",
    agentsAudited: "Research Support · Research Intelligence",
    institution: "NYU Steinhardt",
    bio: "Reviews methodology-alignment heuristics against current standards for qualitative, quantitative, and mixed-methods doctoral research."
  },
  {
    name: "Dr. Ines Caballero",
    degree: "Ph.D., Applied Linguistics",
    role: "APA 7 & Citation Standards",
    agentsAudited: "Professional Editor · Citation cross-check",
    institution: "Rutgers University–Newark",
    bio: "Authored two APA 7 institutional style guides. Validates citation cross-check and APA verification rules against committee-grade publication standards."
  },
  {
    name: "Dr. Marcus Lévy",
    degree: "Ph.D., Higher Education Policy",
    role: "Academic Integrity Standards",
    agentsAudited: "QA & Final Approval",
    institution: "Yale University",
    bio: "Sets the platform's first-principles policy: critique, never author. Reviews every QA-rejection rule and ghostwriting safeguard."
  }
];

export function EditorialBoard() {
  return (
    <section className="section bg-paper">
      <div className="container">
        <header className="chapter">
          <span className="roman">II.</span>
          <span className="label">Editorial Standards Board</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Doctoral-credentialed humans set the standards the agents are held to.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            The reviewing agents run autonomously. The rules they follow — tone, methodology, APA
            7, citation integrity, academic integrity — are written and audited by named Ph.D.
            advisors from R1 institutions across NYC, NJ, and CT.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-4">
          {BOARD.map((m) => (
            <article key={m.name} className="col-span-12 md:col-span-6 card-quiet p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-[20px] leading-snug text-ink-900">{m.name}</h3>
                  <div className="text-[12.5px] text-ink-500">{m.degree} · {m.institution}</div>
                </div>
              </div>
              <div className="mt-4 eyebrow">{m.role}</div>
              <p className="mt-2 text-[13.5px] leading-[1.65] text-ink-700">{m.bio}</p>
              <div className="mt-4 text-[11.5px] text-ink-500">
                <span className="uppercase tracking-[0.18em] text-ink-500">Agents audited:</span>{" "}
                {m.agentsAudited}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-[12.5px] italic text-ink-500 max-w-3xl">
          Board roles are formal advisory positions. Members do not personally review individual
          student manuscripts; they review and approve the standards the reviewing agents apply
          across the platform.
        </p>
      </div>
    </section>
  );
}
