import { Question, Filters, SUBJECTS } from "@/types/question";

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const roundTo = (num: number, places: number) => Number(num.toFixed(places));

interface QuestionTemplate {
  t: string;
  o: string[];
  c: number;
  s: string;
}

interface TemplateGenerator {
  level: number;
  gen: () => QuestionTemplate;
}

const FALLBACK_TEMPLATES: { [key: string]: TemplateGenerator[] } = {
  Physics: [
    {
      level: 1,
      gen: () => {
        const u = rnd(5, 20);
        const a = rnd(2, 10);
        const t = rnd(2, 5);
        const v = u + a * t;
        return {
          t: `A particle starts with an initial velocity of ${u} m/s and accelerates at ${a} m/s² for ${t} seconds. What is its final velocity?`,
          o: [
            `${v} m/s`,
            `${v + rnd(1, 5)} m/s`,
            `${v - rnd(1, 5)} m/s`,
            `${u + a} m/s`,
          ],
          c: 0,
          s: `Using v = u + at: v = ${u} + (${a} × ${t}) = ${v} m/s.`,
        };
      },
    },
    {
      level: 3,
      gen: () => {
        const m = rnd(2, 10);
        const f = rnd(10, 50);
        const a = f / m;
        return {
          t: `A force of ${f} N is applied to a body of mass ${m} kg. What is the acceleration produced?`,
          o: [
            `${roundTo(a, 1)} m/s²`,
            `${roundTo(a * 2, 1)} m/s²`,
            `${roundTo(a / 2, 1)} m/s²`,
            `${roundTo(f + m, 1)} m/s²`,
          ],
          c: 0,
          s: `Newton's Second Law F=ma -> a=F/m -> a=${f}/${m} = ${roundTo(a, 2)} m/s².`,
        };
      },
    },
    {
      level: 2,
      gen: () => {
        const m = rnd(1, 5);
        const g = 10;
        const h = rnd(5, 20);
        const pe = m * g * h;
        return {
          t: `A body of mass ${m} kg is raised to a height of ${h} m. What is its potential energy? (g = 10 m/s²)`,
          o: [
            `${pe} J`,
            `${pe + 50} J`,
            `${pe - 20} J`,
            `${m * h} J`,
          ],
          c: 0,
          s: `PE = mgh = ${m} × 10 × ${h} = ${pe} J`,
        };
      },
    },
  ],
  Chemistry: [
    {
      level: 2,
      gen: () => {
        const ph = rnd(3, 11);
        const poh = 14 - ph;
        return {
          t: `If the pH of a solution is ${ph}, what is its pOH at 25°C?`,
          o: [`${poh}`, `${ph}`, `7`, `14`],
          c: 0,
          s: `pH + pOH = 14. Thus, pOH = 14 - ${ph} = ${poh}.`,
        };
      },
    },
    {
      level: 1,
      gen: () =>
        pick([
          {
            t: "Which element has the highest electronegativity?",
            o: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
            c: 0,
            s: "Fluorine has the highest electronegativity value of 3.98 on the Pauling scale.",
          },
          {
            t: "What is the molecular weight of water (H₂O)?",
            o: ["18 g/mol", "16 g/mol", "20 g/mol", "17 g/mol"],
            c: 0,
            s: "H₂O = 2(1) + 16 = 18 g/mol",
          },
        ]),
    },
    {
      level: 3,
      gen: () => {
        const moles = rnd(1, 5);
        const molecules = moles * 6.022;
        return {
          t: `How many molecules are present in ${moles} moles of a substance? (Use Avogadro's number = 6.022 × 10²³)`,
          o: [
            `${molecules.toFixed(3)} × 10²³`,
            `${(molecules * 2).toFixed(3)} × 10²³`,
            `${(molecules / 2).toFixed(3)} × 10²³`,
            `${moles} × 10²³`,
          ],
          c: 0,
          s: `Number of molecules = n × Nₐ = ${moles} × 6.022 × 10²³ = ${molecules.toFixed(3)} × 10²³`,
        };
      },
    },
  ],
  Maths: [
    {
      level: 2,
      gen: () => {
        const a = rnd(2, 5);
        return {
          t: `Evaluate: ∫ x^${a} dx`,
          o: [
            `x^${a + 1}/${a + 1} + C`,
            `x^${a - 1}/${a - 1} + C`,
            `${a}x^${a - 1} + C`,
            `x^${a + 1} + C`,
          ],
          c: 0,
          s: `Power rule: ∫ x^n dx = x^(n+1)/(n+1) + C. Result: x^${a + 1}/${a + 1} + C.`,
        };
      },
    },
    {
      level: 1,
      gen: () => {
        const a = rnd(2, 9);
        const b = rnd(2, 9);
        const sum = a + b;
        const prod = a * b;
        return {
          t: `Find two numbers whose sum is ${sum} and product is ${prod}.`,
          o: [`${a} and ${b}`, `${a + 1} and ${b - 1}`, `${prod} and 1`, `${sum} and 0`],
          c: 0,
          s: `The numbers are ${a} and ${b}. Sum: ${a}+${b}=${sum}, Product: ${a}×${b}=${prod}`,
        };
      },
    },
    {
      level: 3,
      gen: () => {
        const n = rnd(3, 7);
        const ans = (n * (n + 1)) / 2;
        return {
          t: `What is the sum of first ${n} natural numbers?`,
          o: [`${ans}`, `${ans + n}`, `${n * n}`, `${n + 1}`],
          c: 0,
          s: `Sum = n(n+1)/2 = ${n}(${n + 1})/2 = ${ans}`,
        };
      },
    },
  ],
  Biology: [
    {
      level: 1,
      gen: () =>
        pick([
          {
            t: "Which organelle is known as the 'Powerhouse of the cell'?",
            o: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"],
            c: 0,
            s: "Mitochondria produce ATP through cellular respiration, providing energy for the cell.",
          },
          {
            t: "DNA stands for:",
            o: [
              "Deoxyribonucleic Acid",
              "Deoxyribo Acid",
              "Dinucleic Acid",
              "Delta Nucleic Acid",
            ],
            c: 0,
            s: "DNA is the hereditary material in most living organisms.",
          },
        ]),
    },
    {
      level: 2,
      gen: () =>
        pick([
          {
            t: "Which blood group is known as the universal donor?",
            o: ["O negative", "AB positive", "A positive", "B negative"],
            c: 0,
            s: "O negative blood lacks A, B antigens and Rh factor, making it safe for all recipients.",
          },
          {
            t: "How many chromosomes are present in a human somatic cell?",
            o: ["46", "23", "44", "48"],
            c: 0,
            s: "Human somatic cells have 46 chromosomes (23 pairs).",
          },
        ]),
    },
    {
      level: 3,
      gen: () =>
        pick([
          {
            t: "Which enzyme is responsible for unwinding DNA during replication?",
            o: ["Helicase", "DNA polymerase", "Ligase", "Primase"],
            c: 0,
            s: "Helicase unwinds the DNA double helix by breaking hydrogen bonds between base pairs.",
          },
          {
            t: "In which phase of mitosis do chromosomes align at the cell's equator?",
            o: ["Metaphase", "Prophase", "Anaphase", "Telophase"],
            c: 0,
            s: "During metaphase, chromosomes line up at the metaphase plate (cell equator).",
          },
        ]),
    },
  ],
};

export function generateFallbackQuestion(filters: Filters): Question {
  const availableSubjects =
    filters.subject === "Mix" ? SUBJECTS[filters.exam] : [filters.subject];
  const subject = pick(availableSubjects);
  const targetLevel = Math.max(1, Math.min(5, filters.difficulty + rnd(-1, 1)));

  const subjectTemplates =
    FALLBACK_TEMPLATES[subject] || FALLBACK_TEMPLATES["Physics"];
  const templateObj = subjectTemplates.reduce((prev, curr) =>
    Math.abs(curr.level - targetLevel) < Math.abs(prev.level - targetLevel)
      ? curr
      : prev
  );

  const rawQ = templateObj.gen();
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    subject,
    type: filters.exam,
    difficulty: templateObj.level,
    text: rawQ.t,
    options: indices.map((i) => rawQ.o[i]),
    correctIndex: indices.indexOf(rawQ.c),
    solution: rawQ.s,
    isAiGenerated: false,
  };
}

export function generateFallbackBatch(filters: Filters, count: number): Question[] {
  return Array.from({ length: count }).map(() => generateFallbackQuestion(filters));
}
