# -*- coding: utf-8 -*-
"""Batch twelve: xAI, Aligned Data Centers, Core Scientific."""
import io, json, os

R = {

"/company/xai/": {
 "paragraphs": [
  "xAI is the only data center operator in the United States currently being sued by the NAACP. "
  "In April 2026 the civil rights organisation, represented by the Southern Environmental Law "
  "Center and Earthjustice, filed suit against xAI and its subsidiary MZX Tech over the operation "
  "of dozens of unpermitted methane gas turbines used to power the Colossus 2 data center in South "
  "Memphis.",

  "The arrangement crosses a state line. The data center sits in Tennessee; the turbines "
  "generating its electricity sit in Southaven, Mississippi. The NAACP's claim is that xAI ran "
  "them in violation of the Clean Air Act before any air permit existed for them. The Mississippi "
  "Department of Environmental Quality granted a permit in March 2026 covering 27 turbines at the "
  "site. Reporting in July put the number that had actually been run at 59.",

  "The complaint asks the court to order xAI to stop operating unpermitted turbines, to install "
  "the best available control technology on the plant, and to pay a penalty for every day the law "
  "was broken. The NAACP has separately asked for emergency relief rather than waiting for the "
  "case to run its course.",

  "The location is why the case has the force it does. Memphis already fails the national "
  "standards for smog and has been named an asthma capital, and both Shelby County in Tennessee "
  "and DeSoto County in Mississippi hold an F grade for ozone pollution from the American Lung "
  "Association. The turbines were installed in a place with no headroom left in its air."
 ],
 "sources": [
  "https://naacp.org/articles/naacp-sues-xai-illegal-pollution-data-center-power-plant",
  "https://www.wsmv.com/2026/04/14/naacp-sues-xai-alleging-unlawful-operation-gas-turbines-southaven/",
  "https://earthjustice.org/press/2026/naacp-asks-court-for-emergency-action-to-stop-illegal-air-pollution-from-xais-data-center-power-plant",
  "https://www.selc.org/news/xai-built-an-illegal-power-plant-to-power-its-data-center/",
  "https://www.selc.org/news/inside-memphis-fight-against-xai/",
  "https://naacp.org/articles/naacp-selc-earthjustice-threaten-lawsuit-over-xais-unpermitted-gas-turbines-mississippi",
  "https://www.technology.org/2026/07/15/xai-59-unpermitted-gas-turbines-southaven-colossus-2/"
 ]
},

"/company/aligned-data-centers/": {
 "paragraphs": [
  "Aligned's Ohio campus is being built on top of an older industrial story. In September 2023 the "
  "company bought a 129-acre brownfield site in Perkins Township, in Erie County near Sandusky: a "
  "former New Departure plant built around 1947 that later passed to General Motors. Four "
  "hyperscale buildings are planned there, and the first of them, NEO-01, was due to be finished "
  "during 2026.",

  "The electrical scale is what the township is actually absorbing. NEO-01 connects to the "
  "FirstEnergy network, with Ohio Edison as the local distribution utility, taking power feeds of "
  "up to 80 megawatts and designed to go beyond 200 at full build, with rack densities above 300 "
  "kilowatts supported by air, liquid or hybrid cooling in the same hall.",

  "Residents raised the usual four objections, noise, electricity consumption, water and the "
  "broader environmental effect. The company's answer on water was to design the heat rejection to "
  "run without evaporative loss, which addresses one of the four. The other three are not "
  "engineered away.",

  "Northeast Ohio has not reacted as a bloc. One community has welcomed a campus of this size for "
  "the tax base and the construction work while neighbouring ones have pushed back on the same "
  "proposal, which is the split now visible across most of the state."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/aligned-acquires-130-acres-in-ohio-for-data-center-campus/",
  "https://www.news5cleveland.com/news/local-news/one-northeast-ohio-community-is-welcoming-a-massive-data-center-others-are-pushing-back",
  "https://www.compute-atlas.com/facilities/aligned-neo-01-oh",
  "https://northeastohioregion.com/news/aligned-data-centers-plans-new-data-center-campus-in-erie-county/",
  "https://www.ocolo.io/colocation/aligned-data-centers/sandusky-neo-01/",
  "https://baxtel.com/data-center/aligned-cleveland-neo-01"
 ]
},

"/company/core-scientific/": {
 "paragraphs": [
  "Core Scientific is not building new data centers so much as changing what its existing ones do. "
  "The company is converting, refurbishing or reallocating eleven facilities across Alabama, "
  "Georgia, Kentucky, North Carolina, North Dakota, Oklahoma and Texas from bitcoin mining to AI "
  "and high performance computing workloads, and winding the mining business down as it goes.",

  "The largest of those conversions is at Pecos, Texas, where a 300 megawatt mining operation is "
  "planned to become a campus of around 1.5 gigawatts. The company secured about $3.3 billion of "
  "backing for the pivot and signed a supply deal with AMD in July 2026.",

  "For the places involved this is the part worth understanding: a conversion usually does not "
  "require a new vote. The land is already zoned, the substation is already built and the "
  "interconnection agreement is already signed, because a community agreed to a bitcoin mine years "
  "ago. What arrives afterwards can be five times the electrical load with a different noise "
  "profile, different cooling and a different water demand, without the hearing that a new "
  "application would have triggered.",

  "The company's own framing, in its filings, is about turning power capacity into long-term "
  "contracted revenue and reducing its exposure to the bitcoin price. The power capacity in "
  "question is the grid connection a county granted for something else."
 ],
 "sources": [
  "https://www.theregister.com/2026/04/27/core_scientific_ai/",
  "https://www.coindesk.com/business/2026/07/28/core-scientific-lands-amd-ai-deal-as-bitcoin-mining-operation-winds-down",
  "https://www.sec.gov/Archives/edgar/data/0001839341/000183934126000014/core-20260630.htm",
  "https://finance.yahoo.com/markets/stocks/articles/core-scientific-refocuses-ai-data-200758122.html",
  "https://enkiai.com/sustainability-initiatives/data-center/crypto-mining-conversion-ai-companies/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
