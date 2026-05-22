// Lesson content for each process — HTML strings for TheoryScreen

export const PPE_QUIZ = [
  {
    q: 'What shade lens is required for arc welding at 130–160 amps?',
    options: ['Shade 5', 'Shade 8', 'Shade 10–11', 'Any shade above 3'],
    answer: 2,
    explain: 'ANSI Z49.1 requires shade 10–11 for stick welding at 130–160A. Insufficient shade causes arc eye — a painful UV burn of the cornea.',
  },
  {
    q: 'Which of the following is NOT acceptable PPE for welding?',
    options: ['Leather welding gloves', 'Cotton work shirt', 'Synthetic polyester jacket', 'Leather steel-toed boots'],
    answer: 2,
    explain: 'Synthetic fabrics (polyester, nylon) melt onto skin from arc flash or spatter. Always wear 100% cotton, wool, or leather PPE.',
  },
  {
    q: 'What is the minimum safe distance for flammable materials near a welding area?',
    options: ['5 feet', '25 feet', '35 feet', 'Covered with a damp cloth'],
    answer: 2,
    explain: 'OSHA requires flammables to be at least 35 feet away, or covered with fire-resistant material. Spatter travels farther than you think.',
  },
  {
    q: 'Before welding on any container or tank, you should:',
    options: ['Weld quickly to minimize exposure', 'Fill with water first, then weld', 'Purge and certify it gas-free, or never weld it', 'Just open the lid'],
    answer: 2,
    explain: 'NEVER weld on a container that held flammable material without a professional purge and gas-free certification. Explosions kill welders every year from this mistake.',
  },
  {
    q: 'Welding fumes are:',
    options: ['Harmless water vapor', 'Only dangerous above 1000°F', 'Hazardous and require proper ventilation at all times', 'Only dangerous for TIG welding'],
    answer: 2,
    explain: 'All welding fumes contain metal oxides and compounds (manganese, chromium, nickel in stainless) that cause serious lung disease. Always weld with ventilation or wear a proper respirator.',
  },
];

export const THEORY = {
  STICK: [
    {
      title: 'What is Stick Welding?',
      html: `
        <h3>Shielded Metal Arc Welding (SMAW)</h3>
        <p>Stick welding uses a <strong>flux-coated electrode</strong> (the "stick") to create an arc between the electrode and the base metal. As the electrode melts, the flux coating burns to create a gas shield and forms a <strong>slag layer</strong> that protects the cooling weld.</p>
        <p>It's one of the oldest and most versatile welding processes — it works outdoors, on dirty or rusty metal, and requires minimal equipment.</p>
        <div class="tip-box">
          <strong>💡 Why learn Stick first?</strong><br>
          Stick teaches fundamental arc control. If you can run a good stick bead, every other process becomes easier.
        </div>
        <ul>
          <li>Best for: structural steel, field repair, thick plate</li>
          <li>Not ideal for: thin metal (&lt;3mm), aluminum, high-precision work</li>
        </ul>
      `,
    },
    {
      title: 'Equipment & Setup',
      html: `
        <h3>Stick Welding Equipment</h3>
        <p><strong>The Machine:</strong> A constant-current (CC) power supply. Set amperage based on electrode diameter — typically 1 amp per 0.001" electrode diameter as a starting point.</p>
        <p><strong>Electrode Types:</strong></p>
        <ul>
          <li><strong>E6010</strong> — Deep penetration, all-position, DC+. Used for pipe and root passes.</li>
          <li><strong>E6013</strong> — Easy slag, smooth bead, AC or DC. Good for beginners and sheet metal.</li>
          <li><strong>E7018</strong> — Low hydrogen, excellent mechanical properties. Used for structural work. Store in a rod oven.</li>
        </ul>
        <p><strong>Electrode Diameter → Amperage Guide:</strong></p>
        <ul>
          <li>3/32" (2.4mm) — 70–110A</li>
          <li>1/8" (3.2mm)  — 100–150A</li>
          <li>5/32" (4.0mm) — 150–220A</li>
        </ul>
        <div class="warn-box">
          <strong>⚠ E7018 Low-Hydrogen Electrodes</strong><br>
          Must be stored in a rod oven at 250°F minimum. Moisture causes hydrogen cracking — a delayed, invisible fracture that appears hours or days after welding.
        </div>
      `,
    },
    {
      title: 'Technique: Arc Striking',
      html: `
        <h3>Striking the Arc</h3>
        <p>There are two arc striking methods:</p>
        <ul>
          <li><strong>Scratch Start:</strong> Scratch the electrode across the base metal like a match, then quickly pull back to arc length. Easy but can contaminate the bead if done in the weld zone.</li>
          <li><strong>Tap Start:</strong> Tap the electrode on the base metal and quickly pull back. Cleaner but more difficult — electrode can stick.</li>
        </ul>
        <p><strong>If the electrode sticks:</strong> Release the electrode holder immediately to break the short circuit, then break the electrode free by twisting. Never jerk — you may damage the coating.</p>
        <div class="tip-box">
          <strong>💡 Practice Tip</strong><br>
          Start your arc on a scrap piece 1–2 inches from your intended weld start point. Once the arc is established, move quickly to the start position. This prevents a cold, rough start at the weld origin.
        </div>
      `,
    },
    {
      title: 'Technique: Running the Bead',
      html: `
        <h3>Arc Length, Travel Speed, and Angles</h3>
        <p><strong>Arc Length:</strong> Keep the arc length equal to the electrode core diameter (roughly 3–8mm for 1/8" rod). A consistent "frying bacon" sound means you're in the zone.</p>
        <p><strong>Travel Speed:</strong> Move steadily. The puddle should be about 2–3× the electrode diameter wide. If the bead is getting too wide, speed up.</p>
        <p><strong>Work Angle:</strong> Hold 90° to the base metal for flat position. For fillet welds, split the angle between the two plates (45°).</p>
        <p><strong>Travel Angle:</strong> Drag angle of 10–20° in the direction of travel. This pushes the shielding gas forward and directs the arc into the joint.</p>
        <div class="warn-box">
          <strong>⚠ Electrode Burn-Down</strong><br>
          The electrode gets shorter as it burns. You must steadily lower your hand to maintain arc length — this is the most common beginner mistake.
        </div>
      `,
    },
    {
      title: 'Defects & Finishing',
      html: `
        <h3>Slag Removal and Common Defects</h3>
        <p><strong>Slag Removal:</strong> After the bead cools slightly (but is still warm), chip away the slag layer with a chipping hammer. Always chip AWAY from yourself. Then wire brush the bead clean.</p>
        <p><strong>Crater Fill:</strong> At the end of each pass, pause briefly or loop back to fill the end crater. Craters are stress concentration points and crack easily.</p>
        <h3>Common Stick Welding Defects</h3>
        <ul>
          <li><strong>Undercut:</strong> Moving too fast, arc too long. Slow down and maintain shorter arc.</li>
          <li><strong>Porosity:</strong> Moisture in electrode, contaminated metal, arc too long.</li>
          <li><strong>Spatter:</strong> Arc too short, amperage too high. Back off slightly.</li>
          <li><strong>Slag inclusions:</strong> Weaving too aggressively, not cleaning between passes.</li>
        </ul>
        <div class="tip-box">
          <strong>💡 Sound Test</strong><br>
          A correct stick weld sounds like steady, crackling bacon frying. Too much popping = arc too short. Intermittent sputtering = arc too long.
        </div>
      `,
    },
  ],
  MIG: [
    {
      title: 'What is MIG Welding?',
      html: `
        <h3>Gas Metal Arc Welding (GMAW / MIG)</h3>
        <p>MIG welding uses a <strong>continuously fed wire electrode</strong> from a spool through the gun. A shielding gas (usually 75% Argon / 25% CO₂) flows from the nozzle to protect the weld pool from atmospheric contamination.</p>
        <p>MIG is the most common industrial welding process because it's fast, easy to learn, and produces clean welds with minimal cleanup.</p>
        <div class="tip-box">
          <strong>💡 Push or Pull?</strong><br>
          MIG uses a <strong>push</strong> (forehand) technique — you angle the gun forward in the direction of travel. This gives better gas coverage and a flatter, wider bead profile.
        </div>
        <ul>
          <li>Best for: production welding, automotive, fabrication, thin to medium plate</li>
          <li>Not ideal for: outdoor use (wind disrupts gas), vertical/overhead with beginners</li>
        </ul>
      `,
    },
    {
      title: 'Equipment & Setup',
      html: `
        <h3>MIG Machine Setup</h3>
        <p><strong>Wire Diameter:</strong> Choose based on material thickness:</p>
        <ul>
          <li>0.023" — Sheet metal (0.5–3mm)</li>
          <li>0.030" — Light plate (3–6mm)</li>
          <li>0.035" — Medium plate (3–10mm) — most common</li>
          <li>0.045" — Heavy plate (6mm+)</li>
        </ul>
        <p><strong>Shielding Gas:</strong> For mild steel use C25 (75% Ar, 25% CO₂). For stainless, use tri-mix. For aluminum, use 100% Argon.</p>
        <p><strong>Gas Flow:</strong> 15–25 CFH (cubic feet per hour). Too low = porosity. Too high = turbulence drawing in air.</p>
        <p><strong>Wire Stickout:</strong> Keep <strong>3/8" to 1/2" (10–13mm)</strong> of wire extending from the nozzle. More stickout = more resistance = less heat. Less = gun too close = spatter on nozzle.</p>
        <div class="warn-box">
          <strong>⚠ Never Weld Without Gas Flow</strong><br>
          Running a MIG welder without shielding gas produces extreme porosity and a rough, contaminated bead. Always verify gas is flowing before striking an arc.
        </div>
      `,
    },
    {
      title: 'Technique',
      html: `
        <h3>MIG Technique: Push Method</h3>
        <p><strong>Work Angle:</strong> Hold the gun at 90° to the base metal (for butt joint). For T-joints and fillets, split at 45° between the two plates.</p>
        <p><strong>Travel Angle:</strong> Tilt the gun 10–15° in the direction of travel (push). The wire leads the puddle.</p>
        <p><strong>Travel Speed:</strong> Consistent and smooth. The weld puddle should be about 1.5–2× the wire diameter wide. Watch the <em>back edge</em> of the puddle, not the arc.</p>
        <p><strong>Contact-to-Work Distance (CTWD):</strong> Maintain stickout of ~3/8" from contact tip to work. This directly controls arc length and heat.</p>
        <div class="tip-box">
          <strong>💡 Listen to the Arc</strong><br>
          A correct MIG arc sounds like crispy frying — a steady, tight crackle. Loud popping = too short or voltage too low. Long hiss = arc too long / voltage too high.
        </div>
      `,
    },
    {
      title: 'Settings & Voltage/Amperage',
      html: `
        <h3>Dialing In Your Settings</h3>
        <p>MIG machines have two main controls: <strong>Wire Speed</strong> (controls amperage) and <strong>Voltage</strong>.</p>
        <p><strong>Voltage controls arc length and bead profile:</strong></p>
        <ul>
          <li>Too low: narrow, ropy bead, lots of spatter</li>
          <li>Too high: wide, flat bead, possible undercut, porosity</li>
          <li>Just right: smooth, slightly convex bead with good toes</li>
        </ul>
        <p><strong>Wire speed controls amperage and penetration:</strong></p>
        <ul>
          <li>Too low: cold lap, insufficient fusion</li>
          <li>Too high: burn-through, wide bead</li>
        </ul>
        <p>General starting point for 0.035" wire on 3/8" steel: <strong>19–21V, 250–280 ipm wire speed.</strong></p>
        <div class="tip-box">
          <strong>💡 The Sizzle Test</strong><br>
          Run a test bead on scrap. If it sounds like sizzling bacon: correct. If it sounds like a machine gun: voltage too low or wire too fast.
        </div>
      `,
    },
    {
      title: 'Common Defects & Fixes',
      html: `
        <h3>MIG Welding Defects</h3>
        <ul>
          <li><strong>Porosity:</strong> Wind, insufficient gas flow, contaminated metal, arc too long. Clean metal, check gas, get out of wind.</li>
          <li><strong>Spatter:</strong> Voltage too low, arc too short. Increase voltage 0.5V at a time until spatter stops.</li>
          <li><strong>Undercut:</strong> Moving too fast, work angle incorrect. Slow down, direct arc into joint.</li>
          <li><strong>Cold lap:</strong> Not enough heat or too fast on cold metal. Increase wire speed or slow down.</li>
        </ul>
        <div class="tip-box">
          <strong>💡 Spatter = Imbalanced Settings</strong><br>
          Spatter almost always means voltage is too low for the wire speed. Raise voltage in 0.5V increments until the arc settles. Spatter does NOT mean you need more wire speed.
        </div>
      `,
    },
  ],
  FCAW: [
    {
      title: 'What is Flux-Core Welding?',
      html: `
        <h3>Flux-Cored Arc Welding (FCAW)</h3>
        <p>Flux-Core uses a <strong>hollow wire electrode filled with flux</strong>. The flux provides shielding, so no external gas is required (for self-shielded FCAW-S). This makes it ideal for outdoor work and construction where wind would disrupt gas coverage.</p>
        <p>FCAW produces a slag layer (like stick) that must be removed. The deposition rate is higher than MIG, making it excellent for heavy fabrication and structural steel.</p>
        <div class="warn-box">
          <strong>⚠ ALWAYS Use Drag Technique</strong><br>
          Unlike MIG, FCAW must NEVER use push technique. You must drag (pull) the gun away from the weld puddle. Pushing buries the flux gases in the weld and causes severe porosity.
        </div>
        <ul>
          <li>Best for: outdoor structural, construction, heavy plate, vertical/overhead</li>
          <li>Not ideal for: thin metal, appearance-critical welds, aluminum</li>
        </ul>
      `,
    },
    {
      title: 'Equipment & Setup',
      html: `
        <h3>FCAW Setup</h3>
        <p><strong>Wire Types:</strong></p>
        <ul>
          <li><strong>E71T-8</strong> — Self-shielded, all-position. The most common for field work.</li>
          <li><strong>E71T-1</strong> — Gas-shielded FCAW (dual-shield). Requires CO₂ or mixed gas. Better quality than self-shielded.</li>
          <li><strong>E70T-11</strong> — Self-shielded, single-pass, sheet metal to light plate.</li>
        </ul>
        <p><strong>Polarity:</strong> Most self-shielded FCAW runs on DC electrode negative (DCEN). Check your wire manufacturer's specification. Running wrong polarity = cold bead, excessive spatter.</p>
        <p><strong>Stickout:</strong> Longer than MIG — typically <strong>3/4" to 1.5" (19–38mm)</strong>. Longer stickout pre-heats the wire and helps the flux do its job.</p>
        <div class="tip-box">
          <strong>💡 Dual-Shield vs. Self-Shielded</strong><br>
          Dual-shield (gas + flux) produces better mechanical properties and cleaner welds. Use it when you control the environment. Use self-shielded for outdoor/field work.
        </div>
      `,
    },
    {
      title: 'Drag Technique',
      html: `
        <h3>FCAW: The Drag (Backhand) Method</h3>
        <p>Unlike MIG's push technique, FCAW requires the gun to be pointed back at the completed weld. The wire drags through the puddle.</p>
        <p><strong>Travel Angle:</strong> 15–25° drag angle. The gun points backward from your direction of travel.</p>
        <p><strong>Work Angle:</strong> 80–100° to the base metal. On fillet welds, 45° into the joint.</p>
        <p><strong>Travel Speed:</strong> Similar to MIG but slightly faster since the flux protects the puddle better. Watch the leading edge of the slag, not the arc — the slag trails behind the puddle.</p>
        <div class="warn-box">
          <strong>⚠ Pushing = Slag Inclusions</strong><br>
          If you accidentally push with FCAW, you'll drive the flux gases back into the puddle. This causes massive porosity and slag inclusions invisible on the surface. Always drag.
        </div>
      `,
    },
    {
      title: 'Flux and Slag Removal',
      html: `
        <h3>Flux and Slag Management</h3>
        <p>FCAW produces a thick slag layer, similar to stick welding. It must be completely removed between passes.</p>
        <p><strong>Slag Removal Process:</strong></p>
        <ul>
          <li>Allow the bead to cool slightly (no longer orange-hot)</li>
          <li>Chip with a chipping hammer — the slag should pop off cleanly if technique was correct</li>
          <li>Wire brush aggressively</li>
          <li>Inspect for trapped slag before the next pass</li>
        </ul>
        <p><strong>If slag won't release:</strong> This indicates too-low heat, wrong travel angle, or incorrect polarity. Good FCAW slag releases easily in large sheets.</p>
        <div class="tip-box">
          <strong>💡 Slag Self-Release</strong><br>
          With correct settings and drag technique, FCAW slag often self-releases as it cools — it peels off on its own. This is a sign of good technique.
        </div>
      `,
    },
    {
      title: 'Common Defects',
      html: `
        <h3>FCAW Common Defects</h3>
        <ul>
          <li><strong>Porosity:</strong> Wrong polarity (DCEN required), push instead of drag, stickout too short, damaged wire (moisture, kinked).</li>
          <li><strong>Slag inclusions:</strong> Incomplete slag removal between passes, wrong technique, uneven travel speed.</li>
          <li><strong>Undercut:</strong> Travel speed too high, work angle too steep, amperage too high.</li>
          <li><strong>Cold lap:</strong> Travel speed too fast, insufficient amperage, stickout too long (reduces heat).</li>
        </ul>
        <div class="tip-box">
          <strong>💡 Check Polarity First</strong><br>
          If your FCAW bead looks rough, porous, and the slag sticks — check polarity immediately. Self-shielded FCAW on wrong polarity (DCEP instead of DCEN) is one of the most common setup mistakes.
        </div>
      `,
    },
  ],
  TIG: [
    {
      title: 'What is TIG Welding?',
      html: `
        <h3>Gas Tungsten Arc Welding (GTAW / TIG)</h3>
        <p>TIG uses a <strong>non-consumable tungsten electrode</strong> to create the arc. You add filler metal separately with your other hand by dipping a filler rod into the molten puddle. A foot pedal controls amperage in real-time.</p>
        <p>TIG is the most precise and demanding welding process. It produces the highest quality, cleanest welds with no slag and minimal spatter. It's the standard for aerospace, food-grade, and high-purity applications.</p>
        <div class="tip-box">
          <strong>💡 Two Hands, One Foot</strong><br>
          TIG requires: torch hand (arc control), filler rod hand (feeding metal), and foot (amperage). Coordination takes practice — but the results are unmatched in quality.
        </div>
        <ul>
          <li>Best for: aluminum, stainless, titanium, exotic alloys, precision work</li>
          <li>Not ideal for: production speed, thick plate efficiency, beginners (steep learning curve)</li>
        </ul>
      `,
    },
    {
      title: 'Equipment & Setup',
      html: `
        <h3>TIG Equipment</h3>
        <p><strong>Tungsten Electrode Types:</strong></p>
        <ul>
          <li><strong>Pure Tungsten (Green):</strong> AC welding on aluminum. Balls up at the tip.</li>
          <li><strong>2% Thoriated (Red):</strong> DC welding on steel, stainless. Very common. Slight radioactivity — don't breathe grinding dust.</li>
          <li><strong>Ceriated (Grey/Orange):</strong> Good for both AC and DC. Modern, safer alternative to thoriated.</li>
        </ul>
        <p><strong>Tungsten Preparation:</strong> For DC welding, grind the tungsten to a <strong>pointed tip</strong> using a dedicated tungsten grinder, grinding ALONG the length (not across). Grinding across creates stress risers that break off into the weld.</p>
        <p><strong>Gas:</strong> 100% Argon. No CO₂. Gas flow: 10–20 CFH. Use a gas lens for better coverage.</p>
        <p><strong>Filler Rod:</strong> Match filler to base metal. ER70S-2 for carbon steel, ER308 for 304 stainless, ER4043 for aluminum.</p>
      `,
    },
    {
      title: 'Technique: Arc and Puddle',
      html: `
        <h3>TIG Arc Control</h3>
        <p><strong>Arc Length:</strong> Keep the arc VERY short — 1.5× to 2× the tungsten diameter (typically 2–5mm). TIG's short arc is its most critical parameter. Too long = poor penetration, wandering arc, tungsten contamination.</p>
        <p><strong>Tungsten Contamination:</strong> If the tungsten touches the puddle or is too close, it becomes contaminated. Contaminated tungsten = erratic arc, porosity. Stop, re-grind, and restart.</p>
        <p><strong>Puddle Control:</strong> Establish the puddle first — wait until the base metal forms a shiny molten pool before adding filler. Rushing causes cold lap.</p>
        <div class="tip-box">
          <strong>💡 Arc Start</strong><br>
          Use high-frequency (HF) arc start — the machine initiates the arc without touching the tungsten to metal. This preserves the tungsten point and prevents contamination.
        </div>
      `,
    },
    {
      title: 'Filler Rod and Foot Pedal',
      html: `
        <h3>TIG Filler Rod Technique</h3>
        <p><strong>Dip and Pause Rhythm:</strong> TIG uses a dip-pause-move rhythm:</p>
        <ol>
          <li>Advance puddle forward slightly</li>
          <li>Dip filler rod into the <strong>leading edge</strong> of the puddle (never into the arc)</li>
          <li>Retract rod (keep in gas shield)</li>
          <li>Advance puddle forward</li>
          <li>Repeat</li>
        </ol>
        <p><strong>Foot Pedal:</strong> The foot pedal controls amperage from 0% to 100% of your preset max. Use it to:</p>
        <ul>
          <li>Ramp up slowly when starting (reduces thermal shock)</li>
          <li>Reduce heat at the end of a bead (prevents craters and burn-through)</li>
          <li>Respond to puddle behavior (getting too large? Back off)</li>
        </ul>
        <div class="warn-box">
          <strong>⚠ Never Dip Into the Arc</strong><br>
          Touching the filler rod to the tungsten electrode instantly contaminates both. The rod must enter only the puddle, from the leading edge, staying inside the gas shield.
        </div>
      `,
    },
    {
      title: 'Common Defects',
      html: `
        <h3>TIG Welding Defects</h3>
        <ul>
          <li><strong>Tungsten inclusion:</strong> Tungsten touched the puddle — shows as black fleck. Requires grinding out and re-welding.</li>
          <li><strong>Porosity:</strong> Contaminated filler or base metal (oil, oxide layer on aluminum), too-long arc, insufficient gas coverage.</li>
          <li><strong>Undercut:</strong> Moving too fast, amperage too high for joint thickness.</li>
          <li><strong>Cold lap / lack of fusion:</strong> Puddle not fully established before adding filler, moving too fast.</li>
          <li><strong>Suck-back (concave root):</strong> Too much heat at the root pass, backing bar not used.</li>
        </ul>
        <div class="tip-box">
          <strong>💡 Pre-Clean Everything</strong><br>
          TIG is extremely sensitive to contamination. On aluminum: use a DEDICATED stainless wire brush (not one used on steel) to remove the oxide layer immediately before welding. On stainless: wipe with acetone, never touch with bare hands.
        </div>
      `,
    },
  ],
};

export const ACHIEVEMENTS = [
  { id: 'first_arc',     name: 'First Arc',        desc: 'Strike your first arc',              icon: '⚡' },
  { id: 'clean_bead',    name: 'Clean Bead',        desc: 'Score 90%+ quality on any weld',      icon: '🏆' },
  { id: 'ppe_ace',       name: 'Safety First',      desc: 'Ace the PPE quiz (5/5)',               icon: '🛡️' },
  { id: 'master_stick',  name: 'Stick Certified',   desc: 'Complete Stick theory + score B+',     icon: '🔥' },
  { id: 'master_mig',    name: 'MIG Certified',     desc: 'Complete MIG theory + score B+',       icon: '🌀' },
  { id: 'master_fcaw',   name: 'FCAW Certified',    desc: 'Complete Flux-Core theory + score B+', icon: '💨' },
  { id: 'master_tig',    name: 'TIG Certified',     desc: 'Complete TIG theory + score B+',       icon: '✨' },
  { id: 'all_four',      name: 'All-Position Welder', desc: 'Certify in all four processes',      icon: '🎖️' },
];
