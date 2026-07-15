
export const Route = createFileRoute("/")({
  component: AvalonPage,
});

const YOUTUBE_URL =
  "https://www.youtube.com/watch?v=qglk6c-cXvg&pp=ygURYXZhbG9uIGNvbW8ganVnYXI%3D";

type SectionId = "contexto" | "identidades" | "fases" | "regla";

const SECTIONS: { id: SectionId; label: string; roman: string }[] = [
  { id: "contexto", label: "El Contexto", roman: "I" },
  { id: "identidades", label: "Identidades Secretas", roman: "II" },
  { id: "fases", label: "Las Fases", roman: "III" },
  { id: "regla", label: "Regla de Oro", roman: "IV" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: "smooth" });
}

function AvalonPage() {
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState<SectionId>("contexto");
  const contentRef = useRef<HTMLDivElement>(null);

  const enter = () => {
    setEntered(true);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  // Scrollspy
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
  }, [entered]);

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
          <Nav active={active} />
          <div ref={contentRef} className="relative z-10 animate-fade-in">
            <section id="contexto" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24">
              <Contexto />
              <NextChapter fromIndex={0} />
            </section>
            <section id="identidades" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24">
              <Identidades />
              <NextChapter fromIndex={1} />
            </section>
            <section id="fases" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24">
              <Fases />
              <NextChapter fromIndex={2} />
            </section>
            <section id="regla" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24">
              <ReglaOro />
              <NextChapter fromIndex={3} />
            </section>
            <VideoCTA />
            <Footer />
          </div>
          <FloatingPlay />
        </>
      )}
    </main>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
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
          <span className="gold-text animate-flicker">ÁVALON</span>
        </h1>
        <p
          className="mx-auto mt-8 max-w-2xl font-display text-xl italic text-parchment/80 md:text-2xl"
          style={{ animation: "fade-up 1.2s 0.3s cubic-bezier(0.2,0.8,0.2,1) both" }}
        >
          El mal se propaga en B. Braun…
        </p>
        <p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
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
function Nav({ active }: { active: SectionId }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-gold/20 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-lg font-bold tracking-widest gold-text"
        >
          ÁVALON
        </button>
        <ul className="flex flex-wrap items-center gap-1 md:gap-2">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => scrollToId(s.id)}
                  className={`group relative px-3 py-2 font-display text-xs uppercase tracking-widest transition-colors md:px-5 md:text-sm ${
                    isActive ? "text-gold" : "text-muted-foreground hover:text-parchment"
                  }`}
                >
                  <span className="mr-2 text-gold/50">{s.roman}.</span>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(" ")[0]}</span>
                  {isActive && (
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
function NextChapter({ fromIndex }: { fromIndex: number }) {
  const next = SECTIONS[fromIndex + 1];
  const isLast = !next;
  const handleClick = () => {
    if (isLast) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      scrollToId(next.id);
    }
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
            {isLast ? "Final" : `Capítulo ${next.roman}`}
          </span>
          <span className="mt-1 gold-text text-base md:text-lg">
            {isLast ? "ONBOARDING EN VÍDEO" : `Siguiente: ${next.label}`}
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

/* ---------------- IMAGE PLACEHOLDER ---------------- */
function ImagePlaceholder({
  aspect = "4 / 3",
  label = "Espacio reservado para imagen",
}: {
  aspect?: string;
  label?: string;
}) {
  return (
    <div className="mx-auto my-10 w-full max-w-md">
      <div
        className="flex w-full items-center justify-center rounded-sm border border-dashed border-gold/25 bg-neutral-950"
        style={{ aspectRatio: aspect }}
        aria-label={label}
        role="img"
      >
        <div className="flex flex-col items-center gap-2 text-gold/25">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-8 w-8" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M21 17l-6-6-8 8" />
          </svg>
          <span className="font-display text-[10px] uppercase tracking-[0.35em]">Imagen</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SECTION 1 ---------------- */
function Contexto() {
  return (
    <div className="animate-fade-up">
      <SectionTitle roman="I" title="La Sombra de Mordred en Talent" subtitle="La lucha entre el Bien y el Mal por evitar la alta rotación." />
      <Scroll className="space-y-6 text-base leading-relaxed text-parchment/90 md:text-lg">
        <p>
          El rey Arturo busca forjar la <em className="text-gold">empresa perfecta</em>, pero entre los leales caballeros de Selección que se dejan la piel cribando en LinkedIn y SuccessFactors, se esconden los despiadados <span className="text-crimson font-semibold">esbirros de Mordred</span>. Las fuerzas del mal son escasas, pero se conocen perfectamente y saben permanecer ocultas, sin que nadie sospeche de ellas.
        </p>
        <p>
          Su único objetivo es sembrar el caos: alargar los procesos de selección, hacer <em>ghosting</em> masivo, rechazar ofertas firmadas y hacer que la rotación alcance límites críticos. Nuestra misión hoy no es solo sobrevivir a las reuniones; es <span className="text-gold font-semibold">identificar a los traidores</span> antes de que arruinen nuestras contrataciones.
        </p>
        <div className="my-8 border-l-2 border-crimson/60 bg-crimson/5 px-6 py-4">
          <p className="mb-1 font-display text-xs uppercase tracking-widest text-crimson">Advertencia corporativa</p>
          <p className="italic text-parchment/90">
            Desconfiad de todo el mundo. El compañero que te ha traído un café amablemente esta mañana podría estar planeando sabotear tu cierre. Aquí no importan los departamentos ni la antigüedad en B. Braun; solo importa <strong className="text-parchment">sobrevivir a la traición</strong>.
          </p>
        </div>
      </Scroll>
      <figure className="mx-auto my-12 w-full max-w-5xl">
        <img
          src={mesa-redonda-avalon.jpeg}
          alt="La Mesa Redonda de Ávalon"
          className="w-full rounded-sm border border-gold/30 shadow-2xl shadow-black/60"
        />
      </figure>
    </div>
  );
}

/* ---------------- SECTION 2 ---------------- */
type Character = {
  name: string;
  role: string;
  side: "good" | "evil";
  short: string;
  long: string;
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
    long: "Cuando les presentas al candidato perfecto tras meses de búsqueda, cambian la vacante o directamente desaparecen. Parece que lleven la B. por bandera… pero boicotean desde dentro.",
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
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        <SectionTitle
          roman="II"
          title="Identidades Secretas"
          subtitle="Al inicio de la partida, cada jugador recibe una identidad. NO reveles tu carta ni hagas alusiones directas al personaje."
        />
        <img
          src={banner-coronas.png}
          alt="Estandarte con tres coronas de Ávalon"
          className="mx-auto w-40 md:w-56 lg:w-64 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
          loading="lazy"
        />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {CHARACTERS.map((c, i) => (
          <FlipCard key={c.name} character={c} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}

function FlipCard({ character, delay }: { character: Character; delay: number }) {
  const [flipped, setFlipped] = useState(false);
  const isGood = character.side === "good";

  return (
    <div
      className="flip-card h-80 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={`Voltear ficha de ${character.name}`}
    >
      <div
        className="flip-inner relative h-full w-full"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <div
          className={`flip-face absolute inset-0 flex flex-col items-center justify-center rounded-sm border p-8 text-center ${
            isGood
              ? "border-royal/50 bg-gradient-to-br from-royal/20 via-black to-black shadow-[inset_0_0_60px_rgba(59,80,180,0.15)]"
              : "border-crimson/50 bg-gradient-to-br from-crimson/25 via-black to-black shadow-[inset_0_0_60px_rgba(160,30,30,0.2)]"
          }`}
        >
          <div className="text-6xl md:text-7xl">{character.emoji}</div>
          <h3 className="mt-4 font-display text-2xl font-bold gold-text md:text-3xl">{character.name}</h3>
          <p className={`mt-2 font-display text-xs uppercase tracking-[0.3em] ${isGood ? "text-royal" : "text-crimson"}`}>
            {isGood ? "Del lado del Bien" : "Del lado del Mal"}
          </p>
          <p className="mt-4 text-sm italic text-parchment/70">{character.short}</p>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
            ▸ Haz clic para revelar
          </p>
        </div>
        <div
          className={`flip-face absolute inset-0 flex flex-col justify-center rounded-sm border p-8 text-center ${
            isGood
              ? "border-royal/70 bg-gradient-to-br from-black via-royal/10 to-black"
              : "border-crimson/70 bg-gradient-to-br from-black via-crimson/15 to-black"
          }`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">{character.role}</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-parchment">{character.name}</h3>
          <p className="mt-6 text-sm leading-relaxed text-parchment/85 md:text-base">{character.long}</p>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
            ↺ Volver
          </p>
        </div>
      </div>
    </div>
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
            <p className="mt-1 text-sm italic text-parchment/90">
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
          <ul className="mb-6 space-y-2 text-sm text-parchment/90">
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
            <p className="text-sm italic text-parchment/90">
              Para que la gesta triunfe, <strong>todas</strong> las cartas deben ser de éxito. Una sola carta de fracaso arruina todo.
            </p>
          </div>
        </Scroll>
      </div>

      {/* Quest track */}
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
        <p className="mx-auto mt-8 max-w-2xl text-base text-parchment/80 md:text-lg">
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
function Footer() {
  return (
    <footer className="border-t border-gold/20 py-10 text-center">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-gold/50">
        ⚜  Talent Acquisition · B. Braun  ⚜
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
