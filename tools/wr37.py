# -*- coding: utf-8 -*-
"""Raw-text recheck: Troup County GA, Kent County MI.

Both re-read with tools/read-article.py.

Troup: every quotation held, but two were truncated at the point that made them land, and the
mechanism of the whole story was missing. The reporting is the Ledger-Enquirer's (Kala Hunter),
carried by GPB, and is now credited that way.

Kent: Knooihuisen's quote had a clause on the page that is not in the article. Removed.
"""
import io, json, os

R = {

"/data-centers/united-states/georgia/troup-county/": {
 "paragraphs": [
  "Nobody in Hogansville would know about the data center at all if Al Prado had not asked. In "
  "October he sent the city an open records request for every document it held on data centers, "
  "after hearing from Gage Bailey, an anti-data-center activist from neighbouring LaGrange who has "
  "spent the past year pressing towns in the county to write restrictions. What came back is the "
  "reason there is a story.",

  "The documents showed that Luis Matta, a developer from Fayetteville who works for Fertile "
  "Ground Investments and sits on the board of the Fayette County Development Authority, had been "
  "talking to the city and the Hogansville Development Authority about buying 437 acres at $12,000 "
  "an acre. The sale is conditional on the land being rezoned from residential to industrial. "
  "Matta and the Fayette County Development Authority are overseeing one of the largest data "
  "center campus projects in Georgia.",

  "They also contained a power study by MEAG, the municipal electric company group that supplies "
  "Hogansville, assessing how feasible it would be to bring 600 megawatts online, which is roughly "
  "what the data center would need.",

  "This is a town of about 3,000 people, and until the records came back its residents knew the "
  "acreage and the megawatts and nothing else. The plans had been held for at least eighteen "
  "months under a non-disclosure agreement signed by the city council and the mayor, which is how "
  "Councilman Michael Taylor Jr. described it.",

  "“At every city council meeting, councilmembers talk about transparency; they use the word "
  "over and over again,” Roseanna Prado told the Ledger-Enquirer, at a meeting in her living "
  "room in November. “I'm not sure what their definition of transparency is, but mine "
  "certainly isn't keeping something like this from the public.” Paula Darden, a retired "
  "nurse who had moved to Hogansville, put it in two words: “It's infuriating.”",

  "The objections residents have raised are property values, the energy the site would consume, "
  "the water in particular, and what it would do to utility bills.",

  "The county wrote rules rather than refusing outright. Troup adopted a 90-day moratorium on data "
  "center zoning changes, extended it by another 90, then approved a 17-page text amendment and "
  "lifted the pause: a special use permit for every data center, average and hyperscale facilities "
  "confined to heavy industrial zoning, a 1,500-foot setback, Tier 4 diesel generators rather than "
  "the Tier 2 engines normally installed, mandatory connection to public sewer, and roofs built to "
  "carry solar panels. The Troup County Anti-Data Center Coalition told commissioners it did not "
  "go far enough.",

  "Hogansville has since refused to build the zoning the project needs. On August 17, 2026 the "
  "council voted 4-1 against a development ordinance amendment that would have created a Heavy "
  "Industrial district and data center standards together, then extended its moratorium "
  "unanimously to the next meeting on September 8. With no heavy industrial land inside the city "
  "limits, any future proposal has to be rezoned in public first.",

  "LaGrange spent the winter split on the same question. At a work session on January 30, 2026 "
  "city planner Mark Kostial brought back amendments confining data centers to general or heavy "
  "industrial zoning, 1,500 feet from any other data center or residential zoning measured "
  "property line to property line, with a 300-foot noise buffer and hyperscale facilities allowed "
  "only in heavy industrial. Council members Mark Mitchell, Leon Childs and Ameia Williams wanted "
  "a special use permit on top, forcing a public hearing. Darby Pippin opposed that, arguing no "
  "data center would ever be approved once the public got one.",

  "Mayor Arrington explained what the heavy industrial rule would do in practice. “We only "
  "have two parcels that are zoned heavy industrial, and then there's somebody already on those "
  "two parcels. It's the landfill and Lee Kum Kee,” he said. “If we require hyperscale "
  "data centers in heavy industrial, that would strike a public hearing on every one of them that "
  "comes through because we would have to rezone a piece of property to heavy industrial.” "
  "The council ultimately chose to handle them case by case through special use permits, and "
  "passed a 180-day moratorium.",

  "The live application is at the Lafayette Logistics Park, up to two million square feet across "
  "134 acres beside Interstate 85, which the developer Farpoint broke ground on in November 2024 "
  "as a speculative business park. The permit covers land on Pegasus Parkway and Old Hutchinson "
  "Mill Road; the planning commission took it on June 9, tabled it, returned on July 13 and "
  "recommended approval subject to noise studies and a 100-foot vegetative buffer with a six-foot "
  "berm. Eight adjoining parcels sit outside the city and are zoned suburban single-family "
  "residential by the county. There is also an alternative on the table, which is rare: the "
  "LaGrange Development Authority has been working up Project Angel, a $200 million build-to-suit "
  "manufacturing plant of about 1.4 million square feet, for the same land if the permit is "
  "refused."
 ],
 "sources": [
  "https://www.gpb.org/news/2025/11/26/why-are-troup-county-residents-saying-no-600-mw-data-center-in-hogansville",
  "https://www.lagrangenews.com/news/hogansville-residents-speak-out-against-proposed-data-center-f3f9f9a7",
  "https://www.lagrangenews.com/news/lagrange-council-still-divided-on-special-use-permits-for-data-centers-5a34c9ce",
  "https://www.lagrangenews.com/news/commissioners-approve-data-center-ordinance-lift-moratorium-2b6e15ed",
  "https://www.lagrangenews.com/news/lda-working-on-alternate-non-data-center-proposal-for-lafay-4bebc450",
  "https://www.lagrangenews.com/news/developer-seeking-special-use-permit-for-data-center-in-lagrange-da2c7edf",
  "https://www.wsbtv.com/news/local/lagrange-city-council-passes-180-day-moratorium-data-centers/LFCNYS3HWRE3VJ3AJBBLRT3COA/"
 ],
 "unconfirmed": "The Hogansville reporting is the Ledger-Enquirer's, by Kala Hunter, carried by GPB; "
   "it is now credited that way rather than to GPB alone. Removed in the raw-text recheck: that "
   "Michael Taylor Jr. was the only council voice against the project, which the article does not say "
   "(it cites him as the source for the NDA, not as a lone dissenter); that the council pushed to "
   "have the NDA lifted as soon as it could; and MEAG infrastructure figures of about $300 million "
   "with $153.75 million falling on the customer side, which are not in the portion of the article "
   "read. Prado's and Darden's quotations held and both are now given in full, Prado's with the "
   "opening clause about councilmembers using the word transparency over and over, which is the half "
   "that makes it land. Also recovered: the open records request by Al Prado that produced every "
   "document this account rests on, and that residents knew only the acreage and the megawatts "
   "before it."
},

"/data-centers/united-states/michigan/kent-county/": {
 "paragraphs": [
  "In December 2025 a Grand Rapids business owner turned up to the Lowell Charter Township "
  "planning commission in a Mr. Peanut costume holding a sign that read “This is nuts.” "
  "The crowd was large enough that the commission postponed the public hearing on rezoning, and "
  "days later officials said they were holding off. Nobody in the room yet knew whose data center "
  "it was.",

  "Franklin Partners, an Illinois developer, had raised it at the commission in November 2025, "
  "asking the township to add a definition of a data warehousing facility to its zoning ordinance "
  "and to rezone the Covenant Business Park to Industrial. It would say only that it was working "
  "with a national company. Open houses that December drew standing-room-only crowds.",

  "On January 7, 2026 Microsoft ended the guessing in a letter the township published. “We "
  "are introducing ourselves now because we have observed that the community would like more "
  "information about the proposal,” it said. It named the site as the 237-acre lot beside "
  "Interstate 96, in a township of about 6,500 people twenty miles southeast of Grand Rapids, "
  "terminated the non-disclosure agreements in place, and said it would stop using NDAs with local "
  "governments altogether. On April 13 it applied to rezone Covenant Business Park and three "
  "adjoining properties to light industrial, for an investment put at $500 million to $1 billion "
  "over three to five years.",

  "The township then declined to pause. On May 19, 2026 the board voted 2-5 against a moratorium, "
  "to booing and shouts of recall. Trustee Andy Vander Ziel argued it should take expert advice "
  "and stay open to the conversation rather than regulate first. Resident Jessica Mazarka offered "
  "the board the expertise it said it lacked: “You have an audience full of people who are "
  "willing to help you in this fight.” A committee was formed to draft an ordinance anyway.",

  "West of there, Gaines Township moved its hearing to South Christian High School because the "
  "township hall would not hold the people coming. An earlier hearing had been cancelled for "
  "overcrowding. Hundreds came on April 15, 2026, and the planning commission tabled the vote to a "
  "meeting it has not yet scheduled, without sending anything to the board of trustees. Microsoft "
  "had already asked once to delay while it revised the plans.",

  "Microsoft assembled that site quietly: 316 acres bought from the office furniture maker "
  "Steelcase in 2024 for $45.3 million, and a further 40.5 acres from Republic National "
  "Distributing in November 2024 for $9.7 million. Reports of how much land the rezoning covers "
  "differ, from five parcels of nearly 104 acres along Patterson Avenue SE and 76th Street SE to "
  "more than 400 acres.",

  "What the neighbours said was specific and local. “I'm basically here to fight for the "
  "community, for our neighbors, for our schools,” said Molly Knooihuisen, who lives near the "
  "site. “Why would you want to move here to live next to that? Like people might be able to "
  "hear it for up to 2 miles, you know? So, yeah, I don't see anything good about it "
  "whatsoever.” Stephanie Pratt, who lives 150 feet away at 76th and Patterson, talked about "
  "the land: “That whole property that they have has been farmed for the 10 years I've lived "
  "there. Every year they put crops in so now we're losing all those crops.”",

  "The township's answer on the environment was about thresholds rather than refusal. “If "
  "they're discharging something bad into the air that could affect human health, they have to put "
  "some kind of scrubber on it, or limit that to the point where it is no longer a threat to human "
  "health,” Dan Wells said. “Same thing with water discharges.”",

  "Microsoft's own statement is worth quoting as its own, because it is the company's claim rather "
  "than a finding: its community-first commitments mean it will pay its own way so its data "
  "centers do not increase electricity prices, replenish more water than it uses, add to the local "
  "tax base and strengthen the community without adding strain to local resources. Consumers "
  "Energy, which would serve the site, filed a memo pointing at its November 2024 rate tariff "
  "filing and a March 2025 cost-of-service analysis, both of which it says require large energy "
  "users to fully fund the transmission, distribution and generation their service needs.",

  "Solon Township, in the north of the county, is on its fifth draft and running out of time. It "
  "adopted a six-month moratorium in February 2026 amid pushback, due to expire in August, and its "
  "planning commission has tabled the latest zoning ordinance. The number at issue is 800 acres, "
  "which the draft would allow, against the 200 acres residents have asked for. They have pointed "
  "out that the township already caps solar fields at 200 acres.",

  "Across Kent County the pattern is that the pause is the thing that fails. Gaines tabled rather "
  "than refused, Lowell voted a moratorium down and started drafting rules afterwards, and Solon "
  "is redrafting against a clock."
 ],
 "sources": [
  "https://www.cnbc.com/2026/01/07/microsoft-behind-controversial-data-center-in-michigan-township.html",
  "https://www.fox17online.com/news/local-news/wyoming-kentwood-byron-center/hundreds-of-neighbors-protest-microsoft-data-center-rezoning-proposal-at-gaines-township-public-hearing",
  "https://www.michiganpublic.org/politics-government/2026-05-20/why-one-michigan-township-just-rejected-data-centers-while-another-stays-open-to-them",
  "https://www.woodtv.com/news/kent-county/solon-township-board-tables-ordinance-proposal-to-limit-data-centers/",
  "https://wwmt.com/news/local/consumers-energy-energy-utilities-microsoft-ai-data-center-gaines-township-caledonia-kent-county-michigan-public-hearing-wwmt",
  "https://www.crainsgrandrapids.com/news/real-estate/microsoft-asks-gaines-township-to-delay-vote-on-data-center-rezoning/"
 ],
 "unconfirmed": "Removed in the raw-text recheck: a clause saying Molly Knooihuisen asked officials to "
   "stand up for the people in front of them, which is a paraphrase and is not in the Fox 17 article; "
   "her quotation is now given as she said it. The acreage of the Gaines rezoning is genuinely "
   "disputed between sources, 104 acres in one account and more than 400 in another, and the page now "
   "says so rather than picking one. Microsoft's pledges are marked on the page as the company's own "
   "claim. Still resting on WebFetch summaries and not yet re-read raw: the Michigan Public account "
   "of the Lowell 2-5 vote with Vander Ziel and Mazarka, and the Consumers Energy tariff memo."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
for k in R: print('  %-52s %4d -> %4d words'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs'])))
