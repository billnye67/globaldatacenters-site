# -*- coding: utf-8 -*-
"""Batch fourteen: Spotsylvania County VA, Netherlands, Chile, County Dublin."""
import io, json, os

R = {

"/data-centers/united-states/virginia/spotsylvania-county/": {
 "paragraphs": [
  "Spotsylvania took roughly $35 billion of data center investment and then spent 2026 trying to "
  "slow it down. On February 25 the Board of Supervisors voted 4-3 to require a special use permit "
  "for any data center, removing by-right development in every office, commercial and industrial "
  "district in the county. Chancellor District Supervisor Gerald Childress argued against it on "
  "the grounds that it would put developers off.",

  "In August the board went further than its own boundaries. On the 13th it voted 4-2 to adopt a "
  "resolution calling on Governor Abigail Spanberger to impose a statewide moratorium on data "
  "center development so that the Commonwealth could work out whether it should keep permitting "
  "them at all and, if so, on what terms. Drew Mullins of the Courtland District and Deborah "
  "Frazier of the Salem District voted no.",

  "Then on the 26th the supervisors voted 3-2 to amend the comprehensive plan so that no more than "
  "45 per cent of the county's industrially zoned land may be given over to data centers, which is "
  "a harder limit than a permit requirement because it caps the total rather than reviewing them "
  "one at a time.",

  "Some restrictions were already in place. Spotsylvania does not allow a data center to cool its "
  "equipment with drinking water or to sink its own wells, and it requires natural buffers against "
  "noise.",

  "What is happening here is happening county by county across the state. Virginia has no "
  "statewide pause, so what it has instead is a piecemeal one, assembled out of individual "
  "board votes in places that had already said yes and are now working out what they agreed to."
 ],
 "sources": [
  "http://www.fredericksburgfreepress.com/2026/02/25/spotsylvania-board-of-supervisors-vote-to-require-sup-for-data-centers-set-advertised-tax-rate/",
  "http://www.fredericksburgfreepress.com/2026/08/13/spotsylvania-supervisors-approve-statewide-data-center-moratorium-resolution/",
  "https://www.fredericksburgfreepress.com/2026/08/26/spotsylvania-supervisors-vote-on-limit-to-industrial-land-dedicated-to-data-centers/",
  "https://wjla.com/news/local/spotsylvania-county-backs-call-for-statewide-moratorium-on-data-centers-abigail-spanberger-ai-energy-use-zoning-decisions",
  "https://cardinalnews.org/2026/08/17/virginia-is-developing-a-piecemeal-data-center-moratorium-the-potential-impacts-are-complicated/",
  "https://www.spotsylvania.va.us/3241/Data-Center-FAQs",
  "https://www.thecooldown.com/green-tech/spotsylvania-county-virginia-vote-data-center-moratorium/"
 ]
},

"/data-centers/netherlands/": {
 "paragraphs": [
  "The Netherlands wrote the template that other governments have been copying since. On February "
  "16, 2022 the Dutch state halted new hyperscale data centres nationally while it worked out "
  "rules, with the ban applying to any site covering more than 10 hectares or requiring more than "
  "70 megawatts, and the prohibition stayed in place until national guidelines were passed.",

  "It was never a total ban, and where the exemptions fell decided where the industry went. Two "
  "areas were carved out: part of the municipality of Het Hogeland in Groningen, and the Agriport "
  "A7 and B1 locations in Hollands Kroon in Noord-Holland. Google's Groningen project and the "
  "cluster at Middenmeer proceeded because they sat inside those exemptions.",

  "Zeewolde is the case that showed a moratorium is not the only way a project dies. Meta's "
  "facility there was explicitly excluded from the ban and would have been allowed, but the Dutch "
  "Senate blocked the sale of the state-owned land Meta needed for it, and by July 2022 the "
  "company had abandoned the project.",

  "The thinking behind the policy was about where the power comes from rather than how much of it "
  "there is. Housing minister Hugo de Jonge examined confining new hyperscale sites to the coastal "
  "landing points for offshore wind, so that the largest loads sit where the generation arrives "
  "instead of drawing across the national network, which is the same principle Ireland and Japan "
  "later adopted in their own frameworks."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/dutch-government-halts-hyperscale-data-centers-pending-new-rules/",
  "https://www.dutchnews.nl/2022/02/dutch-call-a-halt-to-new-massive-data-centres-while-rules-are-worked-out/",
  "https://cms-lawnow.com/en/ealerts/2022/11/netherlands-prohibits-creating-hyperscale-data-centres-until-national-guidelines-are-passed",
  "https://www.telecompaper.com/news/dutch-govt-designates-two-areas-for-new-hyperscale-data-centres-puts-zeewolde-on-pause--1427569",
  "https://www.computerweekly.com/news/252515496/Environmental-campaigners-halt-Meta-datacentre-construction-in-the-Netherlands",
  "https://www.lexology.com/library/detail.aspx?g=860e6650-6ae7-48ca-b591-4fed6e864784"
 ]
},

"/data-centers/chile/": {
 "paragraphs": [
  "Chile is where a neighbourhood group beat a hyperscaler in court and changed the national rules "
  "doing it. Google was granted permits in 2020 for a $200 million data centre in Cerrillos, a "
  "district of Santiago. Residents organised as MOSACAT, the Movimiento Socioambiental Comunitario "
  "por el Agua y el Territorio, and challenged the environmental approval.",

  "In 2024 Chile's environmental court halted the project. The design would have drawn about 7.6 "
  "million litres of water a day from the Santiago aquifer to cool the servers, and the court "
  "found that dependence incompatible with a city water crisis that has been deepening for fifteen "
  "years. The approval was pulled rather than merely suspended.",

  "Google came back with a different building. The redesigned project abandons water cooling "
  "entirely in favour of air cooling, and adds 44 backup diesel generators, which trades a water "
  "problem for an air quality one. The company has since revived the Cerrillos scheme on that "
  "basis, and as of 2026, seven years after the first permits, nothing has been built on the site.",

  "The consequence reaches every future application in the country. As of February 2026 dry "
  "cooling is the permitting baseline in Chile, so what MOSACAT won in one district of Santiago is "
  "now the standard a developer has to meet anywhere."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/google-pauses-chilean-data-center-project-to-rethink-water-use/",
  "https://www.climatecasechart.com/document/municipality-of-cerrillos-google-data-center-v-evaluation-commission-of-the-metropolitan-region_7d3a",
  "https://cyber.harvard.edu/story/2024-02/chile-pulls-approval-giant-google-data-center",
  "https://www.business-humanrights.org/en/latest-news/chile-google-to-halt-data-centre-project-in-santiago-to-address-environmental-concerns/",
  "https://www.bnamericas.com/en/news/google-revives-us200mn-cerrillos-data-center-project-in-chile",
  "https://www.downtoearth.org.in/science-technology/we-saw-a-state-apparatus-completely-subordinated-to-corporate-interests",
  "https://entelligencia.report/chile.html"
 ]
},

"/data-centers/ireland/county-dublin/": {
 "paragraphs": [
  "Data centres use around half of all the electricity consumed in the Dublin region. That single "
  "figure is why the capital spent four years unable to connect a new one, under an effective "
  "moratorium on grid connections that EirGrid had indicated would run to 2028.",

  "It was lifted on paper in December 2025. The Commission for Regulation of Utilities published a "
  "revised Large Energy Users connection policy applying to every application made after December "
  "12, 2025, and the government followed on January 13, 2026 with the Large Energy User Action "
  "Plan, which is built around putting new data centres where the renewable generation is rather "
  "than where the demand happens to be. A data centre must now meet at least 80 per cent of its "
  "annual electricity demand from new renewable projects built in Ireland.",

  "Reopening the door has not made Dublin connectable. The new policy says that if the grid in an "
  "area cannot take a new large load without significant reinforcement works, the application is "
  "refused, and Dublin is precisely where that test bites. Demand density is high, the technical "
  "constraints on connecting new load or new synchronous generation are real, and the capacity "
  "position is expected to stay tight in the short and medium term.",

  "So the practical situation in County Dublin has barely changed, even though the rule has. The "
  "moratorium has been replaced by a test that Dublin generally fails, which moves the decision "
  "from a policy anyone can argue with to an engineering answer that is harder to appeal."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/eirgrid-says-no-new-applications-for-data-centers-in-dublin-till-2028/",
  "https://www.energyconnects.com/news/utilities/2025/december/ireland-ends-moratorium-on-new-power-links-to-data-centers/",
  "https://www.williamfry.com/knowledge/irelands-data-centre-connections-back-online/",
  "https://re24.energy/ireland-data-centre-grid-access-inside-cru-decision/",
  "https://newprojectmedia.com/analysis-irish-data-centre-experts-weigh-in-on-governments-new-data-centre-policies-encouraging-development-after-dublin-moratorium/",
  "https://kpmg.com/ie/en/insights/energy-utilities-telecoms/irelands-data-centre-policy-reset.html"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
