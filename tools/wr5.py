# -*- coding: utf-8 -*-
"""Batch five: Indiana, North Carolina, Missouri, England, Michigan, Oregon, Iowa."""
import io, json, os

R = {

"/data-centers/united-states/indiana/": {
 "paragraphs": [
  "Roughly a third of Indiana's 92 counties have moved to restrict data centers. Indiana "
  "University's Environmental Resilience Institute counted eleven counties with a data center "
  "ordinance on the books by the middle of 2026, at least seventeen more running a temporary "
  "moratorium, and two, Marshall and Cass, that have banned new data centers outright.",

  "The largest of those pauses covers the state's biggest city. On August 10, 2026 the "
  "Indianapolis City-County Council voted 23-1 to bar new data center construction anywhere in "
  "Marion County through the end of 2027, making binding a temporary moratorium the Metropolitan "
  "Development Commission had approved weeks earlier while the city writes permanent rules.",

  "Boone County's commissioners had gone first, unanimously adopting a one-year moratorium on "
  "June 15, 2026 covering the unincorporated county and running to June 15, 2027. In January the "
  "Clinton County commissioners rejected a rezoning that would have put a 715-acre data center "
  "near Frankfort.",

  "The General Assembly has done far less than the counties. Nearly a dozen data center bills were "
  "filed in the 2026 session and almost none advanced. House Bill 1245, from Representative Robin "
  "Shackleford, would only have had the Indiana Utility Regulatory Commission study what data "
  "center demand does to the state's electricity supply; it never got past first reading. Senate "
  "Bill 257, which would have barred the commission from approving a rate increase attributable "
  "solely to serving a data center or another high-demand facility employing fewer than fifty "
  "people full time, did not become law either.",

  "What did pass was narrower. House Bill 1210 was enacted with a provision requiring a data "
  "center to share one per cent of the savings on its total electricity bill in order to qualify "
  "for certain sales tax breaks. In July 2026 Governor Mike Braun joined 22 other governors in "
  "signing the White House pledge on protecting utility customers from the cost of new data center "
  "development, a commitment with no statutory force behind it."
 ],
 "sources": [
  "https://www.wfyi.org/statewide/2026-07-06/indiana-counties-data-center-moratoriums-bans-2026",
  "https://www.wfyi.org/wfyi-news/2026-07-13/data-center-moratorium-advances-for-indianapolis",
  "https://fox59.com/news/metropolitan-development-commission-unanimously-approves-data-center-moratorium/",
  "https://mirrorindy.org/indianapolis-data-centers-regulations-moratorium/",
  "https://boonecounty.in.gov/2026/06/15/19190/",
  "https://www.wfyi.org/wfyi-news/2026-03-02/data-center-legislation-indiana-general-assembly-2026",
  "https://iga.in.gov/legislative/2026/bills/senate/257",
  "https://indianacapitalchronicle.com/2026/07/23/indiana-governor-signs-trump-data-center-ratepayer-protection-pledge/",
  "https://www.citact.org/news/2026-ai-data-center-bill-watch-list"
 ]
},

"/data-centers/united-states/north-carolina/": {
 "paragraphs": [
  "North Carolina has 100 counties and, by the count kept by the NC Data Center Newsletter, at "
  "least 29 counties or municipalities have now passed a data center moratorium. Apex, Chatham "
  "County, Gates County and the town of Canton in Haywood County all adopted twelve-month pauses "
  "within months of each other. Harnett County and Spring Hope, in Nash County, took a year. "
  "Northampton County went to 32 months.",

  "The objections repeat from place to place: water use, electricity demand, air pollution from "
  "backup generation, and the continuous industrial noise and vibration a running facility "
  "produces. The politics have moved with them, to the point that data center opposition is now a "
  "live issue in state races.",

  "The General Assembly has two bills in play. House Bill 1189, the Datacenter Transparency Act, "
  "would impose a two-year statewide moratorium on data center permits, in its own words to give "
  "lawmakers time to evaluate the extent and scope of the impacts from what has been proposed. It "
  "has bipartisan support and has advanced to the House floor. Separately the House has passed a "
  "Ratepayer Protection Act, awaiting the Senate, that would make developers cover the upfront "
  "cost of grid expansion, transmission upgrades and new generation built to serve them; the same "
  "measure fast-tracks nuclear development for Duke Energy.",

  "Developers have begun to withdraw rather than wait. One North Carolina proposal was pulled "
  "while county officials were still deciding whether to adopt a moratorium, and in August 2026 a "
  "developer backed away from a Raleigh project as three more localities weighed pauses of their "
  "own. In another county the fight has gone to court over Project Delta.",

  "Tax policy is the other front. Rural counties were promised revenue in exchange for the "
  "state's data center sales tax exemption, and bills now filed would change the tax treatment and "
  "add consumer protections after those promises ran into resistance in the places expected to "
  "host the buildings."
 ],
 "sources": [
  "https://ncnewsline.com/2026/08/17/three-more-nc-localities-weigh-pauses-on-data-centers-as-developer-backs-away-from-raleigh-project/",
  "https://journalnow.com/news/state-regional/government-politics/article_9a6c89bd-a7cb-404e-90e8-f9eec3e58782.html",
  "https://www.wral.com/news/nccapitol/data-center-nuclear-plant-duke-energy-price-bill-nc-june-2026/",
  "https://ncnewsline.com/2026/05/08/nc-bills-target-data-center-boom-seeking-tax-changes-consumer-protections/",
  "https://www.vpm.org/news/2026-05-05/wunc-data-center-opposition-political-challenges-north-carolina",
  "https://www.datacenterdynamics.com/en/news/north-carolina-ai-data-center-proposal-withdrawn-as-county-officials-mull-moratorium/",
  "https://www.northcarolinahealthnews.org/2026/03/25/nc-communities-push-back-ai-data-centers-project-delta-lawsuit/",
  "https://www.eenews.net/articles/the-data-center-boom-and-its-tax-promises-run-into-rural-resistance-in-north-carolina/"
 ]
},

"/data-centers/united-states/missouri/": {
 "paragraphs": [
  "Missouri's legislature passed about a hundred bills in its 2026 session and not one of them was "
  "about data centers. The rules that now govern the industry in this state came from the Public "
  "Service Commission instead, which approved a large-load tariff submitted by Ameren Missouri "
  "requiring data centers and other very large customers to pay higher rates than existing "
  "industrial users, with terms intended to keep the cost of connecting them off everyone else's "
  "bill.",

  "Whether that works is already being argued. Ameren filed a rate case in June seeking roughly "
  "$343 million in additional annual electric base-rate revenue, about a ten per cent increase, or "
  "some $13 a month and $156 a year for a typical residential customer. On September 14, 2026 "
  "State Representative Brad Christ, a Republican from St. Louis County, filed formal comments "
  "asking the commission to reject the increase and to investigate whether data center growth is "
  "what is driving it.",

  "The Consumers Council of Missouri has pressed the same point from the other direction, arguing "
  "that the scale of new demand being signed up outruns the protections in the tariff and that "
  "water use has not been addressed at all.",

  "Residents have kept the pressure on locally while the state has been quiet, and the House is "
  "due to hold its first public hearing on data centers in months. Legislators expect the subject "
  "back in force next session."
 ],
 "sources": [
  "https://www.ksdk.com/article/news/local/missouri-new-data-center-rules-shielding-residents-from-infrastructure-and-power-costs/63-fae42629-d6c5-449d-a5c1-30bd77474039",
  "https://www.kfvs12.com/2026/09/16/will-data-centers-drive-up-your-electric-bill-missouri-lawmaker-asks-state-regulators-step/",
  "https://www.kcur.org/housing-development-section/2026-07-01/missouri-data-center-rules-water-energy-legislature",
  "https://moconsumers.org/utilities/data-centers-our-concerns/",
  "https://www.komu.com/news/midmissourinews/missouri-leadership-pushes-data-center-development-despite-electricity-environmental-fears/article_73d1d49a-b2d2-4d9d-8187-0e891f613f52.html",
  "https://missouridatacenters.org/"
 ]
},

"/data-centers/united-kingdom/england/": {
 "paragraphs": [
  "England changed the planning rules in favour of data centres in December 2024 and has spent the "
  "time since finding out what that means. The revised National Planning Policy Framework requires "
  "councils to plan for data centres when setting local policy and deciding applications, and the "
  "same revision created the grey belt, a classification that lifts some previously protected "
  "green belt land out of the strictest restrictions.",

  "The courts have started pulling in the other direction. On January 23, 2026 the government "
  "conceded in the High Court that it had made a material legal error in granting permission for a "
  "one billion pound data centre complex at Iver in Buckinghamshire, a 72,000 square metre scheme "
  "on a former landfill inside the green belt, by not requiring a full environmental impact "
  "assessment. The judicial review was brought by the campaign groups Foxglove and Global Action "
  "Plan, who had also mounted the country's first legal challenge to a granted data centre "
  "consent, over a site at Woodlands Park in Buckinghamshire allowed on appeal in April 2025.",

  "That concession matters beyond one site. Planning lawyers reading it have concluded that carbon "
  "and water are no longer secondary considerations in an English data centre application, and "
  "that an EIA screening opinion which treats them lightly is now a route to having the permission "
  "quashed.",

  "The fights have moved to London's edge. Campaigners in Havering demonstrated in March 2026 "
  "against a green belt scheme backed by the Mayor of London, arguing the site is the wrong place "
  "for a development of that size, and opposition is mounting to another large green belt data "
  "centre being taken through the Nationally Significant Infrastructure Projects regime, which "
  "decides the application nationally rather than at the council."
 ],
 "sources": [
  "https://www.theregister.com/2026/01/23/uk_gov_dc/",
  "https://www.stevens-bolton.com/insights/102meck/government-admits-legal-error-over-green-belt-data-centre-implications-for-the/",
  "https://commonslibrary.parliament.uk/research-briefings/cbp-10315/",
  "https://www.burges-salmon.com/our-thinking/data-centres-is-there-still-a-green-light-for-new-proposals/",
  "https://www.pwaplanning.co.uk/news-and-insights/opinion/planning-for-data-centres-in-2026-whats-changed-and-what-will-matter-most/",
  "https://www.planningresource.co.uk/article/1967773/opposition-mounts-plan-huge-data-centre-green-belt-will-determined-nsip-regime",
  "https://eastlondontimes.co.uk/local/havering/sadiq-khan-data-centre-plan-sparks-havering-green-belt-row-2026/"
 ]
},

"/data-centers/united-states/michigan/": {
 "paragraphs": [
  "More Michigan communities have paused data centers than in any other state. Bridge Michigan "
  "counted at least nineteen townships and cities with a local moratorium in force and the number "
  "has kept climbing past twenty, among them Meridian Township, Washington Township in Macomb "
  "County, and the City of Flint, which took a one-year pause on June 8, 2026. In March 2026 "
  "Detroit's City Council voted 6-2 for a resolution asking Mayor Mary Sheffield to impose a "
  "two-year moratorium on data center permits in the city.",

  "Nobody is certain the pauses hold. That doubt has a name in Michigan: Saline Township's board "
  "voted to deny the rezoning of 575 acres needed for a large campus, the landowners and the "
  "developer Related Digital sued days later arguing the refusal was exclusionary zoning barred by "
  "the state constitution, and the township settled, allowing the project to go ahead after all.",

  "The projects have not slowed. DTE Energy and Google have announced a one-gigawatt development, "
  "reported as Project Cannoli, in Van Buren Township, on a scale that puts it among the largest "
  "anywhere in the Midwest.",

  "Governor Gretchen Whitmer put out a data center plan in July 2026 that calls for legislation "
  "and asks companies for voluntary commitments rather than imposing conditions. In the "
  "legislature, bills for a statewide moratorium and for accountability rules have been introduced "
  "and are being carried into the midterm campaigns; the lawmaker behind the moratorium bills "
  "argues they simply reflect what constituents are already telling local boards.",

  "That sentiment turned out in the street in April 2026, when anti-data center rallies were held "
  "the same Saturday in Detroit and Ann Arbor."
 ],
 "sources": [
  "https://bridgemi.com/michigan-environment-watch/at-least-19-michigan-towns-pause-data-centers-no-one-knows-if-itll-work/",
  "https://planetdetroit.org/2026/03/detroit-data-center-moratorium/",
  "https://www.wkar.org/wkar-news/2026-02-27/michigan-data-center-tracker-moratoria-legislation-and-grid-impact",
  "https://www.michiganpublic.org/politics-government/2026-05-20/why-one-michigan-township-just-rejected-data-centers-while-another-stays-open-to-them",
  "https://planetdetroit.org/2026/07/whitmer-data-center-pledge/",
  "https://planetdetroit.org/2026/06/michigan-data-center-regulation-election/",
  "https://planetdetroit.org/2026/03/lawmakers-propose-michigan-data-center-moratorium/",
  "https://planetdetroit.org/2026/04/michigan-anti-data-center-rallies/"
 ]
},

"/data-centers/united-states/oregon/": {
 "paragraphs": [
  "Oregon wrote the first law in the country making data centers pay for the grid they need. The "
  "POWER Act, House Bill 3546, passed in 2025 and creates a separate class of customer so that "
  "when a data center's demand forces a utility into costly investment, the bill for it does not "
  "go to everyone else.",

  "On July 7, 2026 the Public Utility Commission put numbers on it, approving a 29.7 per cent rate "
  "increase for large data centers served by Portland General Electric. Everybody else's rates "
  "went the other way in the same order: residential customers down an average of 1.3 per cent, "
  "commercial 2.1 per cent and industrial 1.4 per cent. It is the clearest demonstration so far "
  "that the cost of serving these buildings had been sitting on other people's bills.",

  "The 2026 session added a pause of its own, suspending new data center authorizations in "
  "enterprise zones until the legislature returns in 2027. Enterprise zone deals are how most "
  "Oregon data centers got their property tax abatements, so the pause reaches the money rather "
  "than the planning permission.",

  "The rest is still being worked out by the Governor's Data Center Advisory Committee, which is "
  "taking evidence on power, water and land use before the state decides what comes after the "
  "POWER Act. The committee heard from Umatilla Electric Cooperative, the Hermiston-based utility "
  "serving parts of Umatilla, Morrow and Union counties, which hosts the densest concentration of "
  "data centers in the state and has had to manage that growth as a consumer-owned utility whose "
  "members are also its ratepayers."
 ],
 "sources": [
  "https://www.wweek.com/news/business/2026/07/07/oregon-regulators-approve-rate-hike-for-data-centers/",
  "https://www.opb.org/article/2026/05/12/portland-general-electric-oregon-power-data-centers/",
  "https://www.climatesolutions.org/article/2026-05/oregons-power-act-first-its-kind-protect-oregonians-utility-bills-data-center",
  "https://oeconline.org/pge-guardrails-press-release/",
  "https://www.columbiariverkeeper.org/2026/implementing-oregons-power-act-victory/",
  "https://www.oregon.gov/energy/get-involved/Documents/2026-06-26-DCAC-Facilitator-Meeting-Summary.pdf",
  "https://www.grantspasstribune.com/oregon-data-center-debate-moves-toward-statewide-decisions-on-power-water-and-development/"
 ]
},

"/data-centers/united-states/iowa/": {
 "paragraphs": [
  "At least eight Iowa counties were running data center moratoriums by July 2026, and the reason "
  "given in most of them is the same: the county found out about a project late and wanted time to "
  "write rules before the first application landed.",

  "Woodbury County is the sharpest example. The board of supervisors approved a one-year "
  "moratorium on June 23, 2026 covering unincorporated parts of the county, after the town of "
  "Salix annexed about 900 acres of farmland in April. MidAmerican Energy confirmed the site was "
  "being considered for a data center but said it was still looking for a customer to buy the land "
  "and build. State Senator Kevin Alons, a Republican who lives in Salix, told the supervisors "
  "there had been a lack of transparency and that MidAmerican had avoided giving out the size or "
  "scope of what was planned.",

  "Linn County shows what comes after a pause. It adopted a temporary moratorium for the "
  "unincorporated county and then used the time to write an ordinance requiring a large data "
  "center to complete a water study proving the supply exists, to sign a water use agreement with "
  "the county that includes tracking and reporting actual consumption, and to sign an economic "
  "development agreement setting out what the community gets. Dubuque County approved a "
  "twelve-month moratorium on May 26, 2026.",

  "At the statehouse a bill introduced in February would have required data centers to report "
  "their water and energy use, which in Iowa is still not public information."
 ],
 "sources": [
  "https://kscj.com/2026/07/08/eight-iowa-counties-have-moratoriums-on-data-center-development/",
  "https://www.iowapublicradio.org/ipr-news/2026-06-24/woodbury-county-approves-1-year-moratorium-data-centers",
  "https://www.iowapublicradio.org/ipr-news/2026-06-17/potential-data-center-sparks-moratorium-push-in-northwest-iowa",
  "https://www.linncountyiowa.gov/CivicAlerts.aspx?AID=4487",
  "https://www.linncountyiowa.gov/1862/Data-Centers-in-Unincorporated-Linn-Coun",
  "https://www.kcrg.com/2026/05/26/dubuque-county-passes-12-month-moratorium-data-centers/",
  "https://www.axios.com/local/des-moines/2026/02/19/iowa-lawmakers-push-data-center-transparency"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
