import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MESA_REDONDA_URL = "/mesa-redonda-avalon.jpeg";
const BANNER_CORONAS_URL = "/banner-coronas.png";

export const Route = createFileRoute("/")({
  component: AvalonPage,
});

type SectionId = "contexto" | "identidades" | "fases" | "regla" | "video";

const SECTIONS: { id: SectionId; label: string; roman: string }[] = [
  { id: "contexto", label: "El Contexto", roman: "I" },
  { id: "identidades", label: "Identidades Secretas", roman: "II" },
  { id: "fases", label: "Las Fases", roman: "III" },
  { id: "regla", label: "Regla de Oro", roman: "IV" },
  { id: "video", label: "Onboarding en vídeo", roman: "V" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: "smooth" });
}

/* ---------------- BRAND HELPERS ---------------- */
function Braun() {
  return <span className="braun-glow">B.&nbsp;Braun</span>;
}
function BrandB() {
  return <span className="braun-glow">B</span>;
}

function AvalonPage() {
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState<SectionId>("contexto");
  const [revealed, setRevealed] = useState(0);
  const [oathTaken, setOathTaken] = useState(false);
  const [mesaSeen, setMesaSeen] = useState(false);

  // Si el usuario resetea el progreso subiendo por encima del Juramento,
  // también se retira la Mesa Redonda del flujo del documento.
  useEffect(() => {
    if (revealed === 0) setMesaSeen(false);
  }, [revealed]);

  const contentRef = useRef<HTMLDivElement>(null);
  const suppressCollapseRef = useRef(false);

  const suppressCollapse = (ms = 1200) => {
    suppressCollapseRef.current = true;
    window.setTimeout(() => {
      suppressCollapseRef.current = false;
    }, ms);
  };

  const enter = () => {
    setEntered(true);
    suppressCollapse(1500);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  const revealNext = (fromIndex: number) => {
    suppressCollapse(1500);
    setRevealed((r) => Math.max(r, fromIndex + 1));
    setTimeout(() => {
      const nextSection = SECTIONS[fromIndex + 1];
      if (nextSection) {
        scrollToId(nextSection.id);
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }, 80);
  };

  // Section active tracking
  useEffect(() => {
    if (!entered) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [entered, revealed]);

  // GLOBAL SCROLL LOCK: solo se resetea si el usuario sobrepasa hacia arriba
  // el "punto de no retorno" (parte superior del Juramento). Mientras esté
  // por debajo, puede subir libremente a ver la Mesa Redonda / el Juramento.
  useEffect(() => {
    if (!entered || revealed <= 0) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const goingUp = y < lastY;
      lastY = y;
      if (suppressCollapseRef.current) return;
      if (!goingUp) return;

      // Regla estricta para capítulos 2+ (fases, regla, ...): si el usuario
      // sube por encima del capítulo actualmente revelado (su parte superior
      // queda por debajo del viewport), lo colapsamos inmediatamente.
      if (revealed >= 2) {
        const currentSection = SECTIONS[revealed];
        const current = currentSection ? document.getElementById(currentSection.id) : null;
        if (current) {
          const r = current.getBoundingClientRect();
          if (r.top > window.innerHeight) {
            setRevealed((v) => Math.max(1, v - 1));
            return;
          }
        }
      }

      // Zona segura: Juramento -> Mesa Redonda -> Identidades.
      // Solo colapsamos Identidades (revealed=1 -> 0) si el usuario sube
      // por encima del Juramento (punto de no retorno).
      const threshold = document.getElementById("juramento-threshold");
      if (!threshold) return;
      const rect = threshold.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        setRevealed((r) => Math.max(0, r - 1));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [entered, revealed]);


  const allRevealed = revealed >= SECTIONS.length - 1;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <Hero onEnter={enter} />

      {entered && (
        <>
          <Nav active={active} revealed={revealed} />
          <div ref={contentRef} className="relative z-10 animate-fade-in">
            {revealed >= 0 && (
              <section id="contexto" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24 animate-fade-up">
                <Contexto />
                <div id="juramento-threshold">
                  {revealed === 0 ? (
                    <OathGate onSworn={() => setOathTaken(true)} />
                  ) : (
                    <NextChapter fromIndex={0} onReveal={revealNext} />
                  )}
                </div>
              </section>
            )}
            {mesaSeen && revealed >= 1 && (
              <figure className="mx-auto my-8 max-w-6xl px-5 animate-fade-up">
                <div className="relative overflow-hidden rounded-sm border border-gold/30 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
                  <img
                    src={MESA_REDONDA_URL}
                    alt="La Mesa Redonda de Avalon"
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
                    }}
                  />
                </div>
                <figcaption className="mt-3 text-center font-display text-xs uppercase tracking-[0.35em] text-gold/70">
                  La Mesa Redonda de Avalon
                </figcaption>
              </figure>
            )}
            {revealed >= 1 && (
              <section id="identidades" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24 animate-fade-up">
                <Identidades />
                <NextChapter fromIndex={1} onReveal={revealNext} />
              </section>
            )}
            {revealed >= 2 && (
              <section id="fases" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24 animate-fade-up">
                <Fases />
                <NextChapter fromIndex={2} onReveal={revealNext} />
              </section>
            )}
            {revealed >= 3 && (
              <section id="regla" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24 animate-fade-up">
                <ReglaOro />
                <NextChapter fromIndex={3} onReveal={revealNext} />
              </section>
            )}
            {revealed >= 4 && (
              <section id="video" className="scroll-mt-24 animate-fade-up">
                <VideoCTA />
                <BackToTop />
                <Footer />
              </section>
            )}
          </div>
          <FloatingPlay />
          {oathTaken && !mesaSeen && (
            <MesaRedondaOverlay
              onContinue={() => {
                setMesaSeen(true);
                setOathTaken(false);
                revealNext(0);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}

/* ---------------- OATH GATE (checkbox) ---------------- */
function OathGate({ onSworn }: { onSworn: () => void }) {
  const [checked, setChecked] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    if (e.target.checked) {
      setTimeout(onSworn, 350);
    }
  };
  return (
    <div className="mt-12 flex justify-center">
      <label
        className={`group flex max-w-xl cursor-pointer items-start gap-4 rounded-sm border p-6 transition-all ${
          checked
            ? "border-gold bg-gold/10 shadow-[0_0_40px_-10px_var(--gold-glow)]"
            : "border-gold/40 bg-black/40 hover:border-gold/70 hover:bg-gold/5"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--gold)]"
          aria-label="Aceptar el juramento"
        />
        <span className="font-display leading-relaxed text-parchment/90 md:text-base">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.35em] text-gold/70">
            JURAMENTO OBLIGATORIO
          </span>
          Soy consciente de que entre mis compañeros acechan traidores y asumo el riesgo de sentarme a esta mesa
        </span>
      </label>
    </div>
  );
}

/* ---------------- MESA REDONDA FULLSCREEN OVERLAY ---------------- */
function MesaRedondaOverlay({ onContinue }: { onContinue: () => void }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setShowButton(true), 3000);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in bg-black">
      <img
        src={MESA_REDONDA_URL}
        alt="La Mesa Redonda de Avalon"
        className="h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <button
        onClick={onContinue}
        className={`fixed bottom-8 right-8 z-[61] inline-flex items-center gap-3 rounded-full border-2 border-gold bg-black/80 py-4 pl-5 pr-6 font-display text-xs uppercase tracking-[0.25em] text-gold backdrop-blur-md transition-all duration-700 hover:bg-gold/15 hover:shadow-[0_0_60px_-10px_var(--gold-glow)] md:text-sm ${
          showButton
            ? "translate-y-0 opacity-100 animate-pulse-glow"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold">
          <SwordIcon className="h-4 w-4" />
        </span>
        Conoce tu identidad secreta
      </button>
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-32 md:pt-40">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(40,30,15,0.35) 0%, rgba(0,0,0,0.85) 70%, #000 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-6 animate-fade-up text-xs uppercase tracking-[0.5em] text-gold/70 md:text-sm">
          ⚜  Bretaña  ·  Anno Domini MMXXV  ⚜
        </p>
        <h1
          className="font-display text-7xl font-black leading-none tracking-tight sm:text-8xl md:text-[10rem]"
          style={{ animation: "fade-up 1s cubic-bezier(0.2,0.8,0.2,1) both" }}
        >
          <span className="gold-text animate-flicker">AVALON</span>
        </h1>
        <p
          className="mx-auto mt-8 max-w-2xl font-display text-xl italic text-parchment/80 md:text-2xl"
          style={{ animation: "fade-up 1.2s 0.3s cubic-bezier(0.2,0.8,0.2,1) both" }}
        >
          El mal se propaga en <Braun />…
        </p>
        <p
          className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground md:text-lg"
          style={{ animation: "fade-up 1.2s 0.5s cubic-bezier(0.2,0.8,0.2,1) both" }}
        >
          El joven rey Pendragon representa el futuro de Bretaña: prosperidad, honor y una lista infinita de candidatos ideales inscritos en SuccessFactors con un Time to Fill récord. Pero las apariencias engañan. La lealtad no se demuestra en las reuniones del lunes; se demuestra entre las sombras.
        </p>

        <button
          onClick={onEnter}
          className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-sm border border-gold/60 bg-black/40 px-10 py-5 font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur transition-all hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_60px_-10px_var(--gold-glow)] md:text-base"
          style={{ animation: "fade-up 1.2s 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
        >
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          />
          <SwordIcon className="h-5 w-5" />
          Jurar lealtad (y empezar)
          <SwordIcon className="h-5 w-5 scale-x-[-1]" />
        </button>

        <div className="mt-16 flex justify-center">
          <div className="h-16 w-px animate-pulse bg-gradient-to-b from-gold/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- NAV (sticky) ---------------- */
function Nav({ active, revealed }: { active: SectionId; revealed: number }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-gold/20 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-lg font-bold tracking-widest gold-text"
        >
          AVALON
        </button>
        <ul className="flex flex-wrap items-center gap-1 md:gap-2">
          {SECTIONS.map((s, idx) => {
            const isActive = active === s.id;
            const isLocked = idx > revealed;
            return (
              <li key={s.id}>
                <button
                  onClick={() => !isLocked && scrollToId(s.id)}
                  disabled={isLocked}
                  className={`group relative px-3 py-2 font-display text-xs uppercase tracking-widest transition-colors md:px-5 md:text-sm ${
                    isLocked
                      ? "cursor-not-allowed text-muted-foreground/30"
                      : isActive
                        ? "text-gold"
                        : "text-muted-foreground hover:text-parchment"
                  }`}
                >
                  <span className="mr-2 text-gold/50">{isLocked ? "🔒" : `${s.roman}.`}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(" ")[0]}</span>
                  {isActive && !isLocked && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* ---------------- NEXT CHAPTER BUTTON ---------------- */
function NextChapter({ fromIndex, onReveal }: { fromIndex: number; onReveal: (fromIndex: number) => void }) {
  const next = SECTIONS[fromIndex + 1];
  const isLast = !next;
  const isVideo = next?.id === "video";
  const handleClick = () => {
    onReveal(fromIndex);
  };
  return (
    <div className="mt-16 flex justify-center">
      <button
        onClick={handleClick}
        className="group relative inline-flex items-center gap-4 overflow-hidden rounded-sm border-2 border-gold/60 bg-gradient-to-br from-gold/10 via-black to-gold/5 px-8 py-5 font-display text-sm font-bold uppercase tracking-[0.25em] text-gold transition-all hover:border-gold hover:shadow-[0_0_50px_-10px_var(--gold-glow)] md:px-12 md:py-6 md:text-base"
      >
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
        />
        <span className="flex flex-col items-start text-left">
          <span className="text-[10px] tracking-[0.4em] text-gold/60">
            {isLast ? "Final" : isVideo ? "Última puerta" : `Capítulo ${next.roman}`}
          </span>
          <span className="mt-1 gold-text text-base md:text-lg">
            {isLast ? "ONBOARDING EN VÍDEO" : isVideo ? "Ver vídeo de onboarding" : `Siguiente: ${next.label}`}
          </span>
        </span>
        <ArrowDownIcon className="h-6 w-6 transition-transform group-hover:translate-y-1" />
      </button>
    </div>
  );
}

/* ---------------- SECTION SHELL ---------------- */
function SectionTitle({ roman, title, subtitle }: { roman: string; title: string; subtitle?: string }) {
  return (
    <header className="mb-14 text-center animate-fade-up">
      <div className="mb-3 flex items-center justify-center gap-4 text-gold/70">
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
        <span className="font-display text-xs uppercase tracking-[0.4em]">Capítulo {roman}</span>
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
      </div>
      <h2 className="font-display text-4xl font-bold md:text-6xl">
        <span className="gold-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl font-display italic text-parchment/70 md:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  );
}

function Scroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`parchment ornate-border rounded-sm p-8 md:p-12 ${className}`}>
      {children}
    </div>
  );
}

/* ---------------- SECTION 1 ---------------- */
function Contexto() {
  return (
    <div className="animate-fade-up">
      <SectionTitle roman="I" title="La Sombra de Mordred en Talent" subtitle="La lucha entre el Bien y el Mal por evitar la alta rotación." />
      <Scroll className="space-y-6 leading-relaxed text-parchment/90 md:text-lg">
        <p>
          El rey Arturo busca forjar la <em className="text-gold">empresa perfecta</em>, pero entre los leales caballeros de Selección que se dejan la piel cribando en LinkedIn y SuccessFactors, se esconden los despiadados <span className="text-crimson font-semibold">esbirros de Mordred</span>. Las fuerzas del mal son escasas, pero se conocen perfectamente y saben permanecer ocultas, sin que nadie sospeche de ellas.
        </p>
        <p>
          Su único objetivo es sembrar el caos: alargar los procesos de selección, hacer <em>ghosting</em> masivo, rechazar ofertas firmadas y hacer que la rotación alcance límites críticos. Nuestra misión hoy no es solo sobrevivir a las reuniones; es <span className="text-gold font-semibold">identificar a los traidores</span> antes de que arruinen nuestras contrataciones.
        </p>
        <div className="my-8 border-l-2 border-crimson/60 bg-crimson/5 px-6 py-4">
          <p className="mb-1 font-display text-xs uppercase tracking-widest text-crimson">Advertencia corporativa</p>
          <p className="italic text-parchment/90">
            Desconfiad de todo el mundo. El compañero que te ha traído un café amablemente esta mañana podría estar planeando sabotear tu cierre. Aquí no importan los departamentos ni la antigüedad en <Braun />; solo importa <strong className="text-parchment">sobrevivir a la traición</strong>.
          </p>
        </div>
      </Scroll>
    </div>
  );
}

/* ---------------- SECTION 2 ---------------- */
type Character = {
  name: string;
  role: string;
  side: "good" | "evil";
  short: string;
  long: React.ReactNode;
  emoji: string;
};

const CHARACTERS: Character[] = [
  {
    name: "Paladines Leales",
    role: "Recruiters de a pie",
    side: "good",
    emoji: "🛡️",
    short: "Los que pican piedra cada día.",
    long: "Redactan ofertas impecables, llaman a decenas de candidatos y cruzan los dedos para que se presenten a la entrevista. Luchan permanentemente por el bien, el honor… y por sus KPIs.",
  },
  {
    name: "Merlín",
    role: "El Senior del equipo",
    side: "good",
    emoji: "🧙",
    short: "Sabe quién miente. Sabe quién es un dolor de cabeza.",
    long: "Conoce a los agentes del mal desde el principio, pero solo puede hablar con enigmas. Si revela su identidad o es demasiado obvio, los malos pedirán su cabeza y todo habrá terminado.",
  },
  {
    name: "Esbirros de Mordred",
    role: "Hiring Managers tóxicos",
    side: "evil",
    emoji: "👹",
    short: "Te piden un unicornio y te cambian los requisitos.",
    long: (
      <>
        Cuando les presentas al candidato perfecto tras meses de búsqueda, cambian la vacante o directamente desaparecen. Parece que lleven la <BrandB /> por bandera… pero boicotean desde dentro.
      </>
    ),
  },
  {
    name: "El Asesino",
    role: "El Candidato Fantasma",
    side: "evil",
    emoji: "🗡️",
    short: "El terror de Recursos Humanos.",
    long: "Pasa todas las entrevistas, todo es maravilloso, acepta las condiciones verbalmente… y el viernes a las 17:00h manda un email: «He aceptado otra oferta». Si al final identifica quién es Merlín, gana la partida.",
  },
];

function Identidades() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIdx]);

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        <SectionTitle
          roman="II"
          title="Identidades Secretas"
          subtitle="Al inicio de la partida, cada jugador recibe una identidad. NO reveles tu carta ni hagas alusiones directas al personaje."
        />
        <img
          src={BANNER_CORONAS_URL}
          alt="Estandarte con tres coronas de Avalon"
          className="mx-auto w-40 md:w-56 lg:w-64 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
          loading="lazy"
        />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {CHARACTERS.map((c, i) => (
          <CardFront key={c.name} character={c} delay={i * 100} onOpen={() => setOpenIdx(i)} />
        ))}
      </div>

      {openIdx !== null && (
        <CardModal character={CHARACTERS[openIdx]} onClose={() => setOpenIdx(null)} />
      )}
    </div>
  );
}

function CardFront({
  character,
  delay,
  onOpen,
}: {
  character: Character;
  delay: number;
  onOpen: () => void;
}) {
  const isGood = character.side === "good";
  return (
    <div
      className="h-80 cursor-pointer animate-fade-up transition-transform hover:scale-[1.02]"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      role="button"
      tabIndex={0}
      aria-label={`Revelar ficha de ${character.name}`}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-sm border p-8 text-center ${
          isGood
            ? "border-royal/50 bg-gradient-to-br from-royal/20 via-black to-black shadow-[inset_0_0_60px_rgba(59,80,180,0.15)]"
            : "border-crimson/50 bg-gradient-to-br from-crimson/25 via-black to-black shadow-[inset_0_0_60px_rgba(160,30,30,0.2)]"
        }`}
      >
        <div className="text-6xl md:text-7xl">{character.emoji}</div>
        <h3 className="mt-4 font-display text-2xl font-bold gold-text md:text-3xl">{character.name}</h3>
        <p className={`mt-2 font-display text-sm md:text-base font-semibold uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isGood ? "text-sky-300" : "text-rose-300"}`}>
          {isGood ? "Del lado del Bien" : "Del lado del Mal"}
        </p>
        <p className="mt-4 italic text-parchment/70">{character.short}</p>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
          ▸ Haz clic para revelar
        </p>
      </div>
    </div>
  );
}

function CardModal({ character, onClose }: { character: Character; onClose: () => void }) {
  const isGood = character.side === "good";
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="animate-fade-in bg-black/90 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${character.name}`}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar ficha"
        style={{ position: "fixed", top: 20, right: 20, zIndex: 10000 }}
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/60 bg-black/70 text-gold transition-all hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_40px_-10px_var(--gold-glow)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-sm border-2 p-10 text-center animate-scale-in md:p-14 ${
          isGood
            ? "border-royal bg-gradient-to-br from-black via-royal/15 to-black shadow-[0_0_80px_-10px_rgba(59,80,180,0.6)]"
            : "border-crimson bg-gradient-to-br from-black via-crimson/20 to-black shadow-[0_0_80px_-10px_rgba(200,40,40,0.6)]"
        }`}
      >
        <div className="text-7xl md:text-8xl">{character.emoji}</div>
        <p className={`mt-6 font-display text-sm md:text-base font-semibold uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isGood ? "text-sky-300" : "text-rose-300"}`}>
          {character.role} · {isGood ? "Del lado del Bien" : "Del lado del Mal"}
        </p>
        <h3 className="mt-2 font-display text-4xl font-bold gold-text md:text-5xl">
          {character.name}
        </h3>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-parchment/90 md:text-xl">
          {character.long}
        </p>
        <button
          onClick={onClose}
          className="mt-10 inline-flex items-center gap-3 rounded-sm border border-gold/60 bg-black/40 px-8 py-4 font-display text-xs uppercase tracking-[0.3em] text-gold transition-all hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_40px_-10px_var(--gold-glow)]"
        >
          Volver a las cartas
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- SECTION 3 ---------------- */
function Fases() {
  return (
    <div className="animate-fade-up">
      <SectionTitle roman="III" title="Las Fases del Juego" subtitle="Cada ronda es una prueba de confianza." />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Scroll>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 font-display text-xl font-bold text-gold">1</span>
            <h3 className="font-display text-2xl font-bold gold-text md:text-3xl">Formación del Equipo</h3>
          </div>
          <p className="mb-5 text-parchment/85">
            Un <span className="text-gold">Líder</span> (rotativo) selecciona a los jugadores que le gustaría tener en el equipo para la gesta. Después, todos eligen en secreto un indicador de voto y los revelan a la vez para <em>aprobar</em> o <em>rechazar</em> la propuesta.
          </p>
          <div className="mb-6 flex items-center justify-center gap-6">
            <VoteToken kind="approve" />
            <span className="font-display text-2xl text-gold/40">vs</span>
            <VoteToken kind="reject" />
          </div>
          <div className="border-l-2 border-crimson/60 bg-crimson/5 px-5 py-3">
            <p className="font-display text-xs uppercase tracking-widest text-crimson">Regla crítica</p>
            <p className="mt-1 italic text-parchment/90">
              Si se rechazan <strong>5 equipos consecutivos</strong>, el mal gana la partida. ¡Cuidado con la parálisis por análisis!
            </p>
          </div>
        </Scroll>

        <Scroll>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 font-display text-xl font-bold text-gold">2</span>
            <h3 className="font-display text-2xl font-bold gold-text md:text-3xl">Ejecución de la Gesta</h3>
          </div>
          <p className="mb-5 text-parchment/85">
            Si el equipo es aprobado, sus miembros juegan en secreto una carta de gesta.
          </p>
          <ul className="mb-6 space-y-2 text-parchment/90">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-royal shadow-[0_0_10px_var(--royal)]" />
              Los jugadores del <strong className="text-royal">Bien</strong> siempre deben jugar «Éxito».
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-crimson shadow-[0_0_10px_var(--crimson)]" />
              Los esbirros del <strong className="text-crimson">Mal</strong> pueden jugar «Éxito» o «Fracaso».
            </li>
          </ul>
          <div className="border-l-2 border-gold/60 bg-gold/5 px-5 py-3">
            <p className="italic text-parchment/90">
              Para que la gesta triunfe, <strong>todas</strong> las cartas deben ser de éxito. Una sola carta de fracaso arruina todo.
            </p>
          </div>
        </Scroll>
      </div>

      <div className="mt-12">
        <p className="mb-6 text-center font-display text-xs uppercase tracking-[0.4em] text-gold/70">
          Marcador de gestas · 3 victorias del Bien · 3 fracasos del Mal
        </p>
        <div className="flex items-center justify-center gap-3 md:gap-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 bg-gradient-to-br from-earth/40 to-black font-display text-lg font-bold text-gold/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] md:h-20 md:w-20 md:text-2xl"
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoteToken({ kind }: { kind: "approve" | "reject" }) {
  const approve = kind === "approve";
  return (
    <div
      className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 font-display text-xs font-bold uppercase tracking-widest transition-transform hover:scale-110 md:h-28 md:w-28 ${
        approve
          ? "border-royal bg-gradient-to-br from-royal/40 to-black text-parchment shadow-[0_0_25px_rgba(59,80,180,0.5)]"
          : "border-crimson bg-gradient-to-br from-crimson/50 to-black text-parchment shadow-[0_0_25px_rgba(160,30,30,0.6)]"
      }`}
    >
      <span className="text-3xl">{approve ? "✓" : "✕"}</span>
      <span className="mt-1 text-[10px]">{approve ? "Aprobar" : "Rechazar"}</span>
    </div>
  );
}

/* ---------------- SECTION 4 ---------------- */
function ReglaOro() {
  return (
    <div className="animate-fade-up">
      <SectionTitle roman="IV" title="La Regla de Oro" subtitle="Hablar es la mejor manera de atrapar a los traidores en su propia red de mentiras." />
      <Scroll className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gradient-to-br from-gold/30 to-black shadow-[0_0_40px_var(--gold-glow)]">
          <ScaleIcon className="h-10 w-10 text-gold" />
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-parchment/90 md:text-xl">
          En Avalon, los jugadores pueden decir <em className="text-gold">lo que quieran</em> y <em className="text-gold">cuando quieran</em>. La discusión, el engaño, la intuición y la interacción social son tan importantes como la lógica.
        </p>
        <div className="mx-auto mt-8 max-w-2xl border-y border-gold/30 py-6">
          <p className="font-display text-xl italic text-parchment md:text-2xl">
            «Mentir no solo está permitido: es <span className="text-crimson">necesario</span> si estás del lado de Mordred.»
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-parchment/80 md:text-lg">
          Olvidad el protocolo, analizad cada mirada y, sobre todo, <strong className="gold-text">no confiéis en nadie</strong>.
        </p>
      </Scroll>
    </div>
  );
}

/* ---------------- VIDEO CTA ---------------- */
function VideoCTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-sm border border-gold/40 bg-gradient-to-br from-royal/10 via-black to-crimson/10 p-10 text-center md:p-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(200,160,60,0.25), transparent 50%), radial-gradient(circle at 70% 50%, rgba(160,30,30,0.2), transparent 50%)",
          }}
        />
        <div className="relative">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.4em] text-gold/70">
            Antes de sentarte a la mesa redonda
          </p>
          <h3 className="font-display text-3xl font-bold md:text-5xl">
            <span className="gold-text">pasa por acogida</span>
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-parchment/70">
            Los croissants son tentadores, sí... pero olvídate del desayuno y deja que el equipo de RRHH te explique las reglas, ejemplos y todos los trucos para no acabar decapitado en la primera ronda.
          </p>
          <a
            href="https://www.youtube.com/watch?v=qglk6c-cXvg&pp=ygURYXZhbG9uIGNvbW8ganVnYXI%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-4 rounded-sm border-2 border-crimson bg-crimson/20 px-8 py-5 font-display text-sm font-bold uppercase tracking-[0.25em] text-parchment transition-all hover:bg-crimson/40 hover:shadow-[0_0_60px_rgba(200,40,40,0.6)] md:text-base animate-pulse-glow"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-crimson transition-transform group-hover:scale-110">
              <PlayIcon className="h-5 w-5 translate-x-0.5" />
            </span>
            TUTORIAL DE ACOGIDA
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FLOATING PLAY ---------------- */
function FloatingPlay() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a
      href="https://www.youtube.com/watch?v=qglk6c-cXvg&pp=ygURYXZhbG9uIGNvbW8ganVnYXI%3D"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver tutorial en YouTube"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-crimson bg-black/80 py-3 pl-3 pr-5 backdrop-blur-md transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      } hover:border-gold hover:shadow-[0_0_40px_rgba(200,40,40,0.6)]`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson text-parchment shadow-[0_0_20px_rgba(200,40,40,0.8)] animate-pulse-glow">
        <PlayIcon className="h-4 w-4 translate-x-0.5" />
      </span>
      <span className="hidden font-display text-xs uppercase tracking-widest text-parchment md:inline">
        Tutorial
      </span>
    </a>
  );
}

/* ---------------- FOOTER ---------------- */
function BackToTop() {
  return (
    <div className="flex justify-center py-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-2 font-display text-[10px] uppercase tracking-[0.35em] text-gold/80 backdrop-blur transition-all hover:border-gold hover:text-gold hover:shadow-[0_0_30px_-10px_var(--gold-glow)]"
        aria-label="Volver arriba"
      >
        <ArrowDownIcon className="h-3 w-3 rotate-180 transition-transform group-hover:-translate-y-0.5" />
        Volver arriba
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gold/20 py-10 text-center">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-gold/50">
        ⚜  Talent Acquisition · <Braun />  ⚜
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Que la Dama del Lago guíe tus cierres.
      </p>
    </footer>
  );
}

/* ---------------- ICONS ---------------- */
function SwordIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
    </svg>
  );
}
function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function ScaleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M6 8h12" />
      <path d="M6 8l-3 6a3 3 0 006 0z" />
      <path d="M18 8l-3 6a3 3 0 006 0z" />
    </svg>
  );
}
function ArrowDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14" />
      <path d="M5 12l7 7 7-7" />
    </svg>
  );
}
