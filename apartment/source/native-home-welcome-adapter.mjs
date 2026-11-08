// Rewrite only the derived one-chart HOME welcome. Historical journeys remain
// intact in canonical Relax and the 23-chart development Apartment.
export function adaptHomeWelcome(html){
 if(typeof html!=='string')throw TypeError('HOME_WELCOME_SOURCE_REQUIRED');
 const old='The cloudfall door, north by the window, is where you arrived; a seat waits under the window. South, the Cardboard Box Workshop; east, the No-Ask Sanctuary; in the south-east corner, the lift down to Meridian City, where the others are.';
 const fresh='A seat waits under the rain window. There are four sleeping alcoves, a writing corner, and a small pet area within this one home; no other door is open in this edition.';
 if(html.split(old).length!==2)throw Error('HOME_WELCOME_SOURCE_ANCHOR_DRIFT');
 return html.replace(old,fresh);
}
