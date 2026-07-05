import type { Subject } from '@/types'
import { PHYSICS_PYQS_NEW, CHEMISTRY_PYQS_NEW, MATHS_PYQS_NEW, ALL_PYQS_NEW } from './generated-pyqs'

export interface PYQEntry {
  id: string
  year: number
  session: string
  shift: number
  subject: Subject
  chapterId: string
  chapterName: string
  question: string
  options: string[]
  correctOptionIndex: number
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

const PHYSICS_CHAPTERS: Record<string, string> = {
  'phy-physics-measurement': 'Physics & Measurement',
  'phy-kinematics': 'Kinematics',
  'phy-laws-of-motion': 'Laws of Motion',
  'phy-work-energy-power': 'Work, Energy & Power',
  'phy-rotational-motion': 'Rotational Motion',
  'phy-gravitation': 'Gravitation',
  'phy-properties-solids-liquids': 'Properties of Solids & Liquids',
  'phy-thermodynamics': 'Thermodynamics',
  'phy-kinetic-theory': 'Kinetic Theory of Gases',
  'phy-oscillations-waves': 'Oscillations & Waves',
  'phy-electrostatics': 'Electrostatics',
  'phy-current-electricity': 'Current Electricity',
  'phy-magnetism': 'Magnetic Effects of Current & Magnetism',
  'phy-emi-ac': 'Electromagnetic Induction & AC',
  'phy-em-waves': 'Electromagnetic Waves',
  'phy-optics': 'Optics',
  'phy-dual-nature': 'Dual Nature of Matter & Radiation',
  'phy-atoms-nuclei': 'Atoms & Nuclei',
  'phy-electronic-devices': 'Electronic Devices',
}

const CHEMISTRY_CHAPTERS: Record<string, string> = {
  'chem-basic-concepts': 'Basic Concepts',
  'chem-atomic-structure': 'Atomic Structure',
  'chem-chemical-bonding': 'Chemical Bonding',
  'chem-states-of-matter': 'States of Matter',
  'chem-thermodynamics': 'Thermodynamics',
  'chem-solutions': 'Solutions',
  'chem-equilibrium': 'Equilibrium',
  'chem-redox-electrochemistry': 'Redox & Electrochemistry',
  'chem-chemical-kinetics': 'Chemical Kinetics',
  'chem-surface-chemistry': 'Surface Chemistry',
  'chem-periodicity': 'Periodicity',
  'chem-hydrogen': 'Hydrogen',
  'chem-s-block': 's-Block',
  'chem-p-block': 'p-Block',
  'chem-d-f-block': 'd- & f-Block',
  'chem-coordination-compounds': 'Coordination Compounds',
  'chem-metallurgy': 'Metallurgy',
  'chem-goc': 'General Organic Chemistry',
  'chem-hydrocarbons': 'Hydrocarbons',
  'chem-haloalkanes': 'Haloalkanes & Haloarenes',
  'chem-alcohols-phenols': 'Alcohols, Phenols & Ethers',
  'chem-carbonyl-compounds': 'Aldehydes, Ketones & Carboxylic Acids',
  'chem-amines': 'Amines',
  'chem-biomolecules': 'Biomolecules',
  'chem-chemistry-in-everyday-life': 'Chemistry in Everyday Life',
}

const MATHS_CHAPTERS: Record<string, string> = {
  'math-sets-functions': 'Sets & Functions',
  'math-complex-numbers': 'Complex Numbers & Quadratic Equations',
  'math-matrices-determinants': 'Matrices & Determinants',
  'math-permutations-combinations': 'Permutations & Combinations',
  'math-binomial-theorem': 'Binomial Theorem',
  'math-sequence-series': 'Sequence & Series',
  'math-limits-continuity': 'Limit, Continuity & Differentiability',
  'math-integral-calculus': 'Integral Calculus & Differential Equations',
  'math-coordinate-geometry': 'Coordinate Geometry',
  'math-3d-geometry': '3D Geometry',
  'math-trigonometry': 'Trigonometry',
  'math-vector-algebra': 'Vector Algebra',
  'math-statistics-probability': 'Statistics & Probability',
}

/* ─── Physics PYQs ─── */
const PHYSICS_PYQS: PYQEntry[] = [
  // Kinematics
  { id: 'phy-2024-001', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'A particle moves along a straight line such that its position x = 2t² + 3t + 5 (x in meters, t in seconds). The acceleration of the particle at t = 2 s is:', options: ['2 m/s²', '4 m/s²', '6 m/s²', '8 m/s²'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2024-002', year: 2024, session: 'Jan 29 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'A ball is projected vertically upward with speed 20 m/s. The time taken to return to the starting point is (g = 10 m/s²):', options: ['2 s', '3 s', '4 s', '5 s'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'phy-2024-003', year: 2024, session: 'Apr 4 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'Two projectiles are fired from the same point at angles 30° and 60° with the horizontal with the same speed. The ratio of their maximum heights is:', options: ['1:1', '1:2', '1:3', '1:4'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'phy-2025-001', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'A car moving at 72 km/h applies brakes and stops after traveling 50 m. The deceleration is:', options: ['2 m/s²', '4 m/s²', '6 m/s²', '8 m/s²'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2025-002', year: 2025, session: 'Jan 28 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'A stone is dropped from a height h. It hits the ground with momentum p. If the same stone is dropped from height 2h, the momentum when it hits the ground will be:', options: ['p', '√2 p', '2p', '4p'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2026-001', year: 2026, session: 'Jan 22 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-kinematics', chapterName: 'Kinematics', question: 'The displacement-time graph of a particle is a straight line inclined at 30° to the time axis. The velocity of the particle is:', options: ['1/√3 m/s', '√3 m/s', '0.5 m/s', '1 m/s'], correctOptionIndex: 0, difficulty: 'easy' },

  // Laws of Motion
  { id: 'phy-2024-004', year: 2024, session: 'Jan 30 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-laws-of-motion', chapterName: 'Laws of Motion', question: 'A 5 kg block is pulled on a rough horizontal surface with a force of 25 N at an angle of 37° above horizontal. If the coefficient of kinetic friction is 0.2, the acceleration of the block is (g = 10 m/s², sin 37° = 0.6, cos 37° = 0.8):', options: ['0.5 m/s²', '1.2 m/s²', '2.0 m/s²', '2.8 m/s²'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2024-005', year: 2024, session: 'Apr 5 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-laws-of-motion', chapterName: 'Laws of Motion', question: 'Three blocks of masses 2 kg, 3 kg and 5 kg are connected by strings and pulled by a force of 20 N on a frictionless surface. The tension in the string connecting the 2 kg and 3 kg blocks is:', options: ['4 N', '8 N', '12 N', '16 N'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'phy-2025-003', year: 2025, session: 'Jan 23 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-laws-of-motion', chapterName: 'Laws of Motion', question: 'A block of mass 2 kg is placed on a horizontal surface with coefficient of friction 0.3. A horizontal force of 8 N is applied. The frictional force acting is (g = 10 m/s²):', options: ['4 N', '6 N', '8 N', '10 N'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2025-004', year: 2025, session: 'Apr 4 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-laws-of-motion', chapterName: 'Laws of Motion', question: 'A body of mass m is moving in a circle of radius r with constant speed v. The net force acting on the body is:', options: ['Zero', 'mv²/r', 'mvr', 'mv/r'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2026-002', year: 2026, session: 'Jan 23 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-laws-of-motion', chapterName: 'Laws of Motion', question: 'Two masses 4 kg and 6 kg are connected by a light string passing over a frictionless pulley. The acceleration of the system is (g = 10 m/s²):', options: ['1 m/s²', '2 m/s²', '3 m/s²', '4 m/s²'], correctOptionIndex: 1, difficulty: 'easy' },

  // Work, Energy & Power
  { id: 'phy-2024-006', year: 2024, session: 'Jan 27 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-work-energy-power', chapterName: 'Work, Energy & Power', question: 'A force F = (2i + 3j) N acts on a particle that undergoes a displacement d = (4i - j) m. The work done by the force is:', options: ['5 J', '8 J', '11 J', '14 J'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'phy-2024-007', year: 2024, session: 'Apr 6 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-work-energy-power', chapterName: 'Work, Energy & Power', question: 'A body of mass 2 kg is dropped from a height of 10 m. The kinetic energy just before hitting the ground is (g = 10 m/s²):', options: ['100 J', '150 J', '200 J', '250 J'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'phy-2025-005', year: 2025, session: 'Jan 24 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-work-energy-power', chapterName: 'Work, Energy & Power', question: 'A spring of spring constant 200 N/m is compressed by 5 cm. The potential energy stored in the spring is:', options: ['0.15 J', '0.25 J', '0.35 J', '0.50 J'], correctOptionIndex: 1, difficulty: 'easy' },

  // Electrostatics
  { id: 'phy-2024-008', year: 2024, session: 'Jan 29 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-electrostatics', chapterName: 'Electrostatics', question: 'Two charges +q and -2q are placed at a distance d apart. The point on the line joining them where the electric field is zero is:', options: ['At distance d from +q', 'At distance d/2 from +q', 'At distance d√2 from +q', 'At distance d/(√2+1) from +q'], correctOptionIndex: 3, difficulty: 'hard' },
  { id: 'phy-2024-009', year: 2024, session: 'Apr 4 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-electrostatics', chapterName: 'Electrostatics', question: 'The capacitance of a parallel plate capacitor with plate area A and separation d is C. If the separation is halved, the new capacitance is:', options: ['C/2', 'C', '2C', '4C'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'phy-2025-006', year: 2025, session: 'Jan 22 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-electrostatics', chapterName: 'Electrostatics', question: 'Two charges 2 μC and 8 μC are placed 10 cm apart. The distance of the point from the 2 μC charge where the electric potential is zero is:', options: ['2 cm', '4 cm', '6 cm', '8 cm'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'phy-2025-007', year: 2025, session: 'Apr 6 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-electrostatics', chapterName: 'Electrostatics', question: 'A charge q is placed at the center of a cube. The electric flux through one face of the cube is:', options: ['q/ε₀', 'q/2ε₀', 'q/4ε₀', 'q/6ε₀'], correctOptionIndex: 3, difficulty: 'medium' },
  { id: 'phy-2026-003', year: 2026, session: 'Jan 24 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-electrostatics', chapterName: 'Electrostatics', question: 'A capacitor of 4 μF is charged to 100 V. The energy stored in the capacitor is:', options: ['0.01 J', '0.02 J', '0.03 J', '0.04 J'], correctOptionIndex: 1, difficulty: 'easy' },

  // Current Electricity
  { id: 'phy-2024-010', year: 2024, session: 'Jan 30 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-current-electricity', chapterName: 'Current Electricity', question: 'Three resistors of 2 Ω, 3 Ω and 6 Ω are connected in parallel. The equivalent resistance is:', options: ['1 Ω', '2 Ω', '3 Ω', '4 Ω'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'phy-2024-011', year: 2024, session: 'Apr 5 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-current-electricity', chapterName: 'Current Electricity', question: 'A wire of length L and cross-sectional area A has resistance R. If the wire is stretched to twice its length, the new resistance becomes:', options: ['R/2', 'R', '2R', '4R'], correctOptionIndex: 3, difficulty: 'medium' },
  { id: 'phy-2025-008', year: 2025, session: 'Jan 28 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-current-electricity', chapterName: 'Current Electricity', question: 'In a Wheatstone bridge, the resistances are P = 10 Ω, Q = 20 Ω, S = 15 Ω. For the bridge to be balanced, R should be:', options: ['5.5 Ω', '7.5 Ω', '10.5 Ω', '12.5 Ω'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2025-009', year: 2025, session: 'Apr 5 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-current-electricity', chapterName: 'Current Electricity', question: 'A cell of emf 2 V and internal resistance 1 Ω is connected to an external resistance of 4 Ω. The terminal voltage is:', options: ['0.8 V', '1.2 V', '1.6 V', '2.0 V'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'phy-2026-004', year: 2026, session: 'Jan 22 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-current-electricity', chapterName: 'Current Electricity', question: 'The current through a 5 Ω resistor when connected across a 10 V battery is:', options: ['0.5 A', '1 A', '2 A', '5 A'], correctOptionIndex: 2, difficulty: 'easy' },

  // Magnetism & EMI
  { id: 'phy-2024-012', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-magnetism', chapterName: 'Magnetic Effects of Current & Magnetism', question: 'A long straight wire carries a current of 10 A. The magnetic field at a distance of 5 cm from the wire is:', options: ['2 × 10⁻⁵ T', '4 × 10⁻⁵ T', '6 × 10⁻⁵ T', '8 × 10⁻⁵ T'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2024-013', year: 2024, session: 'Apr 6 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-emi-ac', chapterName: 'Electromagnetic Induction & AC', question: 'A coil of 100 turns and area 0.05 m² is placed perpendicular to a magnetic field of 0.2 T. If the field is reduced to zero in 0.1 s, the induced emf is:', options: ['5 V', '10 V', '15 V', '20 V'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2025-010', year: 2025, session: 'Jan 23 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-magnetism', chapterName: 'Magnetic Effects of Current & Magnetism', question: 'Two parallel wires carry currents in opposite directions. The force between them is:', options: ['Attractive', 'Repulsive', 'Zero', 'Depends on current magnitude'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2025-011', year: 2025, session: 'Apr 4 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-emi-ac', chapterName: 'Electromagnetic Induction & AC', question: 'In an AC circuit, the instantaneous voltage is V = 100 sin(100πt). The frequency of the AC is:', options: ['25 Hz', '50 Hz', '100 Hz', '200 Hz'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2026-005', year: 2026, session: 'Jan 23 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-emi-ac', chapterName: 'Electromagnetic Induction & AC', question: 'The power factor of a pure inductor in an AC circuit is:', options: ['0', '0.5', '1/√2', '1'], correctOptionIndex: 0, difficulty: 'easy' },

  // Optics
  { id: 'phy-2024-014', year: 2024, session: 'Jan 28 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-optics', chapterName: 'Optics', question: 'A convex lens of focal length 20 cm forms a real image at a distance of 60 cm from the lens. The object distance is:', options: ['15 cm', '30 cm', '40 cm', '45 cm'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2024-015', year: 2024, session: 'Apr 4 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-optics', chapterName: 'Optics', question: 'In Young\'s double slit experiment, the fringe width is 0.5 mm. If the wavelength of light is increased by 20%, the new fringe width is:', options: ['0.4 mm', '0.5 mm', '0.6 mm', '0.7 mm'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'phy-2025-012', year: 2025, session: 'Jan 24 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-optics', chapterName: 'Optics', question: 'The critical angle for a medium with refractive index 1.5 is approximately:', options: ['38.2°', '41.8°', '45.0°', '48.6°'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2025-013', year: 2025, session: 'Apr 6 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-optics', chapterName: 'Optics', question: 'A concave mirror of focal length 15 cm forms a virtual image twice the size of the object. The object distance is:', options: ['5.5 cm', '7.5 cm', '10.5 cm', '12.5 cm'], correctOptionIndex: 1, difficulty: 'hard' },

  // Modern Physics
  { id: 'phy-2024-016', year: 2024, session: 'Jan 29 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-dual-nature', chapterName: 'Dual Nature of Matter & Radiation', question: 'The work function of a metal is 2 eV. The threshold wavelength for photoelectric emission is (h = 6.63 × 10⁻³⁴ J·s):', options: ['310 nm', '420 nm', '620 nm', '830 nm'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'phy-2024-017', year: 2024, session: 'Apr 5 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-atoms-nuclei', chapterName: 'Atoms & Nuclei', question: 'The half-life of a radioactive substance is 10 days. The time taken for 75% of the sample to decay is:', options: ['10 days', '20 days', '30 days', '40 days'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'phy-2025-014', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-dual-nature', chapterName: 'Dual Nature of Matter & Radiation', question: 'The de Broglie wavelength of an electron with kinetic energy 100 eV is approximately:', options: ['0.123 nm', '0.223 nm', '0.323 nm', '0.423 nm'], correctOptionIndex: 0, difficulty: 'hard' },
  { id: 'phy-2025-015', year: 2025, session: 'Apr 5 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-atoms-nuclei', chapterName: 'Atoms & Nuclei', question: 'The binding energy per nucleon of Fe-56 is approximately:', options: ['4.6 MeV', '6.6 MeV', '8.6 MeV', '10.6 MeV'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'phy-2026-006', year: 2026, session: 'Jan 24 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-electronic-devices', chapterName: 'Electronic Devices', question: 'In a common emitter transistor amplifier, the phase difference between input and output signals is:', options: ['0°', '90°', '180°', '270°'], correctOptionIndex: 2, difficulty: 'easy' },

  // Gravitation
  { id: 'phy-2024-018', year: 2024, session: 'Jan 27 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-gravitation', chapterName: 'Gravitation', question: 'The escape velocity from the surface of Earth is about 11.2 km/s. The escape velocity from a planet with twice the radius and half the density of Earth is:', options: ['5.6 km/s', '7.9 km/s', '11.2 km/s', '15.8 km/s'], correctOptionIndex: 2, difficulty: 'hard' },
  { id: 'phy-2025-016', year: 2025, session: 'Jan 29 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-gravitation', chapterName: 'Gravitation', question: 'The period of revolution of a satellite in a circular orbit of radius R is T. The period of a satellite in an orbit of radius 4R is:', options: ['2T', '4T', '8T', '16T'], correctOptionIndex: 2, difficulty: 'medium' },

  // Thermodynamics
  { id: 'phy-2024-019', year: 2024, session: 'Jan 30 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-thermodynamics', chapterName: 'Thermodynamics', question: 'In an isothermal expansion of an ideal gas, which of the following remains constant?', options: ['Pressure', 'Volume', 'Temperature', 'Internal energy'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'phy-2025-017', year: 2025, session: 'Jan 23 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-thermodynamics', chapterName: 'Thermodynamics', question: 'The efficiency of a Carnot engine operating between 127°C and 27°C is:', options: ['20%', '25%', '30%', '50%'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2026-007', year: 2026, session: 'Jan 22 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-thermodynamics', chapterName: 'Thermodynamics', question: 'For an adiabatic process involving an ideal gas, PV^γ = constant. For a monatomic gas, γ is:', options: ['5/3', '7/5', '4/3', '3/2'], correctOptionIndex: 0, difficulty: 'easy' },

  // Rotational Motion
  { id: 'phy-2024-020', year: 2024, session: 'Apr 6 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-rotational-motion', chapterName: 'Rotational Motion', question: 'A solid sphere and a hollow sphere of the same mass and radius roll down an inclined plane without slipping. Which reaches the bottom first?', options: ['Solid sphere', 'Hollow sphere', 'Both together', 'Depends on angle'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'phy-2025-018', year: 2025, session: 'Jan 28 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-rotational-motion', chapterName: 'Rotational Motion', question: 'The moment of inertia of a thin circular ring of mass M and radius R about an axis passing through its center and perpendicular to its plane is:', options: ['MR²/2', 'MR²', '2MR²', 'MR²/4'], correctOptionIndex: 1, difficulty: 'easy' },

  // Oscillations & Waves
  { id: 'phy-2024-021', year: 2024, session: 'Jan 28 Shift 2', shift: 2, subject: 'physics', chapterId: 'phy-oscillations-waves', chapterName: 'Oscillations & Waves', question: 'The time period of a simple pendulum on Earth is 2 s. The time period of the same pendulum on a planet where g is four times that on Earth is:', options: ['0.5 s', '1 s', '2 s', '4 s'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'phy-2025-019', year: 2025, session: 'Apr 4 Shift 1', shift: 1, subject: 'physics', chapterId: 'phy-oscillations-waves', chapterName: 'Oscillations & Waves', question: 'A wave is represented by y = 0.05 sin(100t - 5x). The wavelength of the wave is:', options: ['0.4π m', '0.8π m', '1.2π m', '1.6π m'], correctOptionIndex: 0, difficulty: 'medium' },
]

/* ─── Chemistry PYQs ─── */
const CHEMISTRY_PYQS: PYQEntry[] = [
  // Basic Concepts (Mole)
  { id: 'chem-2024-001', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-basic-concepts', chapterName: 'Basic Concepts', question: 'The number of moles in 4.4 g of CO₂ is:', options: ['0.05', '0.1', '0.2', '0.4'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2024-002', year: 2024, session: 'Jan 29 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-basic-concepts', chapterName: 'Basic Concepts', question: 'The mass of one atom of carbon-12 is:', options: ['1.66 × 10⁻²⁴ g', '1.99 × 10⁻²³ g', '2.66 × 10⁻²³ g', '3.99 × 10⁻²³ g'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'chem-2025-001', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-basic-concepts', chapterName: 'Basic Concepts', question: 'The molarity of a solution containing 5.85 g of NaCl in 500 mL of solution is:', options: ['0.1 M', '0.2 M', '0.3 M', '0.4 M'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2026-001', year: 2026, session: 'Jan 22 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-basic-concepts', chapterName: 'Basic Concepts', question: 'How many grams of NaOH are required to prepare 250 mL of 0.5 M solution?', options: ['2 g', '5 g', '10 g', '20 g'], correctOptionIndex: 1, difficulty: 'easy' },

  // Atomic Structure
  { id: 'chem-2024-003', year: 2024, session: 'Jan 28 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-atomic-structure', chapterName: 'Atomic Structure', question: 'The number of electrons in the outermost shell of a chlorine atom (atomic number 17) is:', options: ['5', '6', '7', '8'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'chem-2024-004', year: 2024, session: 'Apr 4 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-atomic-structure', chapterName: 'Atomic Structure', question: 'The maximum number of electrons that can have n = 3 and l = 2 is:', options: ['2', '6', '10', '14'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'chem-2025-002', year: 2025, session: 'Jan 23 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-atomic-structure', chapterName: 'Atomic Structure', question: 'The energy of an electron in the nth orbit of hydrogen atom is proportional to:', options: ['n', 'n²', '1/n', '1/n²'], correctOptionIndex: 3, difficulty: 'easy' },
  { id: 'chem-2026-002', year: 2026, session: 'Jan 23 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-atomic-structure', chapterName: 'Atomic Structure', question: 'The wavelength of the first line of the Balmer series of hydrogen atom is 656.3 nm. The wavelength of the first line of the Lyman series is:', options: ['91.2 nm', '121.6 nm', '182.4 nm', '243.2 nm'], correctOptionIndex: 1, difficulty: 'hard' },

  // Chemical Bonding
  { id: 'chem-2024-005', year: 2024, session: 'Jan 29 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-chemical-bonding', chapterName: 'Chemical Bonding', question: 'The shape of NH₃ molecule according to VSEPR theory is:', options: ['Trigonal planar', 'Tetrahedral', 'Trigonal pyramidal', 'Square planar'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'chem-2024-006', year: 2024, session: 'Apr 5 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-chemical-bonding', chapterName: 'Chemical Bonding', question: 'The bond order of O₂ molecule is:', options: ['1', '1.5', '2', '2.5'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'chem-2025-003', year: 2025, session: 'Jan 24 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-chemical-bonding', chapterName: 'Chemical Bonding', question: 'Which of the following has the highest dipole moment?', options: ['CO₂', 'H₂O', 'BF₃', 'CCl₄'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2025-004', year: 2025, session: 'Apr 6 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-chemical-bonding', chapterName: 'Chemical Bonding', question: 'The hybridization of carbon in methane is:', options: ['sp', 'sp²', 'sp³', 'dsp²'], correctOptionIndex: 2, difficulty: 'easy' },

  // Thermodynamics
  { id: 'chem-2024-007', year: 2024, session: 'Jan 27 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-thermodynamics', chapterName: 'Thermodynamics', question: 'The enthalpy of formation of H₂O(l) is -286 kJ/mol. The enthalpy change for the reaction 2H₂(g) + O₂(g) → 2H₂O(l) is:', options: ['-286 kJ', '-572 kJ', '+286 kJ', '+572 kJ'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2025-005', year: 2025, session: 'Jan 22 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-thermodynamics', chapterName: 'Thermodynamics', question: 'For a spontaneous reaction, the Gibbs free energy change ΔG is:', options: ['Positive', 'Negative', 'Zero', 'Depends on temperature'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2026-003', year: 2026, session: 'Jan 24 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-thermodynamics', chapterName: 'Thermodynamics', question: 'The entropy of the universe for a spontaneous process:', options: ['Decreases', 'Increases', 'Remains constant', 'Becomes zero'], correctOptionIndex: 1, difficulty: 'easy' },

  // Equilibrium
  { id: 'chem-2024-008', year: 2024, session: 'Jan 30 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-equilibrium', chapterName: 'Equilibrium', question: 'The pH of 0.001 M HCl solution is:', options: ['1', '2', '3', '4'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'chem-2024-009', year: 2024, session: 'Apr 6 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-equilibrium', chapterName: 'Equilibrium', question: 'For the reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g), Kp = 4 × 10⁻³ at 400°C. The unit of Kp is:', options: ['atm⁻²', 'atm⁻¹', 'atm', 'atm²'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'chem-2025-006', year: 2025, session: 'Jan 28 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-equilibrium', chapterName: 'Equilibrium', question: 'The solubility product of AgCl is 1.6 × 10⁻¹⁰. The solubility of AgCl in water is:', options: ['1.26 × 10⁻⁵ M', '2.52 × 10⁻⁵ M', '3.78 × 10⁻⁵ M', '5.04 × 10⁻⁵ M'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'chem-2026-004', year: 2026, session: 'Jan 22 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-equilibrium', chapterName: 'Equilibrium', question: 'The conjugate base of H₂PO₄⁻ is:', options: ['H₃PO₄', 'HPO₄²⁻', 'PO₄³⁻', 'H₂PO₄'], correctOptionIndex: 1, difficulty: 'easy' },

  // Redox & Electrochemistry
  { id: 'chem-2024-010', year: 2024, session: 'Apr 4 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-redox-electrochemistry', chapterName: 'Redox & Electrochemistry', question: 'The standard electrode potential for Cu²⁺/Cu is +0.34 V and for Zn²⁺/Zn is -0.76 V. The emf of the cell Zn|Zn²⁺||Cu²⁺|Cu is:', options: ['0.42 V', '0.84 V', '1.10 V', '1.36 V'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'chem-2025-007', year: 2025, session: 'Jan 29 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-redox-electrochemistry', chapterName: 'Redox & Electrochemistry', question: 'In the reaction CuSO₄ + Zn → ZnSO₄ + Cu, the oxidizing agent is:', options: ['CuSO₄', 'Zn', 'ZnSO₄', 'Cu'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'chem-2026-005', year: 2026, session: 'Jan 23 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-redox-electrochemistry', chapterName: 'Redox & Electrochemistry', question: 'The number of electrons involved in the electrolysis of 1 mole of Al₂O₃ to produce Al is:', options: ['2', '3', '4', '6'], correctOptionIndex: 3, difficulty: 'medium' },

  // Organic Chemistry
  { id: 'chem-2024-011', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-goc', chapterName: 'General Organic Chemistry', question: 'The IUPAC name of CH₃CH₂CH₂CH₂OH is:', options: ['Butanol', 'Butan-1-ol', 'Butan-2-ol', '2-Methylpropanol'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2024-012', year: 2024, session: 'Jan 30 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-hydrocarbons', chapterName: 'Hydrocarbons', question: 'The product formed when benzene is treated with CH₃Cl in presence of anhydrous AlCl₃ is:', options: ['Chlorobenzene', 'Toluene', 'Xylene', 'Ethylbenzene'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'chem-2024-013', year: 2024, session: 'Apr 5 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-carbonyl-compounds', chapterName: 'Aldehydes, Ketones & Carboxylic Acids', question: 'The reagent used to distinguish between acetaldehyde and acetone is:', options: ['Fehling\'s solution', 'Benedict\'s reagent', 'Tollen\'s reagent', 'All of the above'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'chem-2025-008', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-goc', chapterName: 'General Organic Chemistry', question: 'The most stable carbocation among the following is:', options: ['CH₃⁺', 'CH₃CH₂⁺', '(CH₃)₂CH⁺', '(CH₃)₃C⁺'], correctOptionIndex: 3, difficulty: 'easy' },
  { id: 'chem-2025-009', year: 2025, session: 'Jan 23 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-haloalkanes', chapterName: 'Haloalkanes & Haloarenes', question: 'The product obtained when ethyl chloride is treated with alcoholic KOH is:', options: ['Ethanol', 'Ethylene', 'Ethane', 'Diethyl ether'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'chem-2025-010', year: 2025, session: 'Apr 4 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-alcohols-phenols', chapterName: 'Alcohols, Phenols & Ethers', question: 'The reagent used to convert phenol to salicylic acid is:', options: ['NaOH/CO₂', 'KOH/CO₂', 'NaHCO₃', 'KMnO₄'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'chem-2026-006', year: 2026, session: 'Jan 24 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-amines', chapterName: 'Amines', question: 'Aniline on reaction with Br₂ water gives:', options: ['o-Bromoaniline', 'p-Bromoaniline', '2,4,6-Tribromoaniline', '3,5-Dibromoaniline'], correctOptionIndex: 2, difficulty: 'medium' },

  // Coordination Compounds
  { id: 'chem-2024-014', year: 2024, session: 'Apr 6 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-coordination-compounds', chapterName: 'Coordination Compounds', question: 'The oxidation state of cobalt in [Co(NH₃)₆]Cl₃ is:', options: ['+1', '+2', '+3', '+4'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'chem-2025-011', year: 2025, session: 'Jan 24 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-coordination-compounds', chapterName: 'Coordination Compounds', question: 'The coordination number of Fe in [Fe(C₂O₄)₃]³⁻ is:', options: ['3', '4', '5', '6'], correctOptionIndex: 3, difficulty: 'medium' },

  // Chemical Kinetics
  { id: 'chem-2024-015', year: 2024, session: 'Jan 28 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-chemical-kinetics', chapterName: 'Chemical Kinetics', question: 'For a first order reaction, the half-life is 10 minutes. The time required for 90% completion is:', options: ['20 min', '33.2 min', '50 min', '66.4 min'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'chem-2025-012', year: 2025, session: 'Apr 5 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-chemical-kinetics', chapterName: 'Chemical Kinetics', question: 'The unit of rate constant for a zero order reaction is:', options: ['s⁻¹', 'mol L⁻¹ s⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹'], correctOptionIndex: 1, difficulty: 'easy' },

  // p-Block
  { id: 'chem-2024-016', year: 2024, session: 'Apr 4 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-p-block', chapterName: 'p-Block', question: 'The gas produced when ammonia is oxidized in presence of platinum catalyst is:', options: ['N₂', 'NO', 'NO₂', 'N₂O₅'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'chem-2025-013', year: 2025, session: 'Jan 28 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-p-block', chapterName: 'p-Block', question: 'The acidic strength order of oxoacids of chlorine is:', options: ['HClO > HClO₂ > HClO₃ > HClO₄', 'HClO₄ > HClO₃ > HClO₂ > HClO', 'HClO₂ > HClO > HClO₄ > HClO₃', 'HClO₃ > HClO₄ > HClO₂ > HClO'], correctOptionIndex: 1, difficulty: 'medium' },

  // Solutions
  { id: 'chem-2025-014', year: 2025, session: 'Apr 6 Shift 1', shift: 1, subject: 'chemistry', chapterId: 'chem-solutions', chapterName: 'Solutions', question: 'The vapour pressure of a solution prepared by dissolving 18 g of glucose in 180 g of water at 100°C is (vapour pressure of pure water at 100°C is 760 mm Hg):', options: ['752 mm Hg', '756 mm Hg', '760 mm Hg', '764 mm Hg'], correctOptionIndex: 0, difficulty: 'hard' },
  { id: 'chem-2026-007', year: 2026, session: 'Jan 22 Shift 2', shift: 2, subject: 'chemistry', chapterId: 'chem-solutions', chapterName: 'Solutions', question: 'The boiling point of 0.5 m aqueous solution of KCl (assuming complete dissociation) is (Kb = 0.52 K kg/mol):', options: ['99.48°C', '100°C', '100.26°C', '100.52°C'], correctOptionIndex: 3, difficulty: 'medium' },
]

/* ─── Maths PYQs ─── */
const MATHS_PYQS: PYQEntry[] = [
  // Sets & Functions
  { id: 'math-2024-001', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-sets-functions', chapterName: 'Sets & Functions', question: 'If A = {x: x is a prime number ≤ 10} and B = {x: x is an even number ≤ 10}, then A ∩ B is:', options: ['{2}', '{2, 4}', '{2, 3, 5, 7}', '{4, 6, 8, 10}'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'math-2025-001', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-sets-functions', chapterName: 'Sets & Functions', question: 'If f(x) = x² + 1 and g(x) = 2x - 3, then (f∘g)(1) is:', options: ['-1', '0', '1', '2'], correctOptionIndex: 3, difficulty: 'easy' },

  // Complex Numbers
  { id: 'math-2024-002', year: 2024, session: 'Jan 27 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-complex-numbers', chapterName: 'Complex Numbers & Quadratic Equations', question: 'The modulus of (1 + i)/(1 - i) is:', options: ['0', '1', '√2', '2'], correctOptionIndex: 1, difficulty: 'medium' },
  { id: 'math-2024-003', year: 2024, session: 'Jan 29 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-complex-numbers', chapterName: 'Complex Numbers & Quadratic Equations', question: 'The sum of the roots of the equation 2x² - 5x + 3 = 0 is:', options: ['-5/2', '-3/2', '3/2', '5/2'], correctOptionIndex: 3, difficulty: 'easy' },
  { id: 'math-2025-002', year: 2025, session: 'Jan 23 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-complex-numbers', chapterName: 'Complex Numbers & Quadratic Equations', question: 'If 1, ω, ω² are cube roots of unity, then (1 + ω)(1 + ω²) is:', options: ['-1', '0', '1', '2'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'math-2026-001', year: 2026, session: 'Jan 22 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-complex-numbers', chapterName: 'Complex Numbers & Quadratic Equations', question: 'The conjugate of (3 - 4i)/(2 + i) is:', options: ['(2 - 11i)/5', '(2 + 11i)/5', '(2 - 11i)/3', '(2 + 11i)/3'], correctOptionIndex: 0, difficulty: 'hard' },

  // Matrices & Determinants
  { id: 'math-2024-004', year: 2024, session: 'Jan 28 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-matrices-determinants', chapterName: 'Matrices & Determinants', question: 'If A = [[1, 2], [3, 4]], then the determinant of A is:', options: ['-2', '2', '10', '-10'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'math-2024-005', year: 2024, session: 'Apr 4 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-matrices-determinants', chapterName: 'Matrices & Determinants', question: 'If matrix A is such that A² = A, then A is called:', options: ['Symmetric', 'Skew-symmetric', 'Idempotent', 'Involutory'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'math-2025-003', year: 2025, session: 'Jan 22 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-matrices-determinants', chapterName: 'Matrices & Determinants', question: 'The value of the determinant |[1, 1, 1], [a, b, c], [a², b², c²]| is:', options: ['(a-b)(b-c)(c-a)', '0', 'abc', 'a+b+c'], correctOptionIndex: 0, difficulty: 'hard' },
  { id: 'math-2025-004', year: 2025, session: 'Apr 4 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-matrices-determinants', chapterName: 'Matrices & Determinants', question: 'If A is a 3×3 matrix with |A| = 4, then |2A| is:', options: ['8', '16', '24', '32'], correctOptionIndex: 3, difficulty: 'easy' },
  { id: 'math-2026-002', year: 2026, session: 'Jan 23 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-matrices-determinants', chapterName: 'Matrices & Determinants', question: 'If A = [[2, 3], [1, 2]], then A⁻¹ is:', options: ['[[2, -3], [-1, 2]]', '[[-2, 3], [1, -2]]', '[[2, 3], [1, 2]]', '[[-2, -3], [-1, -2]]'], correctOptionIndex: 0, difficulty: 'medium' },

  // Calculus
  { id: 'math-2024-006', year: 2024, session: 'Jan 27 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-limits-continuity', chapterName: 'Limit, Continuity & Differentiability', question: 'The value of lim(x→0) sin(3x)/x is:', options: ['0', '1', '2', '3'], correctOptionIndex: 3, difficulty: 'easy' },
  { id: 'math-2024-007', year: 2024, session: 'Jan 30 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-limits-continuity', chapterName: 'Limit, Continuity & Differentiability', question: 'The derivative of x² with respect to x is:', options: ['x', '2x', 'x²', 'x²/2'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2024-008', year: 2024, session: 'Apr 4 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-integral-calculus', chapterName: 'Integral Calculus & Differential Equations', question: 'The value of ∫(0 to 1) x² dx is:', options: ['1/4', '1/3', '1/2', '1'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2025-005', year: 2025, session: 'Jan 23 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-limits-continuity', chapterName: 'Limit, Continuity & Differentiability', question: 'The function f(x) = |x| at x = 0 is:', options: ['Continuous and differentiable', 'Continuous but not differentiable', 'Not continuous but differentiable', 'Neither continuous nor differentiable'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2025-006', year: 2025, session: 'Jan 24 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-integral-calculus', chapterName: 'Integral Calculus & Differential Equations', question: 'The differential equation dy/dx = x/y represents a family of:', options: ['Straight lines', 'Parabolas', 'Circles', 'Hyperbolas'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'math-2025-007', year: 2025, session: 'Jan 28 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-integral-calculus', chapterName: 'Integral Calculus & Differential Equations', question: 'The area bounded by y = x² and y = x is:', options: ['1/2 sq unit', '1/3 sq unit', '1/6 sq unit', '1/12 sq unit'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'math-2026-003', year: 2026, session: 'Jan 22 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-limits-continuity', chapterName: 'Limit, Continuity & Differentiability', question: 'If f(x) = x³, then f\'(2) using first principle is:', options: ['4', '8', '12', '16'], correctOptionIndex: 2, difficulty: 'medium' },
  { id: 'math-2026-004', year: 2026, session: 'Jan 24 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-integral-calculus', chapterName: 'Integral Calculus & Differential Equations', question: '∫(1/x) dx is:', options: ['ln|x| + C', 'eˣ + C', 'x²/2 + C', 'x + C'], correctOptionIndex: 0, difficulty: 'easy' },

  // Coordinate Geometry
  { id: 'math-2024-009', year: 2024, session: 'Jan 28 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-coordinate-geometry', chapterName: 'Coordinate Geometry', question: 'The distance between the points (2, 3) and (5, 7) is:', options: ['3', '4', '5', '6'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'math-2024-010', year: 2024, session: 'Apr 5 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-coordinate-geometry', chapterName: 'Coordinate Geometry', question: 'The slope of the line passing through (1, 2) and (3, 6) is:', options: ['1', '2', '3', '4'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2025-008', year: 2025, session: 'Jan 22 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-coordinate-geometry', chapterName: 'Coordinate Geometry', question: 'The equation of the circle with center at (2, -3) and radius 4 is:', options: ['(x-2)²+(y+3)²=16', '(x+2)²+(y-3)²=16', '(x-2)²+(y+3)²=4', '(x+2)²+(y-3)²=4'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'math-2025-009', year: 2025, session: 'Apr 5 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-coordinate-geometry', chapterName: 'Coordinate Geometry', question: 'The eccentricity of the ellipse x²/16 + y²/9 = 1 is:', options: ['√7/4', '√7/3', '7/4', '7/3'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'math-2026-005', year: 2026, session: 'Jan 23 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-coordinate-geometry', chapterName: 'Coordinate Geometry', question: 'The focus of the parabola y² = 8x is at:', options: ['(0, 2)', '(2, 0)', '(0, 4)', '(4, 0)'], correctOptionIndex: 1, difficulty: 'medium' },

  // 3D Geometry
  { id: 'math-2024-011', year: 2024, session: 'Jan 29 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-3d-geometry', chapterName: '3D Geometry', question: 'The distance of point (1, 2, 3) from the plane x + 2y + 2z = 14 is:', options: ['1', '2', '3', '4'], correctOptionIndex: 0, difficulty: 'medium' },
  { id: 'math-2025-010', year: 2025, session: 'Jan 29 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-3d-geometry', chapterName: '3D Geometry', question: 'The direction cosines of the line joining (1, 0, 1) and (2, 1, 0) are:', options: ['(1/√3, 1/√3, -1/√3)', '(1/√3, 1/√3, 1/√3)', '(1/2, 1/2, -1/2)', '(1/2, 1/2, 1/2)'], correctOptionIndex: 0, difficulty: 'medium' },

  // Trigonometry
  { id: 'math-2024-012', year: 2024, session: 'Jan 30 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-trigonometry', chapterName: 'Trigonometry', question: 'The value of sin(90° - θ) is:', options: ['sin θ', 'cos θ', 'tan θ', 'cot θ'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2024-013', year: 2024, session: 'Apr 6 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-trigonometry', chapterName: 'Trigonometry', question: 'If tan θ = 3/4, then sin θ is:', options: ['3/5', '4/5', '3/4', '4/3'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'math-2025-011', year: 2025, session: 'Jan 24 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-trigonometry', chapterName: 'Trigonometry', question: 'The principal value of sin⁻¹(1/2) is:', options: ['π/3', 'π/6', 'π/4', 'π/2'], correctOptionIndex: 1, difficulty: 'easy' },

  // Probability
  { id: 'math-2024-014', year: 2024, session: 'Apr 5 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-statistics-probability', chapterName: 'Statistics & Probability', question: 'The probability of getting a head when a fair coin is tossed is:', options: ['0', '1/4', '1/2', '1'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'math-2025-012', year: 2025, session: 'Jan 28 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-statistics-probability', chapterName: 'Statistics & Probability', question: 'A bag contains 3 red, 4 blue and 2 green balls. The probability of drawing a red ball is:', options: ['1/3', '2/9', '4/9', '5/9'], correctOptionIndex: 0, difficulty: 'easy' },
  { id: 'math-2026-006', year: 2026, session: 'Jan 24 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-statistics-probability', chapterName: 'Statistics & Probability', question: 'The variance of the numbers 2, 4, 6, 8, 10 is:', options: ['4', '6', '8', '10'], correctOptionIndex: 2, difficulty: 'medium' },

  // Vector Algebra
  { id: 'math-2024-015', year: 2024, session: 'Jan 27 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-vector-algebra', chapterName: 'Vector Algebra', question: 'If a = (i + j) and b = (i - j), then a·b is:', options: ['-2', '-1', '0', '2'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'math-2025-013', year: 2025, session: 'Apr 6 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-vector-algebra', chapterName: 'Vector Algebra', question: 'The magnitude of the vector 3i + 4j is:', options: ['3', '4', '5', '7'], correctOptionIndex: 2, difficulty: 'easy' },

  // Permutations & Combinations
  { id: 'math-2024-016', year: 2024, session: 'Apr 6 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-permutations-combinations', chapterName: 'Permutations & Combinations', question: 'The number of ways to arrange the letters of the word "JEE" is:', options: ['2', '3', '4', '6'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2025-014', year: 2025, session: 'Jan 22 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-permutations-combinations', chapterName: 'Permutations & Combinations', question: 'The number of ways to select 2 students from a group of 5 is:', options: ['5', '10', '15', '20'], correctOptionIndex: 1, difficulty: 'easy' },

  // Binomial Theorem
  { id: 'math-2024-017', year: 2024, session: 'Jan 30 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-binomial-theorem', chapterName: 'Binomial Theorem', question: 'The coefficient of x² in the expansion of (1 + x)⁵ is:', options: ['5', '10', '15', '20'], correctOptionIndex: 1, difficulty: 'easy' },
  { id: 'math-2025-015', year: 2025, session: 'Apr 5 Shift 2', shift: 2, subject: 'maths', chapterId: 'math-binomial-theorem', chapterName: 'Binomial Theorem', question: 'The middle term in the expansion of (x + 1/x)⁶ is:', options: ['15', '20', '25', '30'], correctOptionIndex: 1, difficulty: 'medium' },

  // Sequence & Series
  { id: 'math-2024-018', year: 2024, session: 'Jan 29 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-sequence-series', chapterName: 'Sequence & Series', question: 'The 10th term of the AP: 2, 5, 8, 11, ... is:', options: ['26', '28', '29', '30'], correctOptionIndex: 2, difficulty: 'easy' },
  { id: 'math-2025-016', year: 2025, session: 'Jan 23 Shift 1', shift: 1, subject: 'maths', chapterId: 'math-sequence-series', chapterName: 'Sequence & Series', question: 'The sum of the infinite GP: 1, 1/2, 1/4, 1/8, ... is:', options: ['1', '1.5', '2', '2.5'], correctOptionIndex: 2, difficulty: 'easy' },
]

/* ─── Mock Tests ─── */
export interface MockTestDef {
  id: string
  name: string
  year: number
  session: string
  durationMinutes: number
  questionIds: string[]
}

/* All PYQs combined */
export const ALL_PYQS: PYQEntry[] = [...PHYSICS_PYQS, ...CHEMISTRY_PYQS, ...MATHS_PYQS, ...PHYSICS_PYQS_NEW, ...CHEMISTRY_PYQS_NEW, ...MATHS_PYQS_NEW]

/* All new PYQs combined (for mock tests targeting new data) */
export const ALL_NEW_PYQS: PYQEntry[] = ALL_PYQS_NEW

/* Get by subject */
export function getPYQsBySubject(subject: Subject): PYQEntry[] {
  return ALL_PYQS.filter(q => q.subject === subject)
}

/* Get by chapter */
export function getPYQsByChapter(chapterId: string): PYQEntry[] {
  return ALL_PYQS.filter(q => q.chapterId === chapterId)
}

/* Get by year */
export function getPYQsByYear(year: number): PYQEntry[] {
  return ALL_PYQS.filter(q => q.year === year)
}

/* Chapter name lookup */
export const CHAPTER_NAMES: Record<Subject, Record<string, string>> = {
  physics: PHYSICS_CHAPTERS,
  chemistry: CHEMISTRY_CHAPTERS,
  maths: MATHS_CHAPTERS,
}

/* Mock Tests — 75 questions each (full JEE Main shift) */
export const MOCK_TESTS: MockTestDef[] = [
  {
    id: 'mock-2024-jan',
    name: 'JEE Main 2024 January — Full Mock',
    year: 2024,
    session: 'Jan',
    durationMinutes: 180,
    questionIds: ALL_PYQS.filter(q => q.year === 2024 && q.session.includes('Jan')).map(q => q.id).slice(0, 75),
  },
  {
    id: 'mock-2024-apr',
    name: 'JEE Main 2024 April — Full Mock',
    year: 2024,
    session: 'Apr',
    durationMinutes: 180,
    questionIds: ALL_PYQS.filter(q => q.year === 2024 && q.session.includes('Apr')).map(q => q.id).slice(0, 75),
  },
  {
    id: 'mock-2025-jan',
    name: 'JEE Main 2025 January — Full Mock',
    year: 2025,
    session: 'Jan',
    durationMinutes: 180,
    questionIds: ALL_PYQS.filter(q => q.year === 2025 && q.session.includes('Jan')).map(q => q.id).slice(0, 75),
  },
  {
    id: 'mock-mixed-1',
    name: 'Combined Practice Test 1',
    year: 2026,
    session: 'Practice',
    durationMinutes: 180,
    questionIds: ALL_PYQS.slice(0, 75).map(q => q.id),
  },
  {
    id: 'mock-mixed-2',
    name: 'Combined Practice Test 2',
    year: 2026,
    session: 'Practice',
    durationMinutes: 180,
    questionIds: ALL_PYQS.slice(75, 150).map(q => q.id),
  },
  {
    id: 'mock-new-1',
    name: 'New Questions Practice — Physics',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: PHYSICS_PYQS_NEW.slice(0, 75).map(q => q.id),
  },
  {
    id: 'mock-new-2',
    name: 'New Questions Practice — Chemistry',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: CHEMISTRY_PYQS_NEW.slice(0, 75).map(q => q.id),
  },
  {
    id: 'mock-new-3',
    name: 'New Questions Practice — Maths',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: MATHS_PYQS_NEW.slice(0, 75).map(q => q.id),
  },
  {
    id: 'mock-subject-physics',
    name: 'Physics Subject Test',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: [...PHYSICS_PYQS, ...PHYSICS_PYQS_NEW].map(q => q.id).slice(0, 75),
  },
  {
    id: 'mock-subject-chemistry',
    name: 'Chemistry Subject Test',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: [...CHEMISTRY_PYQS, ...CHEMISTRY_PYQS_NEW].map(q => q.id).slice(0, 75),
  },
  {
    id: 'mock-subject-maths',
    name: 'Maths Subject Test',
    year: 2026,
    session: 'Practice',
    durationMinutes: 90,
    questionIds: [...MATHS_PYQS, ...MATHS_PYQS_NEW].map(q => q.id).slice(0, 75),
  },
]
