# -*- coding: utf-8 -*-
"""Batch thirteen: Franklin County OH, Henrico County VA, Ile-de-France, Johor."""
import io, json, os

R = {

"/data-centers/united-states/ohio/franklin-county/": {
 "paragraphs": [
  "The pauses in Franklin County have come from the townships rather than from Columbus. Grove "
  "City's council passed a data center moratorium 6-1, adding a task force and a six-month review "
  "as amendments so the pause would produce rules rather than just delay. Jackson Township's "
  "trustees then voted unanimously for a one-year moratorium covering the unincorporated land "
  "around Grove City in the southwest of the county, and trustees in neighbouring Pleasant "
  "Township approved one of their own during 2026.",

  "What the county is arguing about underneath the zoning is the electricity bill. AEP Ohio "
  "customers filed against the utility's proposed rate increase on the grounds that new data "
  "centers are what is putting the grid under pressure. Staff at the Public Utilities Commission "
  "of Ohio came back with a smaller number, an increase of roughly $280 million to $296 million "
  "which, taken with the other changes in the case, would leave an average residential bill about "
  "$1.47 lower rather than higher. Evidentiary hearings ran from January 21, 2026.",

  "Separately the commission approved interconnection rules for data centers on terms AEP had put "
  "forward and described as protecting other customers, setting out what a very large new load has "
  "to commit to before it can connect.",

  "At the state level the tax side has closed for now. Ohio approved $42 million in exemptions for "
  "two data centers immediately before a pause on further awards took effect, and the wider Ohio "
  "surge has drawn resistance from both residents and legislators through 2026."
 ],
 "sources": [
  "https://myfox28columbus.com/news/local/grove-city-data-center-moratorium-passes",
  "https://abc6onyourside.com/news/local/moratorium-another-central-ohio-community-is-saying-no-to-data-centers-policy-tech-energy-water-consumption",
  "https://www.wosu.org/politics-government/2025-12-05/aep-ohio-customers-oppose-proposed-electric-rate-hike-as-new-data-centers-pressure-grid",
  "https://www.utilitydive.com/news/Ohio-regulators-approve-aep-data-center-interconnection-rules/752690/",
  "https://www.aepohio.com/company/about/rates/data-center-tariff/",
  "https://signalcleveland.org/ohio-approves-last-data-center-exemption-before-moratorium/",
  "https://www.axios.com/local/columbus/2026/03/04/ohio-data-center-boom-moratorium-laws"
 ]
},

"/data-centers/united-states/virginia/henrico-county/": {
 "paragraphs": [
  "Henrico County took away the right to build a data center without asking. In June 2025 the "
  "Board of Supervisors voted unanimously to require board approval and a public hearing for every "
  "new hyperscale data center proposal anywhere in the county, including inside the White Oak "
  "Technology Park, where the use had previously been permitted by right. The board had deferred "
  "the same question a month earlier before coming back and eliminating by-right approval "
  "altogether.",

  "The pressure that produced that has not eased. On May 19, 2026 more than a hundred residents "
  "filled a town hall at the Varina Area Library to object to a QTS expansion near White Oak. The "
  "objections were about millions of gallons of water going to cooling, constant truck traffic and "
  "construction, and what the county would be left with in the long term.",

  "The most striking thing said that night came from the supervisor rather than the audience. "
  "Tyrone Nelson, who represents Varina and whose district contains White Oak, defended his record "
  "of supporting these projects while conceding that when Meta announced a $1 billion data center "
  "at White Oak in 2017 he did not understand everything that came with one. He was, he said, "
  "excited about it at the time.",

  "The county has not stopped approving them. A 622-acre data center project was granted after the "
  "rules changed, and Henrico has published design guidelines governing how the buildings look and "
  "sit rather than whether they get built. What changed in 2025 is that each one now has to be "
  "argued for in public, which is why residents had a meeting to go to in 2026."
 ],
 "sources": [
  "https://www.henricocitizen.com/henrico-supervisors-vote-unanimously-to-require-individual-approval-of-future-hyperscale-data-center-proposals/",
  "https://richmondbizsense.com/2025/06/11/henrico-tightens-restrictions-on-data-center-projects-eliminates-by-right-approvals/",
  "https://richmondbizsense.com/2025/05/16/henrico-supervisors-defer-votes-on-proposed-data-center-rule-changes/",
  "https://www.wtvr.com/news/local-news/henrico-county/residents-push-back-qts-data-center-expansion-may-19-2026",
  "https://www.henricocitizen.com/data-center-concerns-draw-crowd-to-varina-town-hall-meeting/",
  "https://www.wric.com/news/local-news/henrico-county/622-acre-data-center-project-greenlit-by-henrico-board-of-supervisors/",
  "https://henrico.gov/public-data/data-center-design-guidelines/"
 ]
},

"/data-centers/france/ile-de-france/": {
 "paragraphs": [
  "Three quarters of France's data centres are in the Paris region. Of the 352 counted nationally "
  "in 2026, around 17 are under construction across 13 municipalities in Ile-de-France, against "
  "only four sites in development in the whole of the rest of the country. The concentration is "
  "not a side effect; it is what the fight here is about.",

  "The largest of the proposals is Campus IA, near Melun, which the departmental prefect has "
  "authorised: eleven data centre buildings across 90 hectares, the equivalent of about 126 "
  "football pitches, which would make it the biggest data centre in Europe. Residents, farmers and "
  "environmental groups organised against it under the name Stop Campus IA, and the "
  "authorisation came from the prefect rather than from the commune, which is the part locals "
  "object to most.",

  "The regional authority has taken the argument to the electricity tariff instead of the "
  "planning file. Ile-de-France has rejected the current financing mechanism, which rests "
  "substantially on the TURPE, the charge for using the public electricity network, because under "
  "it the cost of connecting these buildings is spread rather than carried. The region's stated "
  "aim is to preserve connection capacity for industrial projects, essential public facilities and "
  "transport infrastructure that would otherwise be crowded out.",

  "This is now a national question. Around a third of France's sixty announced data centre "
  "projects were facing organised local opposition as of June 2026, and parliament has been "
  "considering legislation to curb the development directly."
 ],
 "sources": [
  "https://www.spacegroup.no/paris-region-to-host-europes-largest-data-center-as-opponents-strike-back/",
  "https://www.dawnliphardt.com/ile-de-france-region-tries-to-contain-the-booming/",
  "https://www.reportingfromparis.fr/p/french-scream-nimby-at-new-ai-datacenters",
  "https://www.datacenterdynamics.com/en/news/france-considers-law-to-curb-data-center-developments/",
  "https://www.intotheminds.com/blog/en/data-centre-market/",
  "https://www.addleshawgoddard.com/en/insights/insights-briefings/2025/real-estate/the-future-of-data-centres-in-france/"
 ]
},

"/data-centers/malaysia/johor/": {
 "paragraphs": [
  "Johor took most of Malaysia's data centre boom, roughly 72 facilities, because land is cheaper "
  "and electricity costs less than across the strait in Singapore. In November 2025 the state "
  "began taking some of it back, asking investors to postpone water-cooled expansions for about "
  "eighteen months, to roughly the middle of 2027, during drought, and halting approvals "
  "altogether for the largest and most water-hungry facilities.",

  "The rule now is blunt. A data centre relying on evaporative or otherwise water-intensive "
  "cooling has to wait until 2027 before its water supply request will even be considered. "
  "Anything that can cool itself without drawing heavily on the public supply can proceed.",

  "The vetting behind that covers six areas: how much water and electricity a project will use, "
  "its environmental impact, its measured water and power usage effectiveness, whether fibre "
  "infrastructure exists at the site, what cooling technology it proposes and how far that reduces "
  "water dependence, and whether it can draw on an alternative water source rather than the "
  "treated supply.",

  "The clusters sit around Kulai and Sedenak, taking in Sedenak Tech Park and YTL's Green Data "
  "Center Park, along with Nusajaya and Iskandar Puteri. Sedenak Tech Park, the oldest of them, is "
  "now running into water and power bottlenecks that will not clear until new capacity arrives, "
  "and some developers have moved to areas such as Ulu Tiram where supply can be secured sooner. "
  "New treatment capacity for Kulai and Sedenak is being built at Semanggar, rated at 50 million "
  "litres a day.",

  "Underneath the technical criteria is a question the state has not settled in public: when the "
  "reservoirs are low, whether the households or the data centres have the prior claim on Johor's "
  "water."
 ],
 "sources": [
  "https://www.scmp.com/week-asia/health-environment/article/3333109/data-centres-malaysias-johor-told-wait-water-until-mid-2027",
  "https://www.asianews.it/news-en/Johor-State-halts-development-of-water-based-data-centres-until-2027-64302.html",
  "https://w.media/johor-stops-approving-tier-1-and-tier-2-data-centers-due-to-water-overuse/",
  "https://w.media/special-report-how-johor-deals-with-thirsty-data-centers/",
  "https://www.malaymail.com/news/malaysia/2026/01/05/how-johor-vets-data-centres-water-efficiency-utilities-and-location/204328",
  "https://thesun.my/news/malaysia-news/johor-data-centre-projects-face-rigorous-water-and-power-assessments/",
  "https://thediplomat.com/2026/04/whose-water-powers-the-cloud-data-centers-and-the-right-to-water-in-johor/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
