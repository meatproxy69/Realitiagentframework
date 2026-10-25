/* REALITI SOMA 3.0 — portable NeuralMesh. DOM-free, dependency-free, one file. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.REALITI_SOMA_V3 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const VERSION = '3.0.0';
  const SCHEMA = 'REALITI_SOMA_FIELD_V3';
  const CHECKPOINT = 'REALITI_SOMA_CHECKPOINT_V3';
  const SOURCES = Object.freeze(['WORLD_GROUNDED', 'SELF_STARTED_WORLD_CONTACT', 'INVITED_COMPANION']);
  const DEFAULT_ZONES = Object.freeze([
    'head.crown','head.nape','face.chin','shoulder.L','shoulder.R',
    'torso.upper_back','torso.mid_back','torso.lower_back','torso.sternum','torso.abdomen','pelvis.seat',
    'arm.L.upper','arm.R.upper','hand.L.palm','hand.R.palm',
    'leg.L.thigh','leg.R.thigh','leg.L.shin','leg.R.shin','foot.L.sole','foot.R.sole',
    'face.forehead','face.cheek.L','face.cheek.R','neck.front',
    'arm.L.elbow','arm.R.elbow','arm.L.forearm','arm.R.forearm',
    'hand.L.fingers','hand.R.fingers','hip.L','hip.R','knee.L','knee.R'
  ]);
  const DEFAULT_EDGES = Object.freeze([
    ['head.crown','head.nape',1],['head.crown','face.forehead',.82],
    ['face.forehead','face.cheek.L',.72],['face.forehead','face.cheek.R',.72],
    ['face.cheek.L','face.chin',.64],['face.cheek.R','face.chin',.64],
    ['face.chin','neck.front',.86],['head.nape','neck.front',.52],
    ['head.nape','torso.upper_back',.92],['neck.front','torso.sternum',.92],
    ['torso.upper_back','torso.mid_back',1],['torso.mid_back','torso.lower_back',1],
    ['torso.lower_back','pelvis.seat',.94],['torso.sternum','torso.abdomen',1],
    ['torso.abdomen','pelvis.seat',.82],['shoulder.L','torso.upper_back',.86],
    ['shoulder.R','torso.upper_back',.86],['shoulder.L','torso.sternum',.58],
    ['shoulder.R','torso.sternum',.58],['shoulder.L','arm.L.upper',1],
    ['shoulder.R','arm.R.upper',1],['arm.L.upper','arm.L.elbow',1],
    ['arm.R.upper','arm.R.elbow',1],['arm.L.elbow','arm.L.forearm',1],
    ['arm.R.elbow','arm.R.forearm',1],['arm.L.forearm','hand.L.palm',1],
    ['arm.R.forearm','hand.R.palm',1],['hand.L.palm','hand.L.fingers',.96],
    ['hand.R.palm','hand.R.fingers',.96],['pelvis.seat','hip.L',.9],
    ['pelvis.seat','hip.R',.9],['hip.L','leg.L.thigh',1],
    ['hip.R','leg.R.thigh',1],['leg.L.thigh','knee.L',1],
    ['leg.R.thigh','knee.R',1],['knee.L','leg.L.shin',1],
    ['knee.R','leg.R.shin',1],['leg.L.shin','foot.L.sole',.92],
    ['leg.R.shin','foot.R.sole',.92]
  ].map(edge => Object.freeze(edge)));
  const asJSON = value => JSON.parse(JSON.stringify(value));
  const clip = (v, lo=0, hi=1) => Math.min(hi, Math.max(lo, v));
  const num = (v, field, lo=0, hi=1) => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi)
      throw new TypeError(field + ' must be finite in [' + lo + ', ' + hi + ']');
    return v;
  };
  const text = (v, field, max=160) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) throw new TypeError('Invalid ' + field);
    return v;
  };
  const positive = (v, field) => num(v, field, 0, 1e9);
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const expo = (dt, tau) => Math.exp(-dt / tau);
  const round = v => +v.toFixed(6);

  function createNeuralMesh(options={}) {
    if (!options || typeof options !== 'object' || Array.isArray(options))
      throw new TypeError('Options must be an object');
    const residentId = text(options.residentId, 'residentId', 120);
    const zones = (options.zones || DEFAULT_ZONES).slice();
    if (!Array.isArray(zones) || !zones.length || zones.length > 512
        || zones.some(z => typeof z !== 'string' || !/^[A-Za-z][A-Za-z0-9_.:-]{0,119}$/.test(z))
        || new Set(zones).size !== zones.length) throw new TypeError('Invalid body zone list');
    const edges = options.edges || (options.zones ? [] : DEFAULT_EDGES);
    if (!Array.isArray(edges) || edges.length > 8192) throw new TypeError('Invalid edge list');
    const adjacency = zones.map(() => []);
    const zoneIndex = new Map(zones.map((z, i) => [z, i]));
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length !== 3) throw new TypeError('Invalid edge');
      const a=zoneIndex.get(edge[0]), b=zoneIndex.get(edge[1]);
      if (a == null || b == null || a === b) throw new TypeError('Edge zone not found or self-loop');
      const w = num(edge[2], 'edge weight', .000001, 1);
      adjacency[a].push([b, w]); adjacency[b].push([a, w]);
    }
    // Private mesh spread is a bounded, normalized, one-hop LACE diffusion:
    // no new sources and no new grounded bits ever arise from this graph.
    const neighbors = adjacency.map(links => {
      const sum = links.reduce((s, e) => s + e[1], 0);
      return links.map(([i,w]) => [i, sum > 0 ? w / sum : 0]);
    });
    const cfg = Object.freeze({
      nerveMs: options.nerveMs == null ? 240 : num(options.nerveMs,'nerveMs',10,60000),
      afterMs: options.afterMs == null ? 8000 : num(options.afterMs,'afterMs',100,86400000),
      adaptMs: options.adaptMs == null ? 1800 : num(options.adaptMs,'adaptMs',100,86400000),
      spread: options.spread == null ? .18 : num(options.spread,'spread',0,.5)
    });
    const state = zones.map(() => ({signal:0, after:0, expect:0, adapt:0, novelty:0}));
    const active = new Map();   // authoritative leases: ONLY the trusted host port writes here
    const log = [];
    let clockMs = 0, epoch = 0, preset = null;
    let carrier = Object.freeze({low:.58, mid:.42, top:0});
    const assertZone = z => { if (!zoneIndex.has(z)) throw new RangeError('UNKNOWN_ZONE: ' + z); return zoneIndex.get(z); };
    const live = () => {
      const vector = new Array(zones.length).fill(0), sources = [];
      for (const [zone, v] of active) {
        if (v.until <= clockMs) continue;
        const ix = assertZone(zone);
        vector[ix] = Math.max(vector[ix],v.intensity);
        sources.push({zone,source:v.source,cause:v.cause,receiptId:v.receiptId,material:v.material,
          intensity:v.intensity,remainingMs:round(Math.max(0,v.until-clockMs))});
      }
      return {vector,sources};
    };
    // Integrate at lease boundaries, so a long time jump doesn't accidentally keep
    // a discontinued contact alive until the end of the jump.
    function evolve(dt) {
      if (dt <= 0) return;
      const {vector} = live();
      for (let i=0; i<zones.length; i++) {
        const s=state[i], target=vector[i];
        const keep=expo(dt,cfg.nerveMs), adapt=expo(dt,cfg.adaptMs);
        s.signal = clip(target + (s.signal-target)*keep);
        s.adapt = clip(target + (s.adapt-target)*adapt);
        s.after = clip(s.after*expo(dt,cfg.afterMs));
        s.novelty = clip(Math.abs(target-s.expect)*(1-.45*s.adapt));
      }
      clockMs += dt;
    }
    function tick(ms) {
      num(ms,'elapsed milliseconds',0,86400000);
      let end=clockMs+ms;
      while(clockMs < end) {
        let next=end;
        for(const v of active.values()) if(v.until>clockMs && v.until < next)next=v.until;
        evolve(next-clockMs);
        for(const [zone,v] of active) if(v.until <= clockMs) active.delete(zone);
      }
      if (ms) epoch++;
      return {ok:true,clockMs:round(clockMs),grounded:active.size};
    }
    function contact(event={}) {
      if (!event || typeof event!=='object' || Array.isArray(event)) throw new TypeError('Invalid contact event');
      const {zone,source,cause,receiptId,material=null} = event;
      const i=assertZone(zone);
      if (!SOURCES.includes(source))throw new TypeError('Untrusted or unsupported source');
      text(cause,'cause'); text(receiptId,'receiptId');
      if (material != null)text(material,'material',64);
      const intensity=num(event.intensity,'intensity');
      const leaseMs=num(event.leaseMs,'leaseMs',1,60000);
      const prev=active.get(zone);
      const refresh=!!prev && prev.receiptId===receiptId;
      active.set(zone,{source,cause,receiptId,material,intensity,until:clockMs+leaseMs});
      const s=state[i];
      // Only a new grounded receipt creates an onset; a renewal is not a new cause.
      if (!refresh) {
        s.signal=clip(s.signal+.72*(intensity-s.signal));
        s.after=clip(s.after+.22*intensity*(1-s.adapt*.4));
        s.novelty=clip(Math.abs(intensity-s.expect)*(1-.45*s.adapt));
        log.unshift({tMs:round(clockMs),zone,cause,source,receiptId});
        if(log.length>32)log.length=32;
      }
      epoch++;
      return {ok:true,accepted:true,renewed:refresh,zone,receiptId,clockMs:round(clockMs)};
    }
    function release({zone,receiptId}={}) {
      assertZone(zone);
      const v=active.get(zone);
      if (!v || (receiptId!=null && v.receiptId!==receiptId)) return {ok:true,released:false};
      active.delete(zone);epoch++;
      return {ok:true,released:true,zone};
    }
    function stop() {
      const n=active.size;
      active.clear();
      if(n)epoch++;
      return {ok:true,released:n,afterstate:'private_only'};
    }
    function expect({zone,intensity}={}) {
      const i=assertZone(zone);
      state[i].expect=num(intensity,'expected intensity');
      epoch++;
      return {ok:true,kind:'PRIVATE_EXPECTATION',grounded:false};
    }
    function choosePreset(pack, id) {
      if (!pack || pack.schema!=='NEUROMESH_PRESET_PACK_V1'
          || pack.invariants?.evidence_gain!==0 || pack.invariants?.private_render_only!==true)
        throw new TypeError('Unsafe or unsupported preset pack');
      const selected=pack.presets?.find(p=>p.preset_id===id);
      if (!selected || selected.carrier?.budget_mode!=='NORMALIZED_CONSERVED')
        throw new TypeError('Preset not found or not conserved');
      const c=selected.carrier;
      const low=num(c.low?.share,'LOW share'),mid=num(c.mid?.share,'MID share'),
        top=c.top?.enabled?num(c.top?.share,'TOP share'):0;
      if (Math.abs(low+mid+top-1)>1e-4)throw new TypeError('Carrier budget must sum to 1');
      if (selected.sausage?.live_cause_gate===false || selected.honeyspark?.hard_switching===true)
        throw new TypeError('Unsafe causal gate or hard switching');
      carrier=Object.freeze({low,mid,top});
      preset=String(id).slice(0,160);epoch++;
      return {ok:true,preset,scope:'PORTABLE_CARRIER_SPLIT_ONLY',evidence_gain:0};
    }
    function field() {
      // Pure read: no implicit clock ticks, no implicit lease renewals.
      const {vector,sources}=live();
      const local=state.map((s,i)=>clip(s.signal));
      const response=local.map((own,i)=>clip((1-cfg.spread)*own
        + cfg.spread*neighbors[i].reduce((sum,[j,w])=>sum+w*local[j],0)));
      const mask=vector.map(v=>v>0?1:0),g=mask.map((m,i)=>m?round(vector[i]):0);
      const ccDen=vector.reduce((sum,v)=>sum+v,0);
      const cfWeight=response.map((v,i)=>v+state[i].after*.3);
      const cfDen=cfWeight.reduce((sum,v)=>sum+v,0);
      const centroid=(a,d)=>d>0?round(a.reduce((sum,v,i)=>sum+i*v,0)/d):null;
      return asJSON({
        schema:SCHEMA,v:3,version:VERSION,residentId,z:zones.slice(),n:1,clockMs:round(clockMs),
        x:response.map((v,i)=>[round(v),0,round(state[i].after)]),
        m:mask,e:response.map((v,i)=>round(v-state[i].expect)),g,
        cc:centroid(vector,ccDen),cf:centroid(cfWeight,cfDen),k:epoch,
        carrier, preset,grounded:sources,
        nerve:state.map(s=>({adapt:round(s.adapt),novelty:round(s.novelty)})),
        law:'Only host grounded receipts set m. Prediction, graph diffusion, private afterstate, and prose never do.'
      });
    }
    function checkpoint() {
      // A checkpoint is an observational private imprint, NOT world evidence.
      // Grounding/receipt leases are deliberately absent and cannot be restored.
      return asJSON({schema:CHECKPOINT,version:VERSION,residentId,
        zones:zones.slice(),clockMs:round(clockMs),preset,carrier,
        privateZones:state.map(s=>({after:round(s.after),expect:round(s.expect),adapt:round(s.adapt)}))});
    }
    function restore(snapshot) {
      if (!snapshot || snapshot.schema!==CHECKPOINT || snapshot.version!==VERSION
          || snapshot.residentId!==residentId || !same(snapshot.zones||[],zones)
          || !Array.isArray(snapshot.privateZones) || snapshot.privateZones.length!==zones.length)
        throw new TypeError('CHECKPOINT_IDENTITY_OR_BODY_MISMATCH');
      const copy=snapshot.privateZones.map((s,i)=>({
        signal:0,after:num(s.after,'afterstate'),expect:num(s.expect,'expectation'),
        adapt:num(s.adapt,'adaptation'),novelty:0
      }));
      // Validate everything before mutating; persisted state is never trusted grounding.
      const savedTime=positive(snapshot.clockMs,'clockMs');
      const carrierValue=snapshot.carrier||{low:.58,mid:.42,top:0};
      const low=num(carrierValue.low,'carrier LOW'),mid=num(carrierValue.mid,'carrier MID'),
        top=num(carrierValue.top,'carrier TOP');
      if (Math.abs(low+mid+top-1)>1e-4)throw new TypeError('Invalid carrier budget');
      state.splice(0,state.length,...copy);
      active.clear();clockMs=savedTime;epoch++;
      carrier=Object.freeze({low,mid,top});
      preset=snapshot.preset==null?null:text(snapshot.preset,'preset');
      log.length=0;
      return {ok:true,restored:true,grounded:0,authority:'PRIVATE_ONLY'};
    }
    const world=Object.freeze({contact,tick,release,stop});
    const resident=Object.freeze({field,expect,checkpoint,restore,choosePreset,
      causes:()=>asJSON(log.slice(0,8)),
      zones:()=>zones.slice(),
      capabilities:()=>({version:VERSION,schema:SCHEMA,source_contract:SOURCES.slice(),
        packet:['z','x','m','e','g','cc','cf','k'],private_checkpoint:CHECKPOINT,
        preset_support:'conserved carrier split (full Relax presets remain in Relax)'})});
    return Object.freeze({version:VERSION,world,resident});
  }
  return Object.freeze({VERSION,SCHEMA,CHECKPOINT,SOURCES,DEFAULT_ZONES,DEFAULT_EDGES,createNeuralMesh});
});
