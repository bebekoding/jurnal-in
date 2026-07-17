// IELTS Academic Reading practice sets — static content.
// Questions, answer key, accepted-answer variants, and band scoring all live
// here so both the test UI and the server can score deterministically.

export type QType = "tfng" | "mc" | "matching" | "heading" | "short";

export type Question = {
  n: number;
  type: QType;
  prompt: string;
  /** For mc: the four option texts keyed A–D. */
  options?: { label: string; text: string }[];
  /** Canonical answer shown in the review. */
  answer: string;
  /** Normalized acceptable answers (letters/values for choice, variants for text). */
  accept: string[];
  /** Short explanation / paragraph citation. */
  note: string;
};

export type QGroup = {
  instruction: string;
  kind: QType;
  /** Heading bank for matching-headings groups. */
  headings?: { key: string; text: string }[];
  questions: Question[];
};

export type Passage = {
  n: number;
  category: string;
  title: string;
  source: string;
  rangeLabel: string;
  paragraphs: { label: string; text: string }[];
  groups: QGroup[];
};

export type ReadingSet = {
  id: string;
  title: string;
  subtitle: string;
  totalQuestions: number;
  durationMinutes: number;
  passages: Passage[];
};

// ── normalization + accepted-answer matching ──────────────────────────────
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?"'’“”()]/g, "")
    .replace(/\b(the|a|an)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrect(q: Question, raw: string | undefined): boolean {
  if (!raw) return false;
  const got = normalizeAnswer(raw);
  if (!got) return false;
  return q.accept.some((a) => normalizeAnswer(a) === got);
}

// ── band scoring (from the provided scoring guide) ────────────────────────
const BANDS: { min: number; max: number; band: string; interpretation: string }[] = [
  { min: 39, max: 40, band: "9.0", interpretation: "Expert / near-native" },
  { min: 37, max: 38, band: "8.5", interpretation: "Very good" },
  { min: 35, max: 36, band: "8.0", interpretation: "Very good" },
  { min: 33, max: 34, band: "7.5", interpretation: "Good" },
  { min: 30, max: 32, band: "7.0", interpretation: "Good" },
  { min: 27, max: 29, band: "6.5", interpretation: "Competent — target for most scholarships" },
  { min: 23, max: 26, band: "6.0", interpretation: "Competent" },
  { min: 19, max: 22, band: "5.5", interpretation: "Modest" },
  { min: 15, max: 18, band: "5.0", interpretation: "Modest" },
  { min: 0, max: 14, band: "Below 5.0", interpretation: "Limited" },
];

export function bandForRaw(raw: number): { band: string; interpretation: string } {
  const hit = BANDS.find((b) => raw >= b.min && raw <= b.max);
  return hit
    ? { band: hit.band, interpretation: hit.interpretation }
    : { band: "Below 5.0", interpretation: "Limited" };
}

export function allQuestions(set: ReadingSet): Question[] {
  return set.passages.flatMap((p) => p.groups.flatMap((g) => g.questions));
}

export type ScoredQuestion = {
  n: number;
  correct: boolean;
  given: string;
  answer: string;
  note: string;
};

export function scoreSet(
  set: ReadingSet,
  answers: Record<string, string>
): { raw: number; total: number; band: string; interpretation: string; perQuestion: ScoredQuestion[] } {
  const qs = allQuestions(set);
  const perQuestion = qs.map((q) => {
    const given = answers[String(q.n)] ?? "";
    const correct = isCorrect(q, given);
    return { n: q.n, correct, given, answer: q.answer, note: q.note };
  });
  const raw = perQuestion.filter((p) => p.correct).length;
  const { band, interpretation } = bandForRaw(raw);
  return { raw, total: qs.length, band, interpretation, perQuestion };
}

// ── the one available set ─────────────────────────────────────────────────
export const READING_SETS: ReadingSet[] = [
  {
    id: "full-set-1",
    title: "IELTS Academic Reading — Full Practice Set 1",
    subtitle: "Supervolcanoes · Recommender Systems · Rethinking GDP",
    totalQuestions: 40,
    durationMinutes: 40,
    passages: [
      {
        n: 1,
        category: "Natural Phenomena",
        title: "The Sleeping Giants: Understanding Supervolcanoes",
        source: "Adapted from Earth Sciences Review",
        rangeLabel: "Q1–13",
        paragraphs: [
          {
            label: "A",
            text: "Beneath some of the most scenic landscapes on Earth lie geological formations of extraordinary power — supervolcanoes. Unlike conventional volcanoes, which form steep conical peaks from accumulated lava, supervolcanoes are characterised by vast underground magma reservoirs that, when they erupt, collapse into enormous depressions called calderas rather than building upward. The Yellowstone Caldera in the United States, stretching approximately 55 by 72 kilometres, is among the most studied of these formations. Similarly, Lake Toba in Indonesia occupies a caldera formed by the most recent known supereruption on Earth, approximately 74,000 years ago.",
          },
          {
            label: "B",
            text: "The distinction between a supervolcano and an ordinary volcano lies principally in the volume of material ejected. Volcanologists define a supereruption as one that expels more than 1,000 cubic kilometres of magma — a figure so immense it strains comprehension. To put this in perspective, the 1980 eruption of Mount St. Helens, considered one of the most destructive volcanic events in modern American history, released only approximately 1 cubic kilometre of material. A supereruption would therefore produce the equivalent of one thousand such events occurring simultaneously.",
          },
          {
            label: "C",
            text: "The consequences of such an event extend far beyond the immediate eruption zone. When a supervolcano erupts, it ejects vast quantities of sulphur dioxide and ash particles into the stratosphere, where they can remain suspended for years. This particulate matter reflects incoming solar radiation back into space, dramatically reducing surface temperatures across the planet. The Toba catastrophe is hypothesised by some researchers to have triggered a decade-long volcanic winter that reduced global temperatures by as much as 15 degrees Celsius. While this \"volcanic winter\" hypothesis remains contested, palaeoclimatological data does confirm significant global cooling following the Toba event.",
          },
          {
            label: "D",
            text: "Monitoring supervolcanoes presents unique scientific challenges. Unlike conventional volcanic monitoring, which can rely on visible surface changes such as swelling or increased fumarolic activity near a recognisable cone, supervolcanic systems manifest their activity across enormous areas. Ground deformation at Yellowstone, for instance, is measured across an area larger than some small countries. The United States Geological Survey (USGS) employs a network of GPS sensors, seismographs, and satellite-based radar systems called InSAR to detect even millimetre-scale ground movements. Crucially, scientists emphasise that ground uplift at Yellowstone does not necessarily indicate an impending eruption.",
          },
          {
            label: "E",
            text: "Current scientific consensus suggests that the probability of a Yellowstone supereruption in any given century is approximately one in 10,000. More immediately relevant, scientists note that even were an eruption to occur, it would almost certainly be preceded by weeks or months of intensifying precursors that monitoring systems would detect. The far greater concern at Yellowstone in the near term, volcanologists argue, is not a cataclysmic supereruption but rather smaller hydrothermal explosions or lava flows — events that, while locally destructive, would have regional rather than global consequences.",
          },
          {
            label: "F",
            text: "Research into supervolcanoes has also yielded unexpected scientific dividends. The geothermal energy that powers Yellowstone's famous geysers and hot springs is a direct consequence of the immense heat generated by the underlying magma reservoir. Several nations, including Iceland and New Zealand, both of which sit above volcanically active zones, have developed substantial geothermal energy industries. Iceland, in particular, now derives approximately 30% of its total electricity from geothermal sources, a model that researchers in other geologically active regions are studying with considerable interest.",
          },
        ],
        groups: [
          {
            instruction:
              "Questions 1–6 · True / False / Not Given: Do the following statements agree with the information in the passage?",
            kind: "tfng",
            questions: [
              { n: 1, type: "tfng", prompt: "Supervolcanoes form elevated cone-shaped mountains above the ground surface.", answer: "FALSE", accept: ["FALSE"], note: "Para A: they collapse into calderas rather than building upward." },
              { n: 2, type: "tfng", prompt: "The 1980 eruption of Mount St. Helens released approximately 1,000 cubic kilometres of material.", answer: "FALSE", accept: ["FALSE"], note: "Para B: it released only ~1 km³." },
              { n: 3, type: "tfng", prompt: "All scientists agree that the Toba eruption caused a decade-long global volcanic winter.", answer: "FALSE", accept: ["FALSE"], note: "Para C: the hypothesis \"remains contested\"." },
              { n: 4, type: "tfng", prompt: "InSAR is a satellite-based technology used to measure ground movement at Yellowstone.", answer: "TRUE", accept: ["TRUE"], note: "Para D: explicitly stated." },
              { n: 5, type: "tfng", prompt: "Ground uplift at Yellowstone is a reliable indicator that a supereruption is about to occur.", answer: "FALSE", accept: ["FALSE"], note: "Para D: \"does not necessarily indicate\" an eruption." },
              { n: 6, type: "tfng", prompt: "Iceland generates around 30% of its electricity from geothermal energy.", answer: "TRUE", accept: ["TRUE"], note: "Para F: explicitly stated." },
            ],
          },
          {
            instruction:
              "Questions 7–10 · Matching Information: Which paragraph (A–F) contains the following information? You may use any letter more than once.",
            kind: "matching",
            questions: [
              { n: 7, type: "matching", prompt: "A comparison that illustrates the scale difference between a supereruption and a well-known historical event.", answer: "B", accept: ["B"], note: "Mount St. Helens comparison." },
              { n: 8, type: "matching", prompt: "A description of the economic application of underground volcanic heat.", answer: "F", accept: ["F"], note: "Geothermal energy industry." },
              { n: 9, type: "matching", prompt: "An explanation of why monitoring supervolcanoes differs from monitoring ordinary volcanoes.", answer: "D", accept: ["D"], note: "Monitoring challenges." },
              { n: 10, type: "matching", prompt: "A statement about which volcanic events at Yellowstone are considered a more likely near-term threat.", answer: "E", accept: ["E"], note: "Hydrothermal explosions / lava flows." },
            ],
          },
          {
            instruction:
              "Questions 11–13 · Short Answer: Answer the questions using NO MORE THAN THREE WORDS from the passage.",
            kind: "short",
            questions: [
              { n: 11, type: "short", prompt: "What term is used for the large depression formed when a supervolcano collapses after erupting?", answer: "caldera", accept: ["caldera", "calderas", "a caldera"], note: "Para A." },
              { n: 12, type: "short", prompt: "What two substances ejected into the stratosphere cause global cooling after a supereruption?", answer: "sulphur dioxide and ash", accept: ["sulphur dioxide and ash", "sulfur dioxide and ash", "sulphur dioxide ash", "sulfur dioxide ash", "sulphur dioxide and ash particles", "ash and sulphur dioxide", "sulphur dioxide", "sulfur dioxide"], note: "Para C — three-word limit." },
              { n: 13, type: "short", prompt: "A Yellowstone supereruption would be preceded by warning signs lasting at least how long?", answer: "weeks or months", accept: ["weeks or months", "weeks and months", "weeks to months", "weeks months"], note: "Para E." },
            ],
          },
        ],
      },
      {
        n: 2,
        category: "Technology",
        title: "The Algorithmic Lens: How Recommender Systems Shape What We Watch",
        source: "Adapted from Digital Media Quarterly",
        rangeLabel: "Q14–26",
        paragraphs: [
          {
            label: "A",
            text: "When a streaming platform suggests a documentary after you finish a thriller, or when a music service auto-plays a song that seems uncannily suited to your mood, the mechanism behind these experiences is a recommender system — a class of algorithm designed to predict and surface content that a given user is likely to engage with. These systems have evolved from rudimentary rule-based filters into sophisticated machine learning architectures that process billions of data points in real time, and they now exert an enormous influence over what cultural content most people consume.",
          },
          {
            label: "B",
            text: "Early recommender systems relied on collaborative filtering, a technique based on identifying users with similar tastes and recommending items that those similar users had rated highly. If User A and User B had both watched and positively rated a set of films, the system would recommend to User A any highly rated film that User B had seen but User A had not. This approach required no understanding of the content itself, only patterns of user behaviour — but it also suffered from a well-documented limitation known as the cold-start problem: new users with no viewing history provided insufficient data for meaningful recommendations.",
          },
          {
            label: "C",
            text: "Content-based filtering offered a partial solution. Rather than comparing users to one another, this approach analyses the attributes of items themselves — genre, director, cast, narrative themes, pacing — and recommends content that shares characteristics with what a user has previously enjoyed. Netflix famously employed teams of human analysts called \"taggers\" to watch and annotate its entire catalogue with hundreds of micro-genre tags, enabling highly granular content-based matching. However, content-based systems tend to generate what researchers call a \"filter bubble\" — a phenomenon in which users are consistently shown content that confirms and reinforces their existing preferences rather than exposing them to genuinely new experiences.",
          },
          {
            label: "D",
            text: "Modern recommender architectures typically combine both approaches in hybrid systems, supplementing them with contextual signals such as time of day, device type, and even how quickly a user scrolls past a thumbnail. Deep learning models, particularly those using neural networks trained on enormous datasets, have dramatically improved prediction accuracy. A key innovation has been the development of embedding models, which represent both users and content as vectors in a high-dimensional mathematical space, allowing the system to identify subtle patterns of affinity that neither collaborative nor content-based methods alone could detect.",
          },
          {
            label: "E",
            text: "Yet the increasing sophistication of these systems has attracted significant critical scrutiny. Scholars and regulators have raised concerns about the opacity of algorithmic decision-making — users generally have no insight into why they are being shown particular content. A related concern is the potential for recommender systems to amplify engagement-maximising content at the expense of quality or accuracy. Research published in the journal Nature has indicated that recommendation algorithms on video platforms may systematically promote content that generates strong emotional reactions — including anger and anxiety — because such content tends to hold viewer attention for longer, which optimises the engagement metrics the algorithms are designed to maximise.",
          },
          {
            label: "F",
            text: "In response to these concerns, several major platforms have begun to incorporate what are termed \"diversity constraints\" into their recommendation pipelines — parameters that deliberately introduce variety into a user's content diet even when doing so may reduce short-term engagement metrics. Some researchers advocate for going further, arguing that recommender systems should be designed not merely to predict what users will watch, but to serve what users would genuinely choose if they had full information and time for reflection. This distinction between revealed preference — what we actually click on — and considered preference — what we would choose on reflection — sits at the heart of an ongoing debate about the responsibilities of technology companies toward their users.",
          },
        ],
        groups: [
          {
            instruction: "Questions 14–17 · Multiple Choice: Choose the correct letter A, B, C, or D.",
            kind: "mc",
            questions: [
              {
                n: 14,
                type: "mc",
                prompt: "What is the main purpose of recommender systems according to Paragraph A?",
                options: [
                  { label: "A", text: "To store and organise large quantities of cultural content" },
                  { label: "B", text: "To predict and present content that a user is likely to engage with" },
                  { label: "C", text: "To allow users to rate and review content they have watched" },
                  { label: "D", text: "To connect users with similar viewing habits for social interaction" },
                ],
                answer: "B",
                accept: ["B"],
                note: "Para A: \"predict and surface content\".",
              },
              {
                n: 15,
                type: "mc",
                prompt: "What was a key weakness of early collaborative filtering systems?",
                options: [
                  { label: "A", text: "They required detailed knowledge of the content of each film" },
                  { label: "B", text: "They could only be applied to music, not to film or television" },
                  { label: "C", text: "They were unable to make useful recommendations for users with no prior history" },
                  { label: "D", text: "They consistently recommended the same content to all users" },
                ],
                answer: "C",
                accept: ["C"],
                note: "Para B: the cold-start problem.",
              },
              {
                n: 16,
                type: "mc",
                prompt: "According to Paragraph E, why might algorithms promote emotionally provocative content?",
                options: [
                  { label: "A", text: "Because platform executives personally prefer such content" },
                  { label: "B", text: "Because it keeps viewers watching for longer, improving engagement scores" },
                  { label: "C", text: "Because users have explicitly requested more emotional content in surveys" },
                  { label: "D", text: "Because it is cheaper to produce than factual content" },
                ],
                answer: "B",
                accept: ["B"],
                note: "Holds attention → better engagement metrics.",
              },
              {
                n: 17,
                type: "mc",
                prompt: "What do researchers in Paragraph F argue recommender systems should ultimately serve?",
                options: [
                  { label: "A", text: "The preferences users demonstrate through actual clicking behaviour" },
                  { label: "B", text: "The content choices users would make with full information and time to reflect" },
                  { label: "C", text: "The highest-rated content as determined by professional critics" },
                  { label: "D", text: "Content that maximises short-term engagement regardless of quality" },
                ],
                answer: "B",
                accept: ["B"],
                note: "\"Considered preference\".",
              },
            ],
          },
          {
            instruction:
              "Questions 18–22 · Matching Paragraph Headings: Match each paragraph A–E with the correct heading (i–viii). There are more headings than paragraphs.",
            kind: "heading",
            headings: [
              { key: "i", text: "The introduction of variety as a design goal" },
              { key: "ii", text: "How content characteristics guide recommendations" },
              { key: "iii", text: "The limitations of early user-matching methods" },
              { key: "iv", text: "A definition of recommender systems and their cultural impact" },
              { key: "v", text: "Concerns about algorithmic transparency and harmful content amplification" },
              { key: "vi", text: "Why geothermal data improves prediction" },
              { key: "vii", text: "The development of combined and data-driven approaches" },
              { key: "viii", text: "The commercial value of recommender system patents" },
            ],
            questions: [
              { n: 18, type: "heading", prompt: "Paragraph A", answer: "iv", accept: ["iv"], note: "Definition + cultural impact." },
              { n: 19, type: "heading", prompt: "Paragraph B", answer: "iii", accept: ["iii"], note: "Limitations of collaborative filtering." },
              { n: 20, type: "heading", prompt: "Paragraph C", answer: "ii", accept: ["ii"], note: "Content-based attributes." },
              { n: 21, type: "heading", prompt: "Paragraph D", answer: "vii", accept: ["vii"], note: "Hybrid + deep learning." },
              { n: 22, type: "heading", prompt: "Paragraph E", answer: "v", accept: ["v"], note: "Opacity + harmful amplification." },
            ],
          },
          {
            instruction:
              "Questions 23–26 · Sentence Completion: Complete the sentences using NO MORE THAN TWO WORDS from the passage.",
            kind: "short",
            questions: [
              { n: 23, type: "short", prompt: "Collaborative filtering requires no analysis of content itself — it only uses patterns of ____.", answer: "user behaviour", accept: ["user behaviour", "user behavior", "behaviour", "behavior"], note: "Para B." },
              { n: 24, type: "short", prompt: "Netflix used human analysts called ____ to annotate its catalogue with detailed genre tags.", answer: "taggers", accept: ["taggers", "tagger"], note: "Para C." },
              { n: 25, type: "short", prompt: "Embedding models represent both users and content as ____ in a high-dimensional mathematical space.", answer: "vectors", accept: ["vectors", "vector"], note: "Para D." },
              { n: 26, type: "short", prompt: "Parameters added to recommendation pipelines that deliberately introduce variety are referred to as ____.", answer: "diversity constraints", accept: ["diversity constraints", "diversity constraint"], note: "Para F." },
            ],
          },
        ],
      },
      {
        n: 3,
        category: "Economics",
        title: "The Hidden Cost of Growth: Rethinking GDP as a Measure of Progress",
        source: "Adapted from International Economics Review",
        rangeLabel: "Q27–40",
        paragraphs: [
          {
            label: "A",
            text: "For much of the twentieth century, Gross Domestic Product — the total monetary value of all goods and services produced within a country's borders in a given period — functioned as the dominant yardstick by which governments and international institutions measured national success. Developed as a wartime accounting tool in the 1940s to help governments understand and mobilise their economies, GDP was never designed to serve as a comprehensive indicator of societal wellbeing. Its creator, economist Simon Kuznets, explicitly warned in 1934 that \"the welfare of a nation can scarcely be inferred from a measurement of national income.\" Yet for decades, this is precisely what policymakers attempted to do.",
          },
          {
            label: "B",
            text: "The limitations of GDP as a welfare measure are both structural and philosophical. Structurally, GDP counts all economic activity indiscriminately — a rise in road accidents, for instance, increases GDP through higher spending on medical care, vehicle repairs, and legal services, even though the accidents themselves represent a clear reduction in societal welfare. Similarly, the unpaid work of caregivers — raising children, caring for elderly relatives, maintaining households — contributes enormously to the functioning of society but is entirely invisible within GDP calculations because no monetary transaction occurs. Environmental degradation poses an equivalent blind spot: the depletion of a forest generates positive GDP through timber sales but records no corresponding debit for the permanent loss of biodiversity and ecosystem services.",
          },
          {
            label: "C",
            text: "Philosophical objections run deeper still. GDP measures the quantity of economic output but says nothing about its distribution. A country in which GDP grows rapidly while the gains accrue exclusively to a small wealthy elite will register as economically successful by GDP metrics, even if the majority of its citizens experience stagnant or declining living standards. The relationship between income and subjective wellbeing — happiness, life satisfaction, sense of purpose — is furthermore known to be non-linear. Beyond a certain income threshold, additional wealth contributes diminishingly little to reported happiness, a phenomenon economists sometimes call the Easterlin Paradox.",
          },
          {
            label: "D",
            text: "Alternative frameworks have been proposed to address these shortcomings. The United Nations Development Programme introduced the Human Development Index (HDI) in 1990, combining measures of income, education, and life expectancy into a single composite score. Bhutan famously institutionalised the concept of Gross National Happiness, a multidimensional wellbeing framework that incorporates psychological wellbeing, cultural resilience, time use, and ecological diversity alongside economic factors. New Zealand became one of the first countries to formally adopt a Wellbeing Budget in 2019, explicitly directing government spending toward defined wellbeing outcomes rather than purely toward growth.",
          },
          {
            label: "E",
            text: "Despite the conceptual appeal of these alternatives, they have struggled to displace GDP as the primary policy benchmark. In part, this reflects the practical virtues of GDP: it is relatively straightforward to measure, internationally standardised, updated frequently, and directly comparable across countries and time periods. HDI-style composite indices, by contrast, require complex weighting decisions — how much should life expectancy count relative to income? — that inevitably embed value judgements and invite political contestation. Critics also point out that economic growth, whatever its limitations as a welfare proxy, does correlate strongly with reductions in extreme poverty, improvements in health outcomes, and increased access to education.",
          },
          {
            label: "F",
            text: "A growing body of economists now advocates for a \"dashboard\" approach — using GDP alongside a suite of complementary indicators rather than replacing it outright. The OECD's Better Life Index, for example, allows users to weight eleven dimensions of wellbeing according to their own priorities, producing a personalised composite measure. The Inclusive Wealth Index, developed with UN backing, attempts to measure a nation's total stock of capital — physical, human, and natural — rather than the annual flow of economic activity, providing a longer-term perspective on sustainability. In this view, GDP is not discarded but repositioned: one instrument in a broader diagnostic toolkit rather than the sole measure of national health.",
          },
          {
            label: "G",
            text: "What remains beyond dispute is that the metrics societies choose to measure shape the decisions those societies make. If governments are evaluated primarily on GDP growth, they will orient policy toward activities that maximise GDP, sometimes at the expense of other legitimate social objectives. The economist Kate Raworth has argued that the goal of modern economies should be to meet the needs of all people within the means of the planet — a concept she terms the \"doughnut,\" bounded below by a social foundation and above by an ecological ceiling. Whether through dashboards, composite indices, or entirely new frameworks, the search for better measures of progress reflects a deeper question: what, ultimately, are economies for?",
          },
        ],
        groups: [
          {
            instruction:
              "Questions 27–33 · True / False / Not Given: Do the following statements agree with the information in the passage?",
            kind: "tfng",
            questions: [
              { n: 27, type: "tfng", prompt: "Simon Kuznets designed GDP specifically as a long-term measure of national welfare.", answer: "FALSE", accept: ["FALSE"], note: "Para A: it was \"never designed\" for that purpose." },
              { n: 28, type: "tfng", prompt: "According to the passage, increased road accidents can cause GDP to rise.", answer: "TRUE", accept: ["TRUE"], note: "Para B: higher spending on care/repairs." },
              { n: 29, type: "tfng", prompt: "Unpaid caregiving work is currently included in GDP calculations in most developed countries.", answer: "FALSE", accept: ["FALSE"], note: "Para B: \"entirely invisible within GDP\"." },
              { n: 30, type: "tfng", prompt: "The Easterlin Paradox refers to the diminishing relationship between additional wealth and reported happiness above a certain threshold.", answer: "TRUE", accept: ["TRUE"], note: "Para C: explicitly defined." },
              { n: 31, type: "tfng", prompt: "New Zealand was the first country in the world to introduce the concept of Gross National Happiness.", answer: "FALSE", accept: ["FALSE"], note: "Para D: that was Bhutan." },
              { n: 32, type: "tfng", prompt: "The OECD's Better Life Index allows individuals to assign their own weights to different wellbeing dimensions.", answer: "TRUE", accept: ["TRUE"], note: "Para F: explicitly stated." },
              { n: 33, type: "tfng", prompt: "Kate Raworth argues that economies should operate within both a social foundation and an ecological ceiling.", answer: "TRUE", accept: ["TRUE"], note: "Para G: the \"doughnut\" concept." },
            ],
          },
          {
            instruction:
              "Questions 34–37 · Matching Information: Which paragraph (A–G) contains the following information? You may use any letter more than once.",
            kind: "matching",
            questions: [
              { n: 34, type: "matching", prompt: "An explanation of why GDP has practical advantages that alternative measures have found difficult to replicate.", answer: "E", accept: ["E"], note: "Standardised, frequent, comparable." },
              { n: 35, type: "matching", prompt: "A description of a budgeting system that prioritises defined wellbeing outcomes over economic growth targets.", answer: "D", accept: ["D"], note: "New Zealand Wellbeing Budget." },
              { n: 36, type: "matching", prompt: "An argument that the metrics used to evaluate economies influence the kinds of policies those economies pursue.", answer: "G", accept: ["G"], note: "Kate Raworth / \"doughnut\" paragraph." },
              { n: 37, type: "matching", prompt: "An account of how GDP fails to account for the permanent loss of natural resources.", answer: "B", accept: ["B"], note: "Forest / timber example." },
            ],
          },
          {
            instruction:
              "Questions 38–40 · Summary Completion: Complete the summary using NO MORE THAN TWO WORDS from the passage for each answer.",
            kind: "short",
            questions: [
              { n: 38, type: "short", prompt: "GDP was originally developed as a ____ (38) tool rather than a measure of societal wellbeing.", answer: "wartime accounting", accept: ["wartime accounting", "accounting", "wartime"], note: "Para A." },
              { n: 39, type: "short", prompt: "GDP ignores non-monetary contributions such as the work of ____ (39).", answer: "caregivers", accept: ["caregivers", "caregiver"], note: "Para B." },
              { n: 40, type: "short", prompt: "Economists argue policymakers should adopt a ____ (40) approach, using GDP alongside complementary indicators.", answer: "dashboard", accept: ["dashboard"], note: "Para F." },
            ],
          },
        ],
      },
    ],
  },
];

export function getReadingSet(id: string): ReadingSet | undefined {
  return READING_SETS.find((s) => s.id === id);
}
