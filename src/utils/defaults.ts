import type { RoutineTemplate } from '@/types';

const uid = () => Math.random().toString(36).slice(2, 10);

function r(name: string, sets: number, w?: number, reps?: number): { name: string; sets: number; defaultWeight?: number; defaultReps?: number } {
  return { name, sets, defaultWeight: w, defaultReps: reps };
}

export const DEFAULT_WEIGHT = 30;
export const DEFAULT_REPS = 12;

export function buildDefaultRoutines(): RoutineTemplate[] {
  return [
    {
      id: uid(),
      name: 'PUSH',
      exercises: [
        r('Press Inc. Máquina', 3, 40, 10),
        r('Press Plano Manc.', 3, 30, 10),
        r('Cruces en Polea', 2, 20, 12),
        r('Triceps tras nuca', 3, 25, 12),
        r('Pushdown Cuerda', 2, 30, 12),
      ],
    },
    {
      id: uid(),
      name: 'PULL',
      exercises: [
        r('Jalón Neutro', 3, 50, 10),
        r('Remo apoyo pecho', 3, 40, 10),
        r('Pullover Polea', 2, 25, 12),
        r('Curl Inclinado', 3, 15, 12),
        r('Curl Martillo', 2, 18, 12),
      ],
    },
    {
      id: uid(),
      name: 'LOWER',
      exercises: [
        r('RDL Rumano', 3, 60, 10),
        r('Prensa -Pies altos-', 3, 120, 12),
        r('Curl Femoral Sent.', 3, 40, 12),
        r('Ext. Cuadriceps', 2, 50, 12),
        r('Gemelo Prensa', 4, 100, 15),
      ],
    },
    {
      id: uid(),
      name: 'UPPER',
      exercises: [
        r('Press Convergente', 3, 35, 10),
        r('Remo Polea Ancho', 3, 45, 10),
        r('Elev. Laterales', 4, 12, 14),
        r('Bayesian Curl', 2, 16, 12),
        r('Ext. Cross-body', 2, 20, 12),
      ],
    },
    {
      id: uid(),
      name: 'FULL BODY',
      exercises: [
        r('Press Plano Máq.', 3, 40, 10),
        r('Jalón Neutro Ancho', 3, 55, 10),
        r('Prensa -Pies sep.-', 3, 140, 12),
        r('RDL Mancuernas', 2, 30, 10),
        r('Elev. Polea Tras.', 3, 14, 14),
        r('Bayesian Curl', 2, 16, 12),
        r('Press Francés M.', 2, 25, 12),
      ],
    },
  ];
}
