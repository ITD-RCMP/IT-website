import React from "react";
import { Link, useLoaderData } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Check,
  GraduationCap,
  Star,
  type LucideIcon,
} from "lucide-react";
import Lottie from "lottie-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { Asterisk } from "@/components/Asterisk";
import { submitFeedback, type FeedbackQuestion } from "@/lib/feedback-api";
import {
  CATEGORIES,
  RATING_LABELS,
  SUGGESTION_QUESTION,
  type Category,
  type Ratings,
} from "@/lib/feedback";

const LOADING_MS = 1200;
const AUTO_ADVANCE_MS = 280;
const LOTTIE_SRC = "/Wow%20rate.json";

const CATEGORY_ICONS: Record<Category, { Icon: LucideIcon; bg: string; fg: string }> = {
  "Academic Staff": { Icon: BookOpen, bg: "bg-[#2F6BFF]", fg: "text-white" },
  "Non-Academic Staff": { Icon: Briefcase, bg: "bg-[#FF7A2F]", fg: "text-white" },
  Student: { Icon: GraduationCap, bg: "bg-[#FFD93D]", fg: "text-neutral-900" },
};

// One-tap answers for the suggestion step; people can still type their own.
const SUGGESTION_CHIPS = [
  "Very good services",
  "Keep up the good work",
  "Good Job",
  "Happy with the services",
  "Very Helpful",
  "Great support",
  "Excellent assistance",
];

const pad = (n: number) => String(n).padStart(2, "0");

function YellowStroke({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 300 30"
      preserveAspectRatio="none"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M4 24 C80 16 180 8 296 4"
        fill="none"
        stroke="#FFD93D"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-[6] md:stroke-[8]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
      />
    </svg>
  );
}

function StarRating({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (rating: number) => void;
  name: string;
}) {
  const [hovered, setHovered] = React.useState(0);
  const active = hovered || value;

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-center gap-1 sm:gap-3"
        role="radiogroup"
        aria-label={name}
        onMouseLeave={() => setHovered(0)}
      >
        {RATING_LABELS.map((label, i) => {
          const rating = i + 1;
          const filled = rating <= active;
          return (
            <motion.button
              key={label}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${rating} — ${label}`}
              onMouseEnter={() => setHovered(rating)}
              onFocus={() => setHovered(rating)}
              onBlur={() => setHovered(0)}
              onClick={() => onChange(rating)}
              whileHover={{ scale: 1.12, rotate: -6 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-2xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BD3]/40"
            >
              <Star
                className={`h-10 w-10 transition-colors sm:h-12 sm:w-12 ${
                  filled ? "fill-[#FFD93D] text-[#E5A200]" : "fill-transparent text-neutral-300"
                }`}
                strokeWidth={1.6}
              />
            </motion.button>
          );
        })}
      </div>
      <p className="min-h-[1.5rem] text-center font-mono text-[13px] text-neutral-500">
        {active ? RATING_LABELS[active - 1] : "Tap a star to rate"}
      </p>
    </div>
  );
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? "bg-[#2F5BD3]" : i === step ? "bg-neutral-900" : "bg-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

function PillButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center gap-3 rounded-full bg-neutral-950 py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {children}
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </button>
  );
}

function HomeButton() {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-3 rounded-full bg-neutral-950 py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-white transition hover:bg-neutral-800"
    >
      Back to home
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45">
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </Link>
  );
}

export default function FeedbackForm() {
  const { questions } = useLoaderData({ from: "/feedback" }) as { questions: FeedbackQuestion[] };
  const submit = useServerFn(submitFeedback);
  const totalSteps = questions.length + 2;
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [category, setCategory] = React.useState<Category | "">("");
  const [ratings, setRatings] = React.useState<Ratings>({});
  const [chips, setChips] = React.useState<string[]>([SUGGESTION_CHIPS[0]]);
  const [extraSuggestion, setExtraSuggestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [lottieData, setLottieData] = React.useState<object | null>(null);
  const loadingTimer = React.useRef<number | null>(null);
  const advanceTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch(LOTTIE_SRC)
      .then((res) => res.json())
      .then((data) => {
        if (active) setLottieData(data);
      })
      .catch(() => {
        if (active) setLottieData(null);
      });
    return () => {
      active = false;
      if (loadingTimer.current) window.clearTimeout(loadingTimer.current);
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const isCategoryStep = step === 0;
  const isSuggestionsStep = step === totalSteps - 1;
  const questionIndex = step - 1;
  const suggestion = [...chips, extraSuggestion.trim()].filter(Boolean).join(". ");

  const goTo = (next: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setError("");
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const advanceSoon = (next: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goTo(next), AUTO_ADVANCE_MS);
  };

  const handleSubmit = async () => {
    if (!suggestion) {
      setError("Tap a suggestion or write one before submitting.");
      return;
    }

    const orderedRatings = questions.map((_, index) => ratings[index] ?? 0);
    const firstMissing = orderedRatings.findIndex((rating) => rating < 1);
    if (firstMissing >= 0) {
      goTo(firstMissing + 1);
      setError("Please answer this question.");
      return;
    }

    setError("");
    setLoading(true);
    const started = Date.now();

    try {
      const result = await submit({
        data: {
          category: category as Category,
          suggestion,
          ratings: orderedRatings,
        },
      });

      const wait = Math.max(LOADING_MS - (Date.now() - started), 0);
      loadingTimer.current = window.setTimeout(() => {
        setLoading(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSubmitted(true);
      }, wait);
    } catch {
      setLoading(false);
      setError("Unable to submit feedback. Please try again.");
    }
  };

  const handleCategory = (c: Category) => {
    setError("");
    setCategory(c);
    advanceSoon(1);
  };

  const handleRating = (rating: number) => {
    setError("");
    setRatings((prev) => ({ ...prev, [questionIndex]: rating }));
    advanceSoon(step + 1);
  };

  const toggleChip = (chip: string) => {
    setError("");
    setChips((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));
  };

  // Continue is only needed to move forward past an already answered step.
  const canSkipForward = isCategoryStep ? Boolean(category) : Boolean(ratings[questionIndex]);

  let content: React.ReactNode;
  if (questions.length === 0) {
    content = (
      <div className="text-center">
        <Asterisk className="mx-auto w-12 text-[#7B61FF]" />
        <h1 className="mt-8 font-heading text-4xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-5xl">
          Feedback unavailable
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
          There are no questions configured right now. Please check back later.
        </p>
        <div className="mt-8">
          <HomeButton />
        </div>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="flex flex-col items-center gap-4">
        <div className="mx-auto w-full max-w-xs">
          {lottieData ? (
            <Lottie animationData={lottieData} loop autoplay />
          ) : (
            <div className="mx-auto h-40 w-40 animate-pulse rounded-full bg-neutral-200" />
          )}
        </div>
        <p className="font-mono text-[13px] text-neutral-500">Submitting your feedback…</p>
      </div>
    );
  } else if (submitted) {
    content = (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Asterisk className="mx-auto w-12 text-[#7B61FF]" />
        <h1 className="mt-8 font-heading text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-none tracking-[-0.04em] text-neutral-950">
          <span className="relative inline-block">
            Thank you
            <YellowStroke className="absolute -bottom-[0.2em] left-[-4%] h-[0.28em] w-[108%]" />
          </span>
        </h1>
        <p className="mx-auto mt-10 max-w-md text-[15px] leading-7 text-neutral-600 md:text-lg md:leading-8">
          Your feedback has been received. We'll use it to make our IT services better for everyone.
        </p>
        <div className="mt-10">
          <HomeButton />
        </div>
      </motion.div>
    );
  } else {
    content = (
      <>
        <div className="mb-10 space-y-3">
          <div className="flex items-center justify-between font-mono text-[13px] text-neutral-500">
            <span>
              Step {pad(step + 1)} / {pad(totalSteps)}
            </span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <StepDots step={step} total={totalSteps} />
        </div>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {isCategoryStep ? (
              <div>
                <h1 className="font-heading text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1] tracking-[-0.035em] text-neutral-950">
                  Who are{" "}
                  <span className="relative inline-block">
                    you?
                    <YellowStroke className="absolute -bottom-[0.18em] left-[-4%] h-[0.28em] w-[108%]" />
                  </span>
                </h1>
                <p className="mt-6 text-[15px] leading-7 text-neutral-600">
                  Tap the one that describes you best.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {CATEGORIES.map((c) => {
                    const selected = category === c;
                    const { Icon, bg, fg } = CATEGORY_ICONS[c];
                    return (
                      <motion.button
                        key={c}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => handleCategory(c)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-4 rounded-[24px] border bg-white p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition sm:flex-col sm:items-start sm:p-4 ${
                          selected
                            ? "border-[#2F5BD3] ring-2 ring-[#2F5BD3]/20"
                            : "border-neutral-200/70 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
                        }`}
                      >
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}
                        >
                          <Icon className={`h-6 w-6 ${fg}`} strokeWidth={2.2} />
                        </span>
                        <span className="flex flex-1 items-center justify-between gap-2 sm:w-full">
                          <span className="font-heading text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                            {c}
                          </span>
                          {selected ? (
                            <Check className="h-5 w-5 text-[#2F5BD3]" strokeWidth={2.6} />
                          ) : null}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!isCategoryStep && !isSuggestionsStep ? (
              <div className="rounded-[28px] border border-neutral-200/70 bg-white px-5 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-10 sm:py-12">
                <p className="font-mono text-[13px] text-[#2F5BD3]">
                  Question {pad(questionIndex + 1)}
                </p>
                <h1 className="mt-3 font-heading text-2xl font-semibold leading-snug tracking-[-0.025em] text-neutral-950 sm:text-3xl">
                  {questions[questionIndex]?.question}
                </h1>
                <div className="mt-10">
                  <StarRating
                    name={`question-${questionIndex + 1}`}
                    value={ratings[questionIndex] ?? 0}
                    onChange={handleRating}
                  />
                </div>
              </div>
            ) : null}

            {isSuggestionsStep ? (
              <div className="rounded-[28px] border border-neutral-200/70 bg-white px-5 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:px-10 sm:py-10">
                <p className="font-mono text-[13px] text-[#2F5BD3]">Last step</p>
                <h1 className="mt-3 font-heading text-2xl font-semibold leading-snug tracking-[-0.025em] text-neutral-950 sm:text-3xl">
                  {SUGGESTION_QUESTION}
                </h1>
                <p className="mt-3 text-sm text-neutral-500">
                  Tap any that apply, or add your own below.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.map((chip) => {
                    const selected = chips.includes(chip);
                    return (
                      <motion.button
                        key={chip}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleChip(chip)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          selected
                            ? "bg-[#2F5BD3] text-white"
                            : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                        }`}
                      >
                        {selected ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                        {chip}
                      </motion.button>
                    );
                  })}
                </div>
                <textarea
                  id="suggestions"
                  rows={3}
                  value={extraSuggestion}
                  onChange={(e) => {
                    setError("");
                    setExtraSuggestion(e.target.value);
                  }}
                  className="mt-6 w-full resize-y rounded-2xl border border-neutral-200 bg-[#FAFAF8] px-4 py-3 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#2F5BD3] focus:ring-2 focus:ring-[#2F5BD3]/20"
                  placeholder="Anything else? (optional)"
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p className="mt-6 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-full bg-neutral-100 py-2.5 pl-3.5 pr-5 text-[15px] font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          {isSuggestionsStep ? (
            <PillButton onClick={() => void handleSubmit()}>Submit feedback</PillButton>
          ) : canSkipForward ? (
            <PillButton onClick={() => goTo(step + 1)}>Continue</PillButton>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAF8] text-neutral-900">
      <HomeNavbar />
      <Asterisk className="absolute right-[6%] top-36 hidden w-10 text-[#7B61FF] lg:block" />

      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-3xl flex-col justify-center px-6 pb-16 pt-32 md:pt-36">
        {content}
      </section>

    </main>
  );
}
