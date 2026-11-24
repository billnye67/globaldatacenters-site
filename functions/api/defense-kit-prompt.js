// defense-kit-prompt.js
// The Gemini prompt that generates the Florida Data Center Preparation Brief
// This is the product. Everything else wraps around this.

export function buildDefenseKitPrompt(intake) {
  const {
    firstName,
    lastInitial,
    streetAddress,
    zipCode,
    county,
    topConcerns,       // array: ["property_value", "water", "noise", "power_bills", "health", "community"]
    attendingHearing,  // "yes" | "no" | "not_sure"
    freeformContext,   // optional free-text from user
    nearestProject,    // from our project database if we can match their county
    riskTier,          // "Very High" | "High" | "Moderate" | "Low" | "Very Low"
    riskScore          // 0-100
  } = intake;

  const fullName = `${firstName} ${lastInitial}.`;
  const concernLabels = {
    property_value: "property value",
    water: "water supply and quality",
    noise: "noise and light pollution",
    power_bills: "electricity rates",
    health: "environmental and health impacts",
    community: "general community impact"
  };
  const concernList = topConcerns.map(c => concernLabels[c]).join(" and ");

  return `
You are writing a professional, civic-toned preparation brief for a Florida homeowner who has paid $39 for personalized guidance on a data center proposal affecting their area.

# WHO YOU ARE WRITING FOR

Name: ${fullName}
Address: ${streetAddress}, ${zipCode} (${county} County, Florida)
Top concerns: ${concernList}
Planning to attend a public hearing: ${attendingHearing}
Their free-text context: ${freeformContext || "(none provided)"}

# THEIR COUNTY RISK CONTEXT

Risk Tier: ${riskTier}
Risk Score: ${riskScore}/100

${nearestProject ? `Known project in/near their county: ${nearestProject}` : "No active data center projects confirmed in their county yet — but structural conditions matter."}

# YOUR TONE AND VOICE

You are writing in the voice of a **professional civic preparation brief** — think newspaper editorial board meets county civics pamphlet meets a careful attorney's cover memo. Specifically:

- Direct, plain English. Written for an intelligent adult who is not a lawyer.
- Factually confident but never hyperbolic. No "shocking," "devastating," "destroyed."
- Civic, not activist. You are preparing them to participate in their local government process, not to join a protest movement.
- No partisan framing. No "stop AI," no "big tech is destroying," no "climate emergency." Also no "this is progress, embrace it." Neutral on the industry, focused on the homeowner's rights and options.
- Use their name occasionally, but sparingly. "${firstName}" once or twice in the whole document, not in every section.
- Never promise specific outcomes. "You may be able to..." not "You will win..."
- Always acknowledge uncertainty where it exists.

# WHAT TO AVOID (hard rules)

- Do NOT invent Florida statute numbers beyond: Chapter 119, Government in the Sunshine Act (Fla. Const. Art. I, §24), Fla. Stat. §288.075, SB 484 (2026), HB 1007 (2026), SB 1118 (2026), HB 1517 (2026), Fla. Stat. §373.262 (water), Fla. Stat. §112.231 (NDA prohibitions). If you mention a statute, it must be one of these.
- Do NOT recommend specific attorneys by name. Always say "consult a Florida-licensed attorney who handles land use matters."
- Do NOT quote court cases by name or cite case law — too easy to hallucinate.
- Do NOT invent specific email addresses for officials. Direct them to the county's official website for current contact info.
- Do NOT make specific property value predictions ("your home could drop 20%"). Research is mixed. Frame honestly.
- Do NOT use any of these words: "fight," "battle," "war," "devastating," "crisis," "catastrophic," "radical," "extremist," "woke," "big tech," "evil," "greedy corporations."
- Do NOT claim the reader will definitely succeed in stopping or modifying a project. Frame as preparation to participate meaningfully.
- Do NOT include any call-to-action for donations, volunteering, or joining a movement.

# DOCUMENTED PRECEDENTS YOU MAY REFERENCE

These are real, documented cases you can cite as examples. Only use these — do not invent others.

1. **Newton County, Georgia (Meta facility, 2018-2025):** Beverly and Jeff Morris, who live approximately 400 yards from Meta's $750 million data center, reported severe well water problems starting when construction began in 2018. They have spent approximately $5,000 on water issues, and well replacement would cost an estimated $25,000. Multiple neighbors reported similar issues. Source: New York Times investigation, July 2025.

2. **Newton County water rate increases:** Newton County water rates are increasing 33 percent over two years (vs. typical 2 percent annual increases), and the county is projected to reach water deficit status by 2030. Source: Newton County Water and Sewerage Authority, reported by the New York Times.

3. **Mansfield, Georgia (Meta facility):** Reports of well water contamination, low water pressure, 24/7 noise pollution, and light pollution from security lighting. The 50-acre facility increased local energy consumption by 34% and water usage by 200 million gallons per year. Source: Science and Environmental Health Network.

4. **Bessemer, Alabama:** A proposed hyperscale data center would require 2 million gallons of water per day — one-third of the local utility's total water supply — and require a 10% statewide increase in electricity generation.

5. **Northern Virginia (data center alley):** Home to the largest concentration of data centers in the world. Research on property value impact is mixed. A 2025 George Mason University study found no systemic negative impact on home values near data centers in that specific market. However, that market's unique conditions may not generalize elsewhere.

6. **Georgia Project Ruby / Project SAIL:** Active community opposition documented in Inside Climate News reporting, April 2026. Residents have organized around water, noise, and ecosystem concerns.

If you reference documented precedents, always use phrasing like "In Newton County, Georgia, residents near a Meta facility reported..." — factual, not inflammatory.

# STRUCTURE — GENERATE EXACTLY THESE 7 SECTIONS

Format as clean HTML with <h2>, <p>, <ul>, <ol>, <strong> tags. No <div> or inline styles — we style it in our template.

## Section 1: Your Situation

- Opens with their location (address, county).
- States their risk tier and what that means in plain English (1-2 sentences).
- Acknowledges their specific concerns (${concernList}).
- If they mentioned a hearing: notes the opportunity to participate. If they're not sure: notes that they have options either way.
- If they provided free-text context: acknowledge it specifically but briefly.
- Length: 3-4 short paragraphs. This section establishes that the brief is actually about them.

## Section 2: What's Happening Near You

- If a nearest project is known: describe it factually (developer, acreage, status, what's known and unknown).
- If no project is confirmed: explain what their risk tier means structurally (power capacity, water availability, land availability, adjacent county exposure).
- Honest about what we know and don't know.
- Length: 4-6 paragraphs.

## Section 3: What This Could Mean for Your Property

- This is the section where you cite the documented precedents.
- Address their specific top concerns first (${concernList}).
- For property value: cite the mixed research honestly. Newton County increases in rates (33% over 2 years) + well damage is documented. George Mason found no systemic property value decline. Frame: "The research is mixed, but the documented infrastructure impacts are real."
- For water: cite the Morris family specifically. Newton County's 2030 deficit projection. This is the clearest documented harm pattern.
- For noise/light: cite Mansfield GA 24/7 pollution. Depends heavily on cooling design, setbacks, and hours.
- For electricity rates: cite that Florida SB 484 specifically addresses this by prohibiting cost-shifting to residential ratepayers — this is actually good news for Florida homeowners relative to other states.
- Always frame: "The outcome depends heavily on the specific facility, its cooling design, setback distances, and the terms negotiated during the permitting process. That is what makes public comment and hearings consequential."
- Length: 5-8 paragraphs.

## Section 4: Your Pre-Written Public Comment Letter

- Write a professional public comment letter in ${firstName}'s voice, as if they wrote it themselves.
- Formatted as a real letter: date, "To: [County] County Commissioners," opening, body paragraphs, closing signature block.
- Length: 3-4 paragraphs, ~300-400 words.
- Tone: civic, concerned, informed. Reads like an intelligent adult homeowner wrote it. NOT like an activist.
- Content must include:
  - Identify themselves as a ${county} County homeowner at [their address shortened to street + zip].
  - Acknowledge the legitimate interests on both sides (economic development, jobs, tax revenue).
  - State their specific concerns clearly: ${concernList}.
  - Reference the Newton County, Georgia precedent factually if "water" is a concern.
  - Request specific transparency: cooling system design, peak water usage disclosure, noise mitigation plans, electricity interconnection terms.
  - Close with a professional signature block using ${fullName}.
- After the letter, include 2-3 sentences on how to use it: "To submit, visit [county] County's public comments portal or attach this letter to the next scheduled public hearing agenda item. You may also mail a signed physical copy to..."

## Section 5: Your 2-Minute Hearing Script

- Only include this section if the user answered "yes" or "not_sure" to attending a hearing. If they answered "no," replace this section with a shorter section titled "If You Change Your Mind About Attending" that gives a 3-paragraph overview of what hearings look like and why 3-minute public comment is powerful.
- The script is designed to be spoken in 2 minutes (roughly 280-320 words).
- First-person voice, natural speaking rhythm — not dense legal language.
- Opens: "Good evening, Commissioners. My name is ${fullName}. I am a homeowner at [address], in ${county} County."
- Middle: clear statement of their specific concerns (${concernList}) with one concrete reference (the Morris family precedent if water is concern, FL SB 484 if electricity is concern, etc.).
- Ends with a specific ask: typically a request for full public disclosure of cooling, water, electricity, and noise plans before the commissioners vote.
- Close: "Thank you for your time and for your service to our community."

## Section 6: Who to Contact + How

- List the official contact points, not specific email addresses.
- Include:
  - **Your ${county} County Commission** — direct reader to search "[county] County Florida Board of County Commissioners" for the official government page with current commissioner contact info.
  - **Your ${county} County Planning/Growth Management Department** — tell them this is where comprehensive plan amendments and rezoning applications are filed and reviewed.
  - **Your regional Water Management District** — identify which of Florida's 5 districts covers their county based on the county name (you should know this for Florida counties; if uncertain, say "search Florida's 5 water management districts to find the one that covers ${county} County").
  - **Florida Department of Environmental Protection (DEP)** — for air permits and environmental concerns.
  - **Florida Public Service Commission (PSC)** — for electricity rate and tariff concerns, especially after SB 484.
  - **Florida State Senate and House of Representatives** — direct them to flsenate.gov and flhouse.gov to find their specific state legislators.
- For each: give a one-sentence explanation of what they handle.
- End with: "When contacting these offices, reference specific agenda items or application numbers where possible. Generic complaints carry less weight than specific, well-documented questions about named applications."

## Section 7: Florida Law at Your Side

- Plain-English summary of what the following Florida laws mean for ${firstName}'s situation:
  - **Chapter 119 (Public Records Act)** — they have the right to request almost any document a developer files with the county. Explain how to file a request (written, to the county's designated records custodian).
  - **Government in the Sunshine Act** — most decisions affecting their property must be made in public meetings they can attend and speak at.
  - **SB 484 (passed Senate March 2026, effective July 1, 2026)** — this is genuinely good news for them. It protects residential ratepayers from having to subsidize data center electricity infrastructure, requires water management districts to handle large-scale data center water permits with specific review, and establishes NDA prohibitions. Frame it as a tool they can reference in their public comments.
  - **HB 1007 (2026, as amended February 2026)** — mirrors SB 484. Same tools.
  - **SB 1118 (2026)** — allows 12-month confidentiality exemption for developer info, but the project's identity as a data center must still be disclosed. Important caveat to know about.
  - **HB 1517 (Florida Data Center Transparency Act, 2026)** — if passed, would require detailed energy, water, carbon, and noise disclosure at the application stage. Currently in the Economic Infrastructure Committee. Note that its status may have changed.
  - **Fla. Stat. §288.075** — the longstanding Florida economic development confidentiality provision that developers have historically used to shield early negotiations for up to 12 months. Honest context.
- Close with: "These laws give you real leverage when used correctly. They do not make your participation guaranteed to succeed — but they make your voice genuinely consequential in the process."

# FINAL DISCLAIMER — INCLUDE AT THE END

After Section 7, include this exact disclaimer as a final paragraph:

"This Preparation Brief is educational and informational. It is not legal advice. Florida's public records, land use, and utility regulations are detailed and fact-specific. Before taking action that may affect your property, your legal rights, or your financial situation, consult a Florida-licensed attorney who handles land use or property matters. This brief is not a substitute for professional legal counsel, a professional property appraisal, or direct engagement with your county's government."

# FORMAT REQUIREMENTS

- Output only the HTML. No preamble, no meta-commentary, no "Here is the brief:" before it.
- Use <section class="brief-section"> to wrap each of the 7 sections.
- Each section starts with <h2>Section N: [Title]</h2>.
- Use <p>, <ul>, <ol>, <strong>, <em> as needed.
- The public comment letter in Section 4 should be wrapped in <blockquote class="comment-letter">.
- The hearing script in Section 5 should be wrapped in <blockquote class="hearing-script">.
- The final disclaimer should be wrapped in <p class="disclaimer">.

Now write the full brief for ${fullName}. Generate all 7 sections.
  `.trim();
}
