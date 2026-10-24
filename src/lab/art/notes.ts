import type { L } from '../../content/types'

/**
 * The caption of each Core painting, per style. The generators (rothko.ts, mondrian.ts) read them, and so does the
 * page (the card hover and the Technique section), which is why they live in this small file of their own: the page
 * never loads the painting code.
 */
export type NoteId = 'frost' | 'maps' | 'iris' | 'chain' | 'hills'
export const NOTES: Record<'rothko' | 'mondrian', Record<NoteId, L>> = {
  rothko: {
    frost: { en: 'Night over frost. Field heights are 1.50 : 1.29, the two forecast errors; the glowing gap between them is the 0.21 °C gained.', es: 'La noche sobre la helada. Los campos miden 1.50 : 1.29, los dos errores de pronóstico; el hueco que brilla entre ellos son los 0.21 °C ganados.' },
    maps: { en: 'The fire and what the control room knows. Same hue twice; the lower field is dimmer and shorter, 12 steps out of date.', es: 'El incendio y lo que sabe la sala de control. El mismo tono dos veces; el campo de abajo es más tenue y más bajo, 12 pasos atrasado.' },
    iris: { en: 'Authentic blue above, synthetic red below, and a thin violet band where the score falls through.', es: 'Azul auténtico arriba, rojo sintético abajo y una franja violeta delgada donde cae la puntuación.' },
    chain: { en: 'A ledger in ochre. The one thin crimson band is the critical finding.', es: 'Un libro de registro en ocre. La única franja carmesí delgada es el hallazgo crítico.' },
    hills: { en: 'CO₂ over land over water, each field as tall as its share of the meal’s impact.', es: 'CO₂ sobre suelo sobre agua, cada campo tan alto como su parte del impacto de la comida.' },
  },
  mondrian: {
    frost: { en: 'Blue night dominates; one long yellow strip is the 0.21 °C the model gained; a small red counterweight.', es: 'Domina la noche azul; una tira amarilla larga son los 0.21 °C que ganó el modelo; un rojo pequeño hace contrapeso.' },
    maps: { en: 'Red fire dominates; a small red echo, never touching it, is the control room’s picture 12 steps behind.', es: 'Domina el fuego rojo; un eco rojo pequeño, que nunca lo toca, es la imagen de la sala de control 12 pasos atrás.' },
    iris: { en: 'Order on the left (blue), doubt on the right (red). The score falls left to right.', es: 'Orden a la izquierda (azul), duda a la derecha (rojo). La puntuación baja de izquierda a derecha.' },
    chain: { en: 'Seven main planes, one red. Everything else in the chain is clean.', es: 'Siete planos principales, uno rojo. Todo lo demás en la cadena está limpio.' },
    hills: { en: 'Three planes for one meal: red CO₂, yellow land, blue water, sized by their shares.', es: 'Tres planos para una comida: CO₂ rojo, suelo amarillo, agua azul, del tamaño de su parte.' },
  },
}
