// Derived Apartment HTML only. Keep the original 9x9 Undercity maze and
// its lever/vault source logic untouched in canonical REALITI Relax. Only the
// reach predicate is extended to accept an actual reachable HOME cabinet.
export function adaptUndercity(original){
 if(typeof original!=='string'||!original.includes('window.REALITI_UNDERCITY_V1'))
  throw Error('ORIGINAL_RELAX_UNDERCITY_SOURCE_MISSING');
 const before="const near=(id,tol=1.2)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===UNDER&&Math.max(0,M.sdf(e,r.pose.position))<=tol)};";
 const after="const near=(id,tol=1.2)=>{const e=ent()[id],r=me();return !!(e&&r&&r.chart===UNDER&&Math.max(0,M.sdf(e,r.pose.position))<=tol)||!!window.REALITI_APARTMENT_UNDERCITY_CABINET_V1?.nearOriginal?.(id,tol)};";
 if(original.split(before).length!==2)
  throw Error('APARTMENT_UNDERCITY_ORIGINAL_REACH_ANCHOR_DRIFT');
 return original.replace(before,after);
}
