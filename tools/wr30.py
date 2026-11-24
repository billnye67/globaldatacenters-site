# -*- coding: utf-8 -*-
"""Batch thirty: Troup County GA and Caddo Parish LA, second pass.

Both were written before the paywall rule. Troup had one article opened and every LaGrange Daily
News report refused; Caddo had KTAL refuse twice and the Louisiana Illuminator refuse once.

Redo method:
  Troup County   3 further searches on Hogansville, Fertile Ground Investments and the Lafayette
                 Logistics Center rather than the county. The LaGrange Daily News opened with
                 curl and a browser user agent on every attempt. 6 searches and 3 articles opened
                 in total. hhjonline sits behind a Javascript challenge and is still unread.
  Caddo Parish   3 further searches on Shreveport, Stack Infrastructure and the litigation. Data
                 Center Dynamics and the Shreveport-Bossier City Advocate both opened with curl
                 after refusing WebFetch. 6 searches and 4 articles opened in total.
"""
import io, json, os

R = {

"/data-centers/united-states/georgia/troup-county/": {
 "paragraphs": [
  "The 400 acres Hogansville offered for a data center used to be the city's sprayfield, and the "
  "people who live on Hightower Road beside it went to the Royal Theater in December 2025 to "
  "explain what that meant to them. About twenty spoke. Amanda Coleman, eighteen years on her "
  "property, put it to the council directly: “Y'all are telling me that a data center on our "
  "road is best for us? Y'all are telling me now that a data center is more important than family, "
  "than our rights, 'cause really that's what you're saying. It's going to pollute our water, run "
  "our animals away, dry our wells.” Chance Williams and Stacey Smith spoke about the same "
  "road and the same family history on it. At a later hearing close to 200 people turned up and "
  "all seventeen who spoke opposed the project.",

  "What had angered the town first was the secrecy. The council signed a non-disclosure agreement "
  "in a January 2024 executive session to open talks on a proposed economic development, which "
  "officials said is standard practice, and the plans stayed out of public view for about eighteen "
  "months. The council pushed to have the NDA lifted as soon as it could. “I'm not sure what "
  "their definition of transparency is,” said Roseanna Prado, “but mine certainly isn't "
  "keeping something like this from the public.” Paula Darden, a retired nurse, was shorter: "
  "“It's infuriating.”",

  "The project is a 600 megawatt data center on 437 acres, from Luis Matta of Fertile Ground "
  "Investments, who also sits on the board of the Fayette County Development Authority. He offered "
  "$12,000 an acre, conditional on rezoning from residential to industrial. Councilman Michael "
  "Taylor Jr., the only council voice against it, did the arithmetic that mattered to him: "
  "“At the end of the day, it's only going to bring about 30 to 35 jobs.”",

  "The power was never there. MEAG, the state municipal power agency, ran a transmission study and "
  "concluded there is currently no generation available for 600 megawatts, and put the "
  "infrastructure needed at about $300 million with $153.75 million of it falling on the customer "
  "side. “How could you sit there and tell people from Hightower Road and look them in the eye "
  "and say they're not going to lose their properties?” asked Gage Bailey, the LaGrange "
  "activist who has spent the past year pressing cities across the county to write restrictions.",

  "Hogansville has since refused to build the zoning the project would need. It adopted a 90-day "
  "moratorium, and on August 17, 2026 the council voted 4-1 to deny a proposed development "
  "ordinance amendment that would have created a Heavy Industrial district and data center "
  "standards together, then extended the moratorium unanimously to its next meeting on September "
  "8. Albert Prado of 700 East Main Street had asked it to hold off and add at least another 90 "
  "days. With no heavy industrial land inside the city limits, every future proposal has to be "
  "rezoned in public first.",

  "The county wrote its rules rather than refusing. Troup adopted a 90-day moratorium on data "
  "center zoning changes, extended it by another 90, then approved a 17-page text amendment and "
  "lifted the pause: a special use permit for every data center, average and hyperscale facilities "
  "confined to heavy industrial zoning, a 1,500-foot setback, Tier 4 diesel generators rather than "
  "the Tier 2 engines normally installed, mandatory connection to public sewer, and roofs built to "
  "carry solar panels. The Troup County Anti-Data Center Coalition told commissioners it did not go "
  "far enough; Cindy Hutchings raised PFAS contamination found at some data center sites, "
  "low-frequency noise, and air and water quality.",

  "LaGrange spent the winter arguing about the same question and split on it. At a work session on "
  "January 30, 2026 city planner Mark Kostial brought back amendments confining data centers to "
  "general or heavy industrial zoning, 1,500 feet from any other data center or residential zoning "
  "measured property line to property line, with the 300-foot noise buffer unchanged and "
  "hyperscale facilities allowed only in heavy industrial. Council members Mark Mitchell, Leon "
  "Childs and Ameia Williams wanted a special use permit on top, which would force a public "
  "hearing. Darby Pippin opposed that, arguing no data center would ever be approved once the "
  "public got a hearing.",

  "Mayor Arrington explained what the heavy industrial rule would actually do: “We only have "
  "two parcels that are zoned heavy industrial, and then there's somebody already on those two "
  "parcels. It's the landfill and Lee Kum Kee. If we require hyperscale data centers in heavy "
  "industrial, that would strike a public hearing on every one of them that comes through because "
  "we would have to rezone a piece of property to heavy industrial.” The council ultimately "
  "decided to handle them case by case through special use permits, and passed a 180-day "
  "moratorium.",

  "The live application is at the Lafayette Logistics Park, up to two million square feet across "
  "134 acres beside Interstate 85, which the developer Farpoint broke ground on in November 2024 "
  "as a speculative business park. The data center permit covers land on Pegasus Parkway and Old "
  "Hutchinson Mill Road; the planning commission first took it on June 9, tabled it, and returned "
  "on July 13 before recommending approval subject to noise studies and a 100-foot vegetative "
  "buffer with a six-foot berm along the road. Eight parcels immediately adjoining sit outside the "
  "city and are zoned suburban single-family residential by the county. Councilman Mark Mitchell "
  "asked where the electricity would come from; the developers said through Georgia Transmission "
  "as part of a larger build serving this site and a neighbouring one, and city manager Patrick "
  "Bowie said more work would be needed before the site could be served at all.",

  "There is an alternative on the table, which is rare in these fights. The LaGrange Development "
  "Authority has been working up Project Angel, a $200 million build-to-suit manufacturing plant "
  "of about 1.4 million square feet, for the same land if the data center permit is refused.",

  "None of it was settled above them. Georgia's legislature adjourned without passing significant "
  "data center restrictions and never seriously took up a moratorium, Georgia Power has asked to "
  "add roughly 10,000 megawatts of capacity, and the state is forgoing an estimated $2.5 billion "
  "in revenue in 2026 through data center tax exemptions."
 ],
 "sources": [
  "https://www.gpb.org/news/2025/11/26/why-are-troup-county-residents-saying-no-600-mw-data-center-in-hogansville",
  "https://www.lagrangenews.com/news/hogansville-residents-speak-out-against-proposed-data-center-f3f9f9a7",
  "https://www.lagrangenews.com/news/lagrange-council-still-divided-on-special-use-permits-for-data-centers-5a34c9ce",
  "https://citizenportal.ai/articles/9885751/georgia/troup-county/hogansville/hogansville-council-rejects-data-center-zoning-ordinance-extends-moratorium-to-sept-8",
  "https://www.lagrangenews.com/news/hogansville-approves-90-day-moratorium-for-data-centers-9d59b175",
  "https://www.lagrangenews.com/news/commissioners-approve-data-center-ordinance-lift-moratorium-2b6e15ed",
  "https://www.lagrangenews.com/news/anti-data-center-coalition-says-proposed-ordinance-falls-short-adfe3cc6",
  "https://www.lagrangenews.com/news/developer-seeking-special-use-permit-for-data-center-in-lagrange-da2c7edf",
  "https://www.lagrangenews.com/news/lda-working-on-alternate-non-data-center-proposal-for-lafay-4bebc450",
  "https://www.lagrangenews.com/news/lagrange-punts-on-data-center-restrictions-deciding-to-handle-them-on-a-case-by-case-basis-via-special-use-permit-d85cb4d1",
  "https://www.wsbtv.com/news/local/lagrange-city-council-passes-180-day-moratorium-data-centers/LFCNYS3HWRE3VJ3AJBBLRT3COA/",
  "https://farpointdev.com/?property=lafayette-logistics-park",
  "https://www.ajc.com/business/2026/04/georgia-lawmakers-leave-data-center-tax-breaks-intact-punt-on-energy-costs/"
 ]
},

"/data-centers/united-states/louisiana/caddo-parish/": {
 "paragraphs": [
  "Most of Caddo Parish has no zoning at all. Outside Shreveport's city limits and the five-mile "
  "planning boundary around them there is nothing on the books, which Stephen Jean of the "
  "Metropolitan Planning Commission put plainly: there is no zoning whatsoever outside that "
  "boundary. A developer building on unincorporated parish land is not asking anyone's permission, "
  "and that one fact explains most of what has happened here since February.",

  "Amazon announced on February 23, 2026 that it would spend more than $12 billion on three "
  "interconnected campuses across Caddo and Bossier parishes, with Governor Jeff Landry, Amazon's "
  "Roger Wehner and STACK Infrastructure's chief executive Matt Vanderzanden on the stage at "
  "Shreveport Municipal Auditorium. By August it had grown again: a further $6 billion for a third "
  "campus at the Resilient Technology Park, a 313-acre site beside Interstate 20 in west "
  "Shreveport, taking the Louisiana total to $18 billion. STACK is building all three. AWS has not "
  "disclosed the power or IT capacity of the Shreveport campus, or how many buildings it will "
  "hold.",

  "The employment figures depend which campus is being counted. Shreveport is put at about 210 "
  "permanent jobs and 2,250 construction jobs; across all three campuses the numbers given are up "
  "to 750 full-time data center jobs and roughly 2,200 to 2,500 further positions supported.",

  "The commitments are the company's own and worth attributing as such. Keith Klein, Amazon's "
  "director of data center supply solutions, restated the promise when the third campus was "
  "announced: “Amazon pays its own way, and the communities where we operate will be better "
  "off because we're there... We're continuing to protect ratepayers and strengthen this community "
  "for the long term.” Roger Wehner has said the campuses will use water for cooling less "
  "than 13 per cent of the year on a design 80 per cent more efficient than the industry average. "
  "AWS says it will fund all the water and wastewater improvements its projects require and has "
  "committed up to $400 million to public water systems in the two parishes. The Bossier campus "
  "near Benton is put at 57 million gallons of water a year, air cooled except when the "
  "temperature passes 85 degrees. On electricity, SWEPCO president Brett Madison said Amazon had "
  "committed to pay 100 per cent of its own costs and American Electric Power said none of it "
  "would reach other customers' bills. Unlike Meta's Louisiana deal, the arrangement did not "
  "require Public Service Commission approval.",

  "Residents have found the answers hard to get. At a meeting held by SWEPCO, the city and the "
  "water utility, people asked about jobs, electricity and water and said afterwards they never "
  "got a straight answer on any of the three. In Blanchard, protesters stood outside the town hall "
  "in March while a community meeting about the Stateline Data Center went on inside.",

  "Inside Shreveport, where zoning exists, the argument went to court. The Metropolitan Planning "
  "Commission refused a special use permit for the west Shreveport data center at a packed meeting "
  "on December 3, 2025; the city council then overturned that refusal unanimously. In mid-January "
  "Tyler Gordon, the mayor of Mooringsport, with Mary Blakemore and Michael Craft, filed a "
  "judicial petition for review alleging that Mayor Tom Arceneaux and the council had unlawfully "
  "withheld public information. The city's answer was that none of the three had standing to "
  "challenge the decision at all.",

  "District Court Judge Ramon Lafitte dismissed the petition in April 2026 and upheld the permit. "
  "“If the petitioners are inclined to pursue this, the most obvious is to appeal to the 2nd "
  "Circuit Court,” said Clay Garside, one of their attorneys. “I believe the plaintiffs "
  "are inclined.” They were. The appeal went to the Second Circuit, backed by the Sierra "
  "Club, with both sides agreeing to submit on the record rather than argue it, and judges Shondra "
  "Stone, James Stephens and Jeff Robinson are due to hand down a written decision on November 18, "
  "2026.",

  "The parish commission has tried twice to slow things down and been stopped by the same gap that "
  "lets the projects through. Commissioner John-Paul Young proposed a two-year moratorium on tax "
  "benefits for future data centers in August; it went back to committee. Parish attorney Donna "
  "Frazier advised that a moratorium cannot be created by resolution at all, because under the "
  "charter a resolution has no force of law, and that an ordinance imposing one on a land use in "
  "an area with no master plan and no zoning would conflict with the Louisiana Constitution of "
  "1974 and with state law. A parish with no zoning cannot pause what it never regulated.",

  "Young tried the narrower route instead. Resolution 53 would have asked the Planning and Zoning "
  "Commission merely to consider recommending a moratorium on data center construction in the "
  "commercially and industrially zoned parts of unincorporated Caddo Parish. On August 31, 2026 "
  "the commission voted it down 6-4, with two members absent. It has also declined to take up a "
  "one-year pause on developments drawing water from Caddo Lake.",

  "The pressure has not come only from residents. A parish zoning official brought the commission "
  "research on the noise and heat these buildings generate, described the newer ones as colossal "
  "concrete monoliths that permanently erase wildlife habitat and completely alter the local "
  "microclimate, and argued the commission already has tools short of a moratorium it could be "
  "using."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/aws-pledges-6bn-investment-in-data-center-campus-in-shreveport-louisiana/",
  "https://www.shreveportbossieradvocate.com/business/west-shreveport-data-center-back-on-track-for-construction/article_b57b6eb0-d3d4-4df6-bcf0-b7844dbe2e1b.html",
  "https://www.ksla.com/2026/09/15/caddo-parish-commission-rejects-pause-data-center-construction/",
  "https://www.yahoo.com/news/articles/amazon-says-limit-water-pay-224040383.html",
  "https://www.ksla.com/2026/02/24/shreveport-data-center-lawsuit-petition-alleges-city-withheld-public-information/",
  "https://www.ksla.com/2026/04/21/shreveport-data-center-lawsuit-city-shreveport-wins/",
  "https://www.settletalk.com/settle-talk-blog/2026/9/21/status-report-on-shreveport-data-center-litigation",
  "https://www.ktbs.com/news/louisiana/sierra-club-backs-appeal-against-west-shreveport-data-center-development/article_02fbcd31-883a-59a4-b561-e03d01df0f48.html",
  "https://www.ksla.com/2026/08/18/amazon-web-services-announces-third-data-center-campus-is-coming-shreveport/",
  "https://www.ksla.com/2026/03/19/bossier-police-jury-holds-public-hearing-amazon-data-center/",
  "https://www.ksla.com/2026/08/18/caddo-parish-commissioner-seeks-moratorium-data-center-tax-incentives/",
  "https://www.ktbs.com/news/caddo-commission-data-center-moratorium-on-hold-as-legality-questioned/article_73ba2fa2-4887-462c-b8b9-5b38e386bab3.html",
  "https://www.shreveportbossieradvocate.com/news/yall-have-got-tools-caddo-zoning-official-pushes-alternatives-for-data-center-restrictions/article_ce48f3dd-3ef0-4313-a595-254db26e4139.html"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-52s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
