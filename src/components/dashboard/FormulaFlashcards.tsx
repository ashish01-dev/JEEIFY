'use client'

import { useState, useMemo, useEffect } from 'react'
import { useProgressStore } from '@/store/progressStore'
import syllabusData from '@/data/syllabus.json'
import { db } from '@/lib/db'
import type { Subject } from '@/types'

const syllabus = syllabusData as unknown as { physics: { divisions: { id: string; name: string; chapters: { id: string; name: string; deleted?: boolean; topics: { id: string; name: string }[] }[] }[] }; chemistry: { divisions: { id: string; name: string; chapters: { id: string; name: string; deleted?: boolean; topics: { id: string; name: string }[] }[] }[] }; maths: { divisions: { id: string; name: string; chapters: { id: string; name: string; deleted?: boolean; topics: { id: string; name: string }[] }[] }[] } }

type FormulaEntry = { formula: React.ReactNode; explanation: string }

const SUBJECTS: { value: Subject; label: string; emoji: string }[] = [
  { value: 'physics', label: 'Physics', emoji: '⚡' },
  { value: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { value: 'maths', label: 'Maths', emoji: '📐' },
]

function F({ children }: { children: React.ReactNode }) {
  return <span className="text-xl font-mono tracking-tight" style={{ color: 'var(--c-text)' }}>{children}</span>
}

function Sup({ children }: { children: React.ReactNode }) {
  return <sup className="text-[0.6em] align-top">{children}</sup>
}

function Sub({ children }: { children: React.ReactNode }) {
  return <sub className="text-[0.6em] align-bottom">{children}</sub>
}

function Frac({ num, den }: { num: string; den: string }) {
  return <span className="inline-flex flex-col items-center mx-0.5 align-middle leading-tight"><span className="border-b border-current px-1 pb-0.5">{num}</span><span className="px-1 pt-0.5">{den}</span></span>
}

function Sqrt({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center"><span className="text-xl leading-none">√</span><span className="border-t border-current px-0.5 pt-0.5">{children}</span></span>
}

function Arrow({ right, left, children }: { right?: boolean; left?: boolean; children?: React.ReactNode }) {
  return <span className="mx-1">{right ? '→' : '←'}{children}</span>
}

function Equiv({ children }: { children?: React.ReactNode }) {
  return <span className="mx-1">⇔{children}</span>
}

function Approx({ children }: { children?: React.ReactNode }) {
  return <span className="mx-1">≈{children}</span>
}

function Theta({ children }: { children?: React.ReactNode }) {
  return <span>θ{children}</span>
}

function Delta({ children }: { children?: React.ReactNode }) {
  return <span>Δ{children}</span>
}

function Pi({ children }: { children?: React.ReactNode }) {
  return <span>π{children}</span>
}

function Sigma({ children }: { children?: React.ReactNode }) {
  return <span>Σ{children}</span>
}

function checkVisible(el: HTMLElement | null) {
  if (!el) return false
  const style = getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null
}

const FORMULA_DB: Record<Subject, Record<string, FormulaEntry[]>> = {
  physics: {
    'phy-physics-measurement': [
      { formula: <F>[M<Sup>a</Sup> L<Sup>b</Sup> T<Sup>c</Sup>]</F>, explanation: 'Dimensional formula — M, L, T are fundamental dimensions' },
      { formula: <F>% error = <Frac num="|true - exp|" den="true" /> × 100</F>, explanation: 'Percentage error in measurement' },
      { formula: <F><Delta>L</Delta> ∝ L</F>, explanation: 'Absolute error proportional to length' },
    ],
    'phy-kinematics': [
      { formula: <F>v = u + at</F>, explanation: 'First equation of motion' },
      { formula: <F>s = ut + ½at<Sup>2</Sup></F>, explanation: 'Second equation of motion' },
      { formula: <F>v<Sup>2</Sup> = u<Sup>2</Sup> + 2as</F>, explanation: 'Third equation of motion' },
      { formula: <F>s<Sub>n</Sub> = u + a(n − ½)</F>, explanation: 'Distance travelled in n<Sup>th</Sup> second' },
      { formula: <F>R = <Frac num="u²sin2θ" den="g" /></F>, explanation: 'Horizontal range of projectile' },
      { formula: <F>H = <Frac num="u²sin²θ" den="2g" /></F>, explanation: 'Maximum height of projectile' },
      { formula: <F>T = <Frac num="2u sinθ" den="g" /></F>, explanation: 'Time of flight of projectile' },
    ],
    'phy-laws-of-motion': [
      { formula: <F>F = ma</F>, explanation: 'Newton\'s second law of motion' },
      { formula: <F>f<Sub>s</Sub> ≤ μ<Sub>s</Sub>N</F>, explanation: 'Static friction — maximum value' },
      { formula: <F>f<Sub>k</Sub> = μ<Sub>k</Sub>N</F>, explanation: 'Kinetic friction' },
      { formula: <F>a = <Frac num="v²" den="r" /></F>, explanation: 'Centripetal acceleration in circular motion' },
      { formula: <F>F = ma  (F<Sub>12</Sub> = −F<Sub>21</Sub>)</F>, explanation: 'Action-reaction pairs' },
    ],
    'phy-work-energy-power': [
      { formula: <F>W = F·d·cosθ</F>, explanation: 'Work done by a constant force' },
      { formula: <F>KE = ½mv<Sup>2</Sup></F>, explanation: 'Kinetic energy' },
      { formula: <F>PE = mgh</F>, explanation: 'Gravitational potential energy' },
      { formula: <F>W = <Delta>KE</Delta></F>, explanation: 'Work-energy theorem' },
      { formula: <F>P = <Frac num="W" den="t" /></F>, explanation: 'Power (average)' },
    ],
    'phy-rotational-motion': [
      { formula: <F>τ = r × F</F>, explanation: 'Torque (cross product)' },
      { formula: <F>L = Iω</F>, explanation: 'Angular momentum' },
      { formula: <F>τ = Iα</F>, explanation: 'Torque → angular acceleration' },
      { formula: <F>KE<Sub>rot</Sub> = ½Iω<Sup>2</Sup></F>, explanation: 'Rotational kinetic energy' },
      { formula: <F>I = Σmr<Sup>2</Sup></F>, explanation: 'Moment of inertia definition' },
    ],
    'phy-gravitation': [
      { formula: <F>F = G<Frac num="m₁m₂" den="r²" /></F>, explanation: 'Newton\'s universal law of gravitation' },
      { formula: <F>g = <Frac num="GM" den="R²" /></F>, explanation: 'Acceleration due to gravity' },
      { formula: <F>v<Sub>esc</Sub> = <Sqrt><Frac num="2GM" den="R" /></Sqrt></F>, explanation: 'Escape velocity' },
      { formula: <F>T² ∝ a³</F>, explanation: 'Kepler\'s third law' },
    ],
    'phy-thermodynamics': [
      { formula: <F><Delta>U</Delta> = Q − W</F>, explanation: 'First law of thermodynamics' },
      { formula: <F>W = nRT ln<Frac num="V₂" den="V₁" /></F>, explanation: 'Isothermal work (reversible)' },
      { formula: <F>PV<Sup>γ</Sup> = constant</F>, explanation: 'Adiabatic process' },
      { formula: <F>η = 1 − <Frac num="T₂" den="T₁" /></F>, explanation: 'Carnot efficiency' },
    ],
    'phy-oscillations-waves': [
      { formula: <F>x = A sin(ωt + φ)</F>, explanation: 'Simple harmonic motion equation' },
      { formula: <F>ω = 2πf = <Frac num="2π" den="T" /></F>, explanation: 'Angular frequency' },
      { formula: <F>T = 2π<Sqrt><Frac num="m" den="k" /></Sqrt></F>, explanation: 'Spring-mass time period' },
      { formula: <F>T = 2π<Sqrt><Frac num="L" den="g" /></Sqrt></F>, explanation: 'Simple pendulum time period' },
      { formula: <F>v = fλ</F>, explanation: 'Wave speed = frequency × wavelength' },
    ],
    'phy-electric-charges-fields': [
      { formula: <F>F = k<Frac num="q₁q₂" den="r²" /></F>, explanation: 'Coulomb\'s law' },
      { formula: <F>E = <Frac num="F" den="q" /></F>, explanation: 'Electric field definition' },
      { formula: <F>V = k<Frac num="Q" den="r" /></F>, explanation: 'Electric potential due to point charge' },
      { formula: <F>U = <Frac num="kq₁q₂" den="r" /></F>, explanation: 'Potential energy of two charges' },
    ],
    'phy-capacitors': [
      { formula: <F>C = <Frac num="Q" den="V" /></F>, explanation: 'Capacitance definition' },
      { formula: <F>U = ½CV<Sup>2</Sup></F>, explanation: 'Energy stored in capacitor' },
      { formula: <F>C<Sub>eq</Sub><Sup>−1</Sup> = ΣC<Sub>i</Sub><Sup>−1</Sup></F>, explanation: 'Capacitors in series' },
      { formula: <F>C<Sub>eq</Sub> = ΣC<Sub>i</Sub></F>, explanation: 'Capacitors in parallel' },
    ],
    'phy-current-electricity': [
      { formula: <F>V = IR</F>, explanation: 'Ohm\'s law' },
      { formula: <F>R = ρ<Frac num="L" den="A" /></F>, explanation: 'Resistance from resistivity' },
      { formula: <F>P = I<Sup>2</Sup>R = VI = <Frac num="V²" den="R" /></F>, explanation: 'Electrical power dissipated' },
      { formula: <F>R<Sub>eq</Sub> = ΣR<Sub>i</Sub></F>, explanation: 'Resistors in series' },
      { formula: <F>R<Sub>eq</Sub><Sup>−1</Sup> = ΣR<Sub>i</Sub><Sup>−1</Sup></F>, explanation: 'Resistors in parallel' },
    ],
    'phy-magnetic-effects': [
      { formula: <F>F = qvB sinθ</F>, explanation: 'Lorentz force on moving charge' },
      { formula: <F>B = <Frac num="μ₀I" den="2πr" /></F>, explanation: 'Magnetic field due to infinite wire' },
      { formula: <F>F = BIl sinθ</F>, explanation: 'Force on current-carrying conductor' },
    ],
    'phy-electromagnetic-induction': [
      { formula: <F>ε = −<Frac num="dφ" den="dt" /></F>, explanation: 'Faraday\'s law of induction' },
      { formula: <F>φ = BA cosθ</F>, explanation: 'Magnetic flux' },
      { formula: <F>L = <Frac num="Nφ" den="I" /></F>, explanation: 'Self-inductance' },
    ],
    'phy-optics': [
      { formula: <F><Frac num="1" den="f" /> = <Frac num="1" den="v" /> − <Frac num="1" den="u" /></F>, explanation: 'Lens maker\'s formula' },
      { formula: <F>m = <Frac num="v" den="u" /> = <Frac num="hᵢ" den="hₒ" /></F>, explanation: 'Magnification' },
      { formula: <F>nsini = sinr</F>, explanation: 'Snell\'s law (n sin i = constant)' },
      { formula: <F>d = mλ</F>, explanation: 'Interference — path difference for maxima' },
    ],
    'phy-modern-physics': [
      { formula: <F>E = hf = <Frac num="hc" den="λ" /></F>, explanation: 'Photon energy' },
      { formula: <F>KE<Sub>max</Sub> = hf − φ</F>, explanation: 'Photoelectric effect' },
      { formula: <F>λ = <Frac num="h" den="p" /></F>, explanation: 'De Broglie wavelength' },
      { formula: <F>E = mc²</F>, explanation: 'Mass-energy equivalence' },
    ],
    'phy-semiconductors': [
      { formula: <F>I = I₀(e<Sup>eV/<Sub>kT</Sub></Sup> − 1)</F>, explanation: 'Diode current (Shockley equation)' },
      { formula: <F>A<Sub>v</Sub> = <Frac num="Vₒᵤₜ" den="Vᵢₙ" /></F>, explanation: 'Voltage gain of amplifier' },
    ],
  },

  chemistry: {
    'chem-basic-chemistry': [
      { formula: <F>n = <Frac num="m" den="M" /></F>, explanation: 'Number of moles = mass / molar mass' },
      { formula: <F>% w/w = <Frac num="mass solute" den="mass solution" /> × 100</F>, explanation: 'Mass percentage' },
      { formula: <F>M = <Frac num="n" den="V(L)" /></F>, explanation: 'Molarity = moles / volume in L' },
    ],
    'chem-structure-atom': [
      { formula: <F>E = −13.6<Frac num="Z²" den="n²" /> eV</F>, explanation: 'Energy of hydrogen atom electron in n<Sup>th</Sup> orbit' },
      { formula: <F><Frac num="1" den="λ" /> = R<Frac num="1" den="n₁²" /> − <Frac num="1" den="n₂²" /></F>, explanation: 'Rydberg formula for spectral lines' },
      { formula: <F>mvr = <Frac num="nh" den="2π" /></F>, explanation: 'Bohr\'s quantization condition' },
    ],
    'chem-chemical-bonding': [
      { formula: <F>ΔEN = EN<Sub>A</Sub> − EN<Sub>B</Sub></F>, explanation: 'Electronegativity difference' },
      { formula: <F>VSEPR — AX<Sub>n</Sub>E<Sub>m</Sub></F>, explanation: 'VSEPR notation for molecular geometry' },
    ],
    'chem-thermodynamics': [
      { formula: <F><Delta>G</Delta>° = <Delta>H</Delta>° − T<Delta>S</Delta>°</F>, explanation: 'Gibbs free energy change' },
      { formula: <F><Delta>G</Delta>° = −RT ln K</F>, explanation: 'Gibbs energy & equilibrium constant' },
      { formula: <F>q = mc<Delta>T</Delta></F>, explanation: 'Heat absorbed by substance' },
    ],
    'chem-equilibrium': [
      { formula: <F>K<Sub>c</Sub> = <Frac num="[C]ᶜ[D]ᵈ" den="[A]ᵃ[B]ᵇ" /></F>, explanation: 'Equilibrium constant expression' },
      { formula: <F>pH = −log[H⁺]</F>, explanation: 'pH of a solution' },
      { formula: <F>K<Sub>a</Sub> × K<Sub>b</Sub> = K<Sub>w</Sub></F>, explanation: 'Acid-base conjugate pair relation' },
    ],
    'chem-electrochemistry': [
      { formula: <F>E°<Sub>cell</Sub> = E°<Sub>cathode</Sub> − E°<Sub>anode</Sub></F>, explanation: 'Standard cell potential' },
      { formula: <F><Delta>G</Delta>° = −nFE°</F>, explanation: 'Gibbs energy and cell potential' },
      { formula: <F>Λ<Sub>m</Sub> = <Frac num="κ × 1000" den="M" /></F>, explanation: 'Molar conductivity' },
    ],
    'chem-chemical-kinetics': [
      { formula: <F>rate = k[A]<Sup>m</Sup>[B]<Sup>n</Sup></F>, explanation: 'Rate law expression' },
      { formula: <F>t<Sub>½</Sub> = <Frac num="0.693" den="k" /></F>, explanation: 'Half-life for first-order reaction' },
      { formula: <F>ln[A] = −kt + ln[A]₀</F>, explanation: 'Integrated rate law — first order' },
    ],
    'chem-s-block': [
      { formula: <F>2M + 2H₂O <Arrow right /> 2MOH + H₂</F>, explanation: 'Alkali metals with water' },
    ],
    'chem-p-block': [
      { formula: <F>4P + 5O₂ <Arrow right /> P₄O₁₀</F>, explanation: 'Phosphorus combustion' },
    ],
    'chem-organic': [
      { formula: <F>I<span className="italic">+</span> = <Frac num="I" den="h" /></F>, explanation: 'Index of hydrogen deficiency' },
      { formula: <F>R−X + OH<Sup>−</Sup> <Arrow right /> R−OH + X<Sup>−</Sup></F>, explanation: 'Nucleophilic substitution (S<Sub>N</Sub>2)' },
    ],
    'chem-biomolecules': [
      { formula: <F>(C₆H₁₀O₅)<Sub>n</Sub> + nH₂O → nC₆H₁₂O₆</F>, explanation: 'Starch hydrolysis to glucose' },
    ],
  },

  maths: {
    'math-sets-relations': [
      { formula: <F>n(A ∪ B) = n(A) + n(B) − n(A ∩ B)</F>, explanation: 'Union of two sets' },
    ],
    'math-complex-numbers': [
      { formula: <F>z = a + ib</F>, explanation: 'Complex number in standard form' },
      { formula: <F>|z| = <Sqrt>a² + b²</Sqrt></F>, explanation: 'Modulus of complex number' },
      { formula: <F>arg(z) = tan<Sup>−1</Sup>(b/a)</F>, explanation: 'Argument of complex number' },
      { formula: <F>e<Sup>iθ</Sup> = cosθ + i sinθ</F>, explanation: 'Euler\'s formula' },
    ],
    'math-quadratic-equations': [
      { formula: <F>ax<Sup>2</Sup> + bx + c = 0</F>, explanation: 'Quadratic equation (a ≠ 0)' },
      { formula: <F>x = <Frac num="−b ± √(b² − 4ac)" den="2a" /></F>, explanation: 'Quadratic formula' },
      { formula: <F>D = b<Sup>2</Sup> − 4ac</F>, explanation: 'Discriminant — nature of roots' },
      { formula: <F>α + β = −b/a,  αβ = c/a</F>, explanation: 'Sum and product of roots' },
    ],
    'math-sequences-series': [
      { formula: <F>a<Sub>n</Sub> = a + (n−1)d</F>, explanation: 'Arithmetic progression — n<Sup>th</Sup> term' },
      { formula: <F>S<Sub>n</Sub> = <Frac num="n(2a + (n−1)d)" den="2" /></F>, explanation: 'Sum of AP' },
      { formula: <F>a<Sub>n</Sub> = ar<Sup>n−1</Sup></F>, explanation: 'Geometric progression — n<Sup>th</Sup> term' },
      { formula: <F>S<Sub>∞</Sub> = <Frac num="a" den="1−r" />, |r| &lt; 1</F>, explanation: 'Sum of infinite GP' },
    ],
    'math-binomial-theorem': [
      { formula: <F>(1 + x)<Sup>n</Sup> = Σ <Sub>n</Sub>C<Sub>r</Sub>x<Sup>r</Sup></F>, explanation: 'Binomial expansion' },
      { formula: <F>T<Sub>r+1</Sub> = <Sub>n</Sub>C<Sub>r</Sub>a<Sup>n−r</Sup>b<Sup>r</Sup></F>, explanation: 'General term in (a + b)<Sup>n</Sup>' },
    ],
    'math-permutations-combinations': [
      { formula: <F><Sup>n</Sup>P<Sub>r</Sub> = <Frac num="n!" den="(n−r)!" /></F>, explanation: 'Permutations (arrangement order matters)' },
      { formula: <F><Sup>n</Sup>C<Sub>r</Sub> = <Frac num="n!" den="r!(n−r)!" /></F>, explanation: 'Combinations (selection order irrelevant)' },
    ],
    'math-probability': [
      { formula: <F>P(A) = <Frac num="n(A)" den="n(S)" /></F>, explanation: 'Probability of an event' },
      { formula: <F>P(A|B) = <Frac num="P(A ∩ B)" den="P(B)" /></F>, explanation: 'Conditional probability' },
      { formula: <F>P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</F>, explanation: 'Addition theorem' },
    ],
    'math-trigonometry': [
      { formula: <F>sin²θ + cos²θ = 1</F>, explanation: 'Fundamental trig identity' },
      { formula: <F>sin(A ± B) = sinA cosB ± cosA sinB</F>, explanation: 'Sine compound angle' },
      { formula: <F>cos(A ± B) = cosA cosB ∓ sinA sinB</F>, explanation: 'Cosine compound angle' },
      { formula: <F>tan(A + B) = <Frac num="tanA + tanB" den="1 − tanA tanB" /></F>, explanation: 'Tangent compound angle' },
      { formula: <F>sin2θ = 2 sinθ cosθ</F>, explanation: 'Double-angle formula' },
      { formula: <F>cos2θ = cos²θ − sin²θ = 2cos²θ − 1 = 1 − 2sin²θ</F>, explanation: 'Cosine double-angle' },
    ],
    'math-straight-lines': [
      { formula: <F>y = mx + c</F>, explanation: 'Slope-intercept form' },
      { formula: <F>y − y₁ = m(x − x₁)</F>, explanation: 'Point-slope form' },
      { formula: <F>d = <Frac num="|Ax₁ + By₁ + C|" den="√(A² + B²)" /></F>, explanation: 'Distance from point to line' },
    ],
    'math-circles': [
      { formula: <F>x² + y² + 2gx + 2fy + c = 0</F>, explanation: 'General equation of a circle' },
      { formula: <F>center = (−g, −f),  r = √(g² + f² − c)</F>, explanation: 'Center and radius' },
    ],
    'math-conic-sections': [
      { formula: <F><Frac num="x²" den="a²" /> + <Frac num="y²" den="b²" /> = 1</F>, explanation: 'Ellipse standard equation (a &gt; b)' },
      { formula: <F>y² = 4ax</F>, explanation: 'Parabola standard equation' },
      { formula: <F><Frac num="x²" den="a²" /> − <Frac num="y²" den="b²" /> = 1</F>, explanation: 'Hyperbola standard equation' },
    ],
    'math-differentiation': [
      { formula: <F><Frac num="d" den="dx" />x<Sup>n</Sup> = nx<Sup>n−1</Sup></F>, explanation: 'Power rule' },
      { formula: <F><Frac num="d" den="dx" /> sinx = cosx</F>, explanation: 'Derivative of sin' },
      { formula: <F><Frac num="d" den="dx" /> cosx = −sinx</F>, explanation: 'Derivative of cos' },
      { formula: <F><Frac num="d" den="dx" /> e<Sup>x</Sup> = e<Sup>x</Sup></F>, explanation: 'Derivative of exponential' },
      { formula: <F><Frac num="d" den="dx" /> ln|x| = <Frac num="1" den="x" /></F>, explanation: 'Derivative of natural log' },
      { formula: <F>Chain rule: <Frac num="dy" den="dx" /> = <Frac num="dy" den="du" /> · <Frac num="du" den="dx" /></F>, explanation: 'Chain rule for composite functions' },
      { formula: <F>Product rule: (uv)′ = u′v + uv′</F>, explanation: 'Derivative of product' },
    ],
    'math-integration': [
      { formula: <F>∫x<Sup>n</Sup>dx = <Frac num="xⁿ⁺¹" den="n+1" /> + C, n ≠ −1</F>, explanation: 'Power rule for integration' },
      { formula: <F>∫<Frac num="1" den="x" />dx = ln|x| + C</F>, explanation: 'Integral of 1/x' },
      { formula: <F>∫e<Sup>x</Sup>dx = e<Sup>x</Sup> + C</F>, explanation: 'Integral of exponential' },
      { formula: <F>∫ sinx dx = −cosx + C</F>, explanation: 'Integral of sin' },
      { formula: <F>∫ cosx dx = sinx + C</F>, explanation: 'Integral of cos' },
      { formula: <F>∫<Sub>a</Sub><Sup>b</Sup> f(x) dx = F(b) − F(a)</F>, explanation: 'Definite integral — Fundamental Theorem' },
    ],
    'math-differential-equations': [
      { formula: <F><Frac num="dy" den="dx" /> = f(x)g(y)</F>, explanation: 'Variables separable form' },
      { formula: <F><Frac num="dy" den="dx" /> + Py = Q</F>, explanation: 'Linear differential equation (standard form)' },
    ],
    'math-vectors-3d': [
      { formula: <F>a·b = |a||b|cosθ</F>, explanation: 'Dot (scalar) product' },
      { formula: <F>a × b = |a||b|sinθ n̂</F>, explanation: 'Cross (vector) product' },
      { formula: <F>d = <Frac num="|(a₂ − a₁)·(b₁ × b₂)|" den="|b₁ × b₂|" /></F>, explanation: 'Shortest distance between skew lines' },
    ],
  },
}

function getFlatChapters(subject: Subject) {
  const all: { id: string; name: string }[] = []
  const divs = syllabus[subject].divisions
  for (const d of divs) {
    for (const ch of d.chapters) {
      if (!ch.deleted) all.push({ id: ch.id, name: ch.name })
    }
  }
  return all
}

interface Props {
  onClose: () => void
}

export default function FormulaFlashcards({ onClose }: Props) {
  const [subject, setSubject] = useState<Subject>('physics')
  const [chapterIdx, setChapterIdx] = useState(0)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState<'browse' | 'suggested'>('browse')
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])

  const chapters = useMemo(() => getFlatChapters(subject), [subject])
  const currentChapter = chapters[chapterIdx] || chapters[0]

  useEffect(() => {
    const loadSuggested = async () => {
      const today = new Date().toISOString().split('T')[0]
      const plan = await db.dailyPlans.get(today)
      if (plan?.subjects) {
        const chapterNames: string[] = []
        for (const s of plan.subjects) {
          if (s.chapters) chapterNames.push(...s.chapters)
        }
        if (chapterNames.length > 0) {
          const ids: string[] = []
          for (const subj of ['physics', 'chemistry', 'maths'] as Subject[]) {
            for (const ch of getFlatChapters(subj)) {
              if (chapterNames.some(n => ch.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(ch.name.toLowerCase()))) {
                ids.push(ch.id)
              }
            }
          }
          setSuggestedIds(ids)
        }
      }
    }
    loadSuggested()
  }, [])

  const formulas = useMemo(() => {
    const db = FORMULA_DB[subject]
    if (!currentChapter) return []
    return db[currentChapter.id] || []
  }, [currentChapter, subject])

  const suggestedFormulas = useMemo(() => {
    if (suggestedIds.length === 0) return []
    const result: { chapterName: string; formulas: FormulaEntry[] }[] = []
    for (const subj of ['physics', 'chemistry', 'maths'] as Subject[]) {
      for (const ch of getFlatChapters(subj)) {
        if (suggestedIds.includes(ch.id)) {
          const f = FORMULA_DB[subj]?.[ch.id]
          if (f?.length) result.push({ chapterName: ch.name, formulas: f.slice(0, 3) })
        }
      }
    }
    return result
  }, [suggestedIds])

  const currentCard = formulas[cardIdx]
  const formulaCount = formulas.length

  const nextCard = () => {
    if (cardIdx < formulaCount - 1) {
      setCardIdx(cardIdx + 1)
    } else if (chapterIdx < chapters.length - 1) {
      setChapterIdx(chapterIdx + 1)
      setCardIdx(0)
    }
    setFlipped(false)
  }

  const prevCard = () => {
    if (cardIdx > 0) {
      setCardIdx(cardIdx - 1)
    } else if (chapterIdx > 0) {
      setChapterIdx(chapterIdx - 1)
      setCardIdx(0)
    }
    setFlipped(false)
  }

  const isSuggestedMode = mode === 'suggested' && suggestedFormulas.length > 0

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md mx-4 rounded-[18px] px-5 py-5 max-h-[90vh] overflow-y-auto" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            📄 Formula Flashcards
            {isSuggestedMode && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium text-white" style={{ background: 'var(--c-green)' }}>Suggested</span>}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]" style={{ color: 'var(--c-muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1.5 mb-4">
          <button onClick={() => { setMode('browse'); setCardIdx(0); setFlipped(false) }}
            className={`flex-1 text-[10px] font-medium py-1.5 rounded-[40px] transition-all ${mode === 'browse' ? 'text-white' : ''}`}
            style={{ background: mode === 'browse' ? 'var(--c-blue)' : 'var(--c-tag)', color: mode === 'browse' ? '#fff' : 'var(--c-muted)' }}
          >📂 Browse</button>
          <button onClick={() => { setMode('suggested'); setCardIdx(0); setFlipped(false) }}
            className={`flex-1 text-[10px] font-medium py-1.5 rounded-[40px] transition-all ${mode === 'suggested' ? 'text-white' : ''}`}
            style={{ background: mode === 'suggested' ? 'var(--c-green)' : 'var(--c-tag)', color: mode === 'suggested' ? '#fff' : 'var(--c-muted)' }}
          >💡 Suggested</button>
        </div>

        {/* Suggested Mode */}
        {isSuggestedMode ? (
          <div className="space-y-3">
            <p className="text-[10px]" style={{ color: 'var(--c-caption)' }}>Formulas from today&apos;s planned chapters:</p>
            {suggestedFormulas.map((group, gi) => (
              <div key={gi} className="rounded-[14px] p-3" style={{ background: 'var(--c-card-alt)' }}>
                <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--c-text)' }}>{group.chapterName}</div>
                <div className="space-y-2">
                  {group.formulas.map((f, fi) => (
                    <div key={fi} className="rounded-[10px] px-3 py-2 cursor-pointer hover:-translate-y-[0.5px] transition-all" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)' }}
                      onClick={() => {
                        const subjs = ['physics', 'chemistry', 'maths'] as Subject[]
                        for (const s of subjs) {
                          const chs = getFlatChapters(s)
                          const idx = chs.findIndex(c => c.name === group.chapterName)
                          if (idx >= 0) {
                            setSubject(s)
                            setChapterIdx(idx)
                            const db = FORMULA_DB[s]?.[chs[idx].id]
                            if (db) {
                              const found = db.findIndex(e => e.explanation === f.explanation)
                              if (found >= 0) setCardIdx(found)
                            }
                            setMode('browse')
                            setFlipped(false)
                            return
                          }
                        }
                      }}>
                      <div className="overflow-x-auto pb-1">{f.formula}</div>
                      <div className="text-[10px] mt-1" style={{ color: 'var(--c-caption)' }}>{f.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {suggestedFormulas.length === 0 && (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-xs" style={{ color: 'var(--c-muted)' }}>No formulas match today&apos;s plan</p>
              </div>
            )}
            <button onClick={() => setMode('browse')}
              className="w-full text-xs font-medium py-2 rounded-[40px] transition-all"
              style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
            >Browse all formulas →</button>
          </div>
        ) : (
          <>
            {/* Subject Tabs */}
            <div className="flex gap-1.5 mb-3">
              {SUBJECTS.map(s => (
                <button key={s.value} onClick={() => { setSubject(s.value); setChapterIdx(0); setCardIdx(0); setFlipped(false) }}
                  className={`flex-1 text-[10px] font-medium py-1.5 rounded-[40px] transition-all`}
                  style={{
                    background: subject === s.value ? 'var(--c-blue)' : 'var(--c-tag)',
                    color: subject === s.value ? '#fff' : 'var(--c-muted)',
                  }}
                >{s.emoji} {s.label}</button>
              ))}
            </div>

            {/* Chapter Selector */}
            <div className="mb-3">
              <select value={chapterIdx} onChange={e => { setChapterIdx(Number(e.target.value)); setCardIdx(0); setFlipped(false) }}
                className="w-full text-xs px-3 py-2 rounded-[40px] outline-none appearance-none"
                style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text)', background: 'var(--c-input)' }}>
                {chapters.map((ch, i) => (
                  <option key={ch.id} value={i}>{ch.name}</option>
                ))}
              </select>
            </div>

            {/* Card Counter */}
            <div className="text-[10px] mb-3 text-center" style={{ color: 'var(--c-caption)' }}>
              {currentChapter?.name || 'General'} · {formulaCount > 0 ? `Formula ${cardIdx + 1}/${formulaCount}` : 'No formulas'}
            </div>

            {/* Formula Card */}
            <div
              onClick={() => formulaCount > 0 && setFlipped(!flipped)}
              className="rounded-[18px] p-5 min-h-[160px] flex items-center justify-center cursor-pointer select-none transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--c-card-alt)',
                border: '1px solid var(--c-border)',
              }}
            >
              {formulaCount > 0 ? (
                <div className="text-center w-full">
                  <div className="text-[11px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--c-caption)' }}>
                    {flipped ? 'Definition' : 'Formula'}
                  </div>
                  <div className="overflow-x-auto pb-1">
                    {flipped ? (
                      <div className="text-base leading-relaxed" style={{ color: 'var(--c-muted)' }}>{currentCard.explanation}</div>
                    ) : (
                      <div className="flex justify-center">{currentCard.formula}</div>
                    )}
                  </div>
                  <div className="text-[10px] mt-4" style={{ color: 'var(--c-muted)' }}>
                    Tap to {flipped ? 'show formula' : 'show definition'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-xs" style={{ color: 'var(--c-muted)' }}>No formulas for this chapter yet</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {formulaCount > 0 && (
              <div className="flex items-center justify-between gap-3 mt-4">
                <button onClick={prevCard} disabled={cardIdx <= 0 && chapterIdx <= 0}
                  className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all disabled:opacity-30"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                >← Prev</button>
                <button onClick={() => setFlipped(!flipped)}
                  className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all text-white"
                  style={{ background: 'var(--c-blue)' }}
                >Flip</button>
                <button onClick={nextCard} disabled={cardIdx >= formulaCount - 1 && chapterIdx >= chapters.length - 1}
                  className="flex-1 text-xs font-medium px-3 py-2 rounded-[40px] transition-all disabled:opacity-30"
                  style={{ border: '1px solid var(--c-border-input)', color: 'var(--c-text-secondary)' }}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}