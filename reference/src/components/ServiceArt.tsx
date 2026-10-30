// One animated scene per channel, drawn in the site's own ink / paper / red.
// Every scene shares a 480 × 300 stage; motion lives in styles.css (.sa-*)
// and only runs while a service row is open.

const INK = "#121110";
const RED = "#ff1616";
const PAPER = "#fbfaf6";
const PAPER2 = "#e9e5dc";
const v = (o: Record<string, string | number>) => o as React.CSSProperties;
const DISPLAY = { fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 800 } as const;

function Newspaper() {
  const col = (x: number, y0: number, y1: number, d0: number) =>
    Array.from({ length: Math.floor((y1 - y0) / 9) + 1 }, (_, i) => (
      <rect key={`${x}-${i}`} className="sa-line" x={x} y={y0 + i * 9} width={i % 5 === 4 ? 40 : 64} height="3" rx="1.5" fill={INK} opacity=".22" style={v({ "--d": `${d0 + i * 40}ms` })} />
    ));
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <g className="sa-float">
        <rect x="150" y="40" width="226" height="246" rx="3" fill={PAPER2} stroke={INK} strokeWidth="1.5" transform="rotate(-6 263 163)" />
        <rect x="118" y="24" width="244" height="256" rx="3" fill={PAPER} stroke={INK} strokeWidth="2" />
        <text x="240" y="56" textAnchor="middle" fontSize="21" fill={INK} style={DISPLAY}>The Morning Post</text>
        <rect x="134" y="66" width="212" height="2.5" fill={INK} />
        <rect x="134" y="71" width="212" height="1" fill={INK} />
        <rect className="sa-line" x="134" y="84" width="176" height="9" rx="2" fill={INK} style={v({ "--d": "100ms" })} />
        <rect className="sa-line" x="134" y="98" width="128" height="9" rx="2" fill={INK} style={v({ "--d": "220ms" })} />
        {col(134, 120, 266, 300)}
        {col(208, 120, 186, 500)}
        {col(282, 120, 186, 700)}
        <rect className="sa-slot" x="208" y="198" width="138" height="68" rx="2" fill="none" stroke={RED} strokeWidth="1.5" strokeDasharray="5 4" />
        <g className="sa-ad">
          <rect x="208" y="198" width="138" height="68" rx="2" fill={RED} />
          <text x="220" y="228" fontSize="17" fill="#fff" style={DISPLAY}>Your ad,</text>
          <text x="220" y="248" fontSize="17" fill="#fff" style={DISPLAY}>front page.</text>
          <circle cx="334" cy="254" r="4" fill={INK} />
        </g>
      </g>
    </svg>
  );
}

function Billboards() {
  const frames = [
    <g key="a">
      <rect x="136" y="64" width="208" height="84" fill={RED} />
      <text x="152" y="118" fontSize="34" fill="#fff" style={DISPLAY}>Bright</text>
      <circle cx="268" cy="114" r="5" fill={INK} />
    </g>,
    <g key="b">
      <rect x="136" y="148" width="208" height="84" fill={INK} />
      <circle cx="300" cy="190" r="26" fill={RED} />
      <rect x="152" y="172" width="96" height="9" rx="2" fill={PAPER} />
      <rect x="152" y="187" width="70" height="9" rx="2" fill={PAPER} opacity=".6" />
    </g>,
    <g key="c">
      <rect x="136" y="232" width="208" height="84" fill={PAPER} />
      <text x="152" y="284" fontSize="30" fill={INK} style={DISPLAY}>Be seen.</text>
    </g>,
    <g key="d" transform="translate(0 252)">
      <rect x="136" y="64" width="208" height="84" fill={RED} />
      <text x="152" y="118" fontSize="34" fill="#fff" style={DISPLAY}>Bright</text>
      <circle cx="268" cy="114" r="5" fill={INK} />
    </g>,
  ];
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <defs>
        <clipPath id="sa-bb-face"><rect x="136" y="64" width="208" height="84" /></clipPath>
      </defs>
      {[[20, 150, 46, 112], [70, 176, 40, 86], [380, 140, 54, 122], [432, 186, 34, 76], [104, 196, 30, 66]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={PAPER2} />
      ))}
      <rect x="196" y="150" width="9" height="112" fill={INK} />
      <rect x="275" y="150" width="9" height="112" fill={INK} />
      <rect x="196" y="196" width="88" height="3" fill={INK} />
      {[170, 310].map((x, i) => (
        <g key={x}>
          <ellipse className="sa-glow" cx={x} cy="74" rx="44" ry="26" fill="#ffe6b5" style={v({ "--d": `${i * 400}ms` })} />
          <path d={`M${x} 58v-12h10`} stroke={INK} strokeWidth="2.5" fill="none" />
          <rect x={x + 6} y="40" width="16" height="7" rx="2" fill={INK} />
        </g>
      ))}
      <rect x="130" y="58" width="220" height="96" rx="3" fill={INK} />
      <g clipPath="url(#sa-bb-face)">
        <g className="sa-bb-roll">{frames}</g>
      </g>
      <g className="sa-pin">
        <circle className="sa-ring" cx="392" cy="70" r="10" fill="none" stroke={RED} strokeWidth="2" />
        <path d="M392 82c-9-10-13-16-13-22a13 13 0 0 1 26 0c0 6-4 12-13 22z" fill={RED} />
        <circle cx="392" cy="60" r="4.5" fill="#fff" />
      </g>
      <rect x="0" y="262" width="480" height="38" fill={PAPER2} />
      <rect x="0" y="262" width="480" height="2" fill={INK} />
      <line className="sa-road" x1="0" y1="282" x2="480" y2="282" stroke={INK} strokeWidth="2" strokeDasharray="14 12" opacity=".35" />
      {[
        { c: INK, d: "0s", t: "6s" },
        { c: RED, d: "2.4s", t: "7.5s" },
      ].map((car, i) => (
        <g key={i} className="sa-car" style={v({ "--d": car.d, "--t": car.t })}>
          <rect x="0" y="246" width="48" height="16" rx="5" fill={car.c} />
          <path d="M10 246l6-9h18l6 9z" fill={car.c} />
          <circle cx="12" cy="262" r="5" fill={INK} stroke={PAPER2} strokeWidth="2" />
          <circle cx="36" cy="262" r="5" fill={INK} stroke={PAPER2} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function Television() {
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <defs>
        <clipPath id="sa-tv-screen"><rect x="104" y="44" width="212" height="142" rx="6" /></clipPath>
      </defs>
      <rect x="90" y="30" width="240" height="170" rx="14" fill={INK} />
      <g clipPath="url(#sa-tv-screen)">
        <rect x="104" y="44" width="212" height="142" fill="#1d1b19" />
        <g className="sa-scene" style={v({ "--d": "0s" })}>
          <rect x="104" y="44" width="212" height="142" fill={RED} />
          <text x="124" y="128" fontSize="40" fill="#fff" style={DISPLAY}>Bright</text>
          <circle cx="263" cy="123" r="6" fill={INK} />
        </g>
        <g className="sa-scene" style={v({ "--d": "-6s" })}>
          <rect x="104" y="44" width="212" height="142" fill={PAPER} />
          <circle cx="270" cy="84" r="20" fill={RED} />
          <rect x="140" y="104" width="54" height="66" rx="4" fill={INK} />
          <rect x="148" y="116" width="38" height="10" rx="2" fill={RED} />
          <rect x="104" y="170" width="212" height="16" fill={PAPER2} />
        </g>
        <g className="sa-scene" style={v({ "--d": "-3s" })}>
          <rect x="104" y="44" width="212" height="142" fill="#1d1b19" />
          <circle cx="210" cy="115" r="28" fill="none" stroke={PAPER} strokeWidth="2" />
          <path d="M202 101l22 14-22 14z" fill={RED} />
        </g>
        <rect className="sa-progress" x="104" y="182" width="212" height="4" fill={RED} />
        <g className="sa-blink">
          <circle cx="120" cy="58" r="4" fill={RED} />
          <text x="129" y="62" fontSize="10" fill="#fff" fontFamily="Switzer, sans-serif" fontWeight="600">REC</text>
        </g>
      </g>
      <path d="M180 200l-14 22M240 200l14 22" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(352 140)">
        <rect x="0" y="22" width="84" height="54" rx="4" fill={INK} />
        <rect x="8" y="34" width="68" height="4" rx="2" fill={PAPER} opacity=".5" />
        <rect x="8" y="44" width="44" height="4" rx="2" fill={PAPER} opacity=".5" />
        <g className="sa-clap">
          <rect x="0" y="8" width="84" height="13" rx="2" fill={INK} />
          {[6, 26, 46, 66].map((x) => (
            <path key={x} d={`M${x} 8h10l-7 13h-10z`} fill={PAPER} />
          ))}
        </g>
      </g>
      <g>
        <rect x="0" y="238" width="480" height="40" fill={INK} />
        <g className="sa-film">
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i} transform={`translate(${i * 72} 0)`}>
              <rect x="8" y="246" width="56" height="24" rx="2" fill={i % 3 === 0 ? RED : i % 3 === 1 ? PAPER2 : "#3a3734"} />
              <rect x="2" y="240" width="5" height="4" fill={PAPER} opacity=".5" />
              <rect x="2" y="272" width="5" height="4" fill={PAPER} opacity=".5" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

function Radio() {
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <defs>
        <pattern id="sa-grille" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.8" fill={INK} />
        </pattern>
      </defs>
      {[0, 1, 2].map((i) => (
        <path key={i} className="sa-wave" d="M104 130a52 52 0 0 0 0 82" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" style={v({ "--d": `${i * 0.6}s` })} />
      ))}
      <line x1="330" y1="98" x2="384" y2="34" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="384" cy="34" r="5" fill={RED} />
      <path d="M170 98v-18a12 12 0 0 1 12-12h116a12 12 0 0 1 12 12v18" fill="none" stroke={INK} strokeWidth="4" />
      <rect x="110" y="96" width="270" height="156" rx="20" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <g className="sa-thump">
        <circle cx="184" cy="174" r="50" fill={PAPER2} stroke={INK} strokeWidth="2" />
        <circle cx="184" cy="174" r="42" fill="url(#sa-grille)" opacity=".75" />
      </g>
      <rect x="252" y="122" width="108" height="38" rx="6" fill={INK} />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={260 + i * 7.6} y={i % 2 ? 136 : 132} width="1.4" height={i % 2 ? 8 : 12} fill={PAPER} opacity=".6" />
      ))}
      <rect className="sa-needle" x="262" y="126" width="2.5" height="30" rx="1" fill={RED} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} className="sa-eq" x={258 + i * 11} y="174" width="7" height="34" rx="2" fill={i === 6 ? RED : INK} style={v({ "--d": `${(i * 137) % 900}ms` })} />
      ))}
      <circle cx="276" cy="228" r="11" fill={INK} />
      <g className="sa-knob"><circle cx="336" cy="228" r="11" fill={INK} /><rect x="335" y="219" width="2" height="7" fill={PAPER} /></g>
    </svg>
  );
}

function Social() {
  const post = (y: number, accent: boolean, k: number) => (
    <g key={k} transform={`translate(0 ${y})`}>
      <circle cx="202" cy="12" r="6" fill={INK} />
      <rect x="213" y="8" width="44" height="4" rx="2" fill={INK} opacity=".7" />
      <rect x="213" y="15" width="28" height="3" rx="1.5" fill={INK} opacity=".3" />
      <rect x="194" y="24" width="96" height="70" rx="6" fill={accent ? RED : PAPER2} />
      {accent ? (
        <text x="204" y="66" fontSize="18" fill="#fff" style={DISPLAY}>Bright.</text>
      ) : (
        <circle cx="242" cy="59" r="18" fill={INK} />
      )}
      <path d="M198 106c-3-2-5-4-5-6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 2-2 4-5 6z" fill={RED} />
      <rect x="210" y="101" width="30" height="3" rx="1.5" fill={INK} opacity=".3" />
    </g>
  );
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <defs>
        <clipPath id="sa-phone"><rect x="187" y="36" width="110" height="234" rx="14" /></clipPath>
      </defs>
      <g transform="translate(40 120)">
        <rect width="118" height="96" rx="12" fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <rect x="12" y="12" width="52" height="5" rx="2.5" fill={INK} opacity=".7" />
        {[30, 42, 26, 52, 64].map((h, i) => (
          <rect key={i} className="sa-bar" x={14 + i * 19} y={84 - h} width="12" height={h} rx="3" fill={i === 4 ? RED : INK} opacity={i === 4 ? 1 : 0.8} style={v({ "--d": `${i * 120}ms` })} />
        ))}
      </g>
      <rect x="180" y="22" width="124" height="262" rx="22" fill={INK} />
      <g clipPath="url(#sa-phone)">
        <rect x="187" y="36" width="110" height="234" fill={PAPER} />
        <g className="sa-feed">
          {[0, 1, 2, 3, 4, 5].map((i) => post(46 + i * 118, i % 2 === 0, i))}
        </g>
      </g>
      <rect x="222" y="28" width="40" height="5" rx="2.5" fill="#3a3734" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} className="sa-heart" d="M0 9c-6-4-10-8-10-12a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 4-4 8-10 12z" fill={RED} style={v({ "--d": `${i * 0.9}s`, "--x": `${(i % 2 ? 1 : -1) * (8 + i * 4)}px` })} transform="translate(318 240)" />
      ))}
      <g className="sa-toast">
        <rect x="296" y="62" width="134" height="34" rx="17" fill={INK} />
        <circle cx="315" cy="79" r="5" fill={RED} />
        <text x="327" y="83" fontSize="12" fill="#fff" fontFamily="Switzer, sans-serif" fontWeight="600">Campaign live</text>
      </g>
    </svg>
  );
}

function Transit() {
  const car = (x: number) => (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="132" width="132" height="54" rx="10" fill={INK} />
      <rect x="0" y="168" width="132" height="6" fill={RED} />
      {[12, 40, 68, 96].map((wx) => (
        <rect key={wx} x={wx} y="142" width="22" height="16" rx="3" fill={PAPER} />
      ))}
      <circle cx="26" cy="190" r="6" fill={INK} stroke={PAPER} strokeWidth="2" />
      <circle cx="106" cy="190" r="6" fill={INK} stroke={PAPER} strokeWidth="2" />
    </g>
  );
  return (
    <svg viewBox="0 0 480 300" className="size-full" aria-hidden>
      <line x1="0" y1="76" x2="480" y2="76" stroke={INK} strokeWidth="1.5" />
      {[60, 240, 420].map((x) => (
        <g key={x}>
          <rect x={x} y="70" width="5" height="126" fill={INK} opacity=".85" />
          <rect x={x - 14} y="70" width="33" height="4" fill={INK} />
        </g>
      ))}
      <rect x="0" y="196" width="480" height="3" fill={INK} />
      <line x1="0" y1="202" x2="480" y2="202" stroke={INK} strokeWidth="6" strokeDasharray="3 10" opacity=".35" />
      <g className="sa-train">
        <path d="M120 132l14-22h18l12 22" fill="none" stroke={INK} strokeWidth="2" />
        {car(0)}
        {car(138)}
        <text x="12" y="166.5" fontSize="8" fill={PAPER} style={DISPLAY}>Bright.</text>
        <text x="150" y="166.5" fontSize="8" fill={PAPER} style={DISPLAY}>Bright.</text>
        <path d="M270 132h10a14 14 0 0 1 14 14v40h-24z" fill={RED} />
        <circle cx="286" cy="158" r="3" fill="#fff6d6" />
      </g>
      <rect x="0" y="232" width="480" height="68" fill={PAPER2} />
      <line className="sa-road" x1="0" y1="268" x2="480" y2="268" stroke={INK} strokeWidth="2" strokeDasharray="14 12" opacity=".35" />
      <g className="sa-bus">
        <rect x="0" y="210" width="128" height="46" rx="9" fill={RED} />
        {[10, 34, 58].map((wx) => (
          <rect key={wx} x={wx} y="218" width="18" height="13" rx="2" fill={PAPER} />
        ))}
        <rect x="84" y="217" width="38" height="28" rx="3" fill={PAPER} />
        <text x="89" y="236" fontSize="11" fill={INK} style={DISPLAY}>Bright.</text>
        <circle cx="24" cy="258" r="7" fill={INK} stroke={PAPER2} strokeWidth="2" />
        <circle cx="104" cy="258" r="7" fill={INK} stroke={PAPER2} strokeWidth="2" />
      </g>
      <g className="sa-cab">
        <rect x="0" y="262" width="56" height="18" rx="6" fill={INK} />
        <path d="M12 262l7-10h18l7 10z" fill={INK} />
        <rect x="20" y="246" width="16" height="6" rx="2" fill={RED} />
        <circle cx="13" cy="281" r="5" fill={INK} stroke={PAPER2} strokeWidth="2" />
        <circle cx="43" cy="281" r="5" fill={INK} stroke={PAPER2} strokeWidth="2" />
      </g>
    </svg>
  );
}

export const serviceArt = {
  newspaper: Newspaper,
  billboards: Billboards,
  tv: Television,
  radio: Radio,
  social: Social,
  transit: Transit,
};
