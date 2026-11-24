# -*- coding: utf-8 -*-
"""Batch sixteen: Allegheny County PA, Wisconsin, Washtenaw County MI, Newton County GA."""
import io, json, os

R = {

"/data-centers/united-states/pennsylvania/allegheny-county/": {
 "paragraphs": [
  "Western Pennsylvania is being pitched as the next data center region and Allegheny County has "
  "been noticeably slower to agree than its neighbours. Pittsburgh and the county have both been "
  "reported as proceeding with caution while proposals move ahead elsewhere: a project at "
  "Springdale here has cleared some approvals but still needs more, as have sites at Shippingport "
  "in Beaver County and Upper Burrell in Westmoreland County.",

  "The caution is informed. Local coverage has treated Virginia explicitly as both the roadmap and "
  "the warning, on the reasoning that the tax revenue and the transmission build-out arrive "
  "together, and the second one is permanent.",

  "The regional project that has drawn the hardest opposition is outside the county. The $10 "
  "billion Homer City redevelopment in Indiana County, a former coal plant site being rebuilt as a "
  "gas-fired data center campus, began construction this year and will burn enough natural gas to "
  "power more than half the homes in Pennsylvania. The Clean Air Council, PennFuture and the "
  "Sierra Club are appealing the state air permit, arguing the regulators did not engage properly "
  "with the surrounding community and accepted flawed emissions methodology, and they have turned "
  "to crowdfunding to pay for the challenge.",

  "That case matters here because the electricity and the air do not stop at the county line. What "
  "gets decided at Homer City sets the terms for every gas-fired campus proposed across the "
  "western half of the state, including the ones inside Allegheny County."
 ],
 "sources": [
  "https://www.monvalleyindependent.com/2026/08/03/wary-of-data-center-boom-pittsburgh-and-allegheny-county-proceed-with-caution/",
  "https://www.monvalleyindependent.com/2026/08/03/data-center-industry-expands-hopes-in-western-pa-but-its-future-remains-uncertain/",
  "https://community.triblive.com/news/4012986",
  "https://www.wesanews.org/environment-energy/2026-07-21/pennsylvania-environmental-homer-city-data-center",
  "https://www.alleghenyfront.org/pennsylvania-homer-city-power-plant-data-center/",
  "https://www.axios.com/local/pittsburgh/2026/03/31/homer-city-power-plant-grid-data-centers-pennsylvania"
 ]
},

"/data-centers/united-states/wisconsin/": {
 "paragraphs": [
  "Three buildings are about to reshape Wisconsin's electricity system: Microsoft's campus at "
  "Mount Pleasant, Oracle's at Port Washington and Meta's at Beaver Dam. State forecasting puts "
  "peak demand up 40 per cent by 2032, and those three sites account for close to three quarters "
  "of the increase. Mount Pleasant and Port Washington on their own could double We Energies' "
  "load by 2030.",

  "How they got here is a small story with large consequences. The Mount Pleasant and Port "
  "Washington projects came together after a We Energies executive met a co-founder of Cloverleaf "
  "Infrastructure at a conference in Chicago in 2021.",

  "The argument now is over who pays for the capacity. Opponents have told the Public Service "
  "Commission that the rate structure Alliant Energy proposed does not protect ordinary ratepayers "
  "from carrying part of the cost, and have raised the same objection to We Energies' proposed "
  "data center rates for Mount Pleasant and Port Washington. In August 2026 the commission sent "
  "American Transmission Company back to the start of its application to connect the Port "
  "Washington site.",

  "Water has turned out to be the smaller problem in at least one of these cases. Racine Water "
  "Works, which supplies Mount Pleasant, has capacity more than 250 times what the Microsoft site "
  "is expected to use once it is fully operational, which is not true of the equivalent projects "
  "in Arizona or Georgia and is worth saying plainly.",

  "Local government has not waited for the state. At least 24 Wisconsin communities have adopted "
  "moratoriums, typically running a year, and in February 2026 Democratic legislators proposed a "
  "statewide pause on new construction. Energy and data centers are now expected to be a fixture "
  "of the state's campaigns."
 ],
 "sources": [
  "https://wisconsinwatch.org/2026/04/latest-wisconsin-data-center-news-you-might-have-missed/",
  "https://www.wxpr.org/energy-environment/2026-07-14/draft-report-shows-data-centers-could-dramatically-increase-electric-demand-in-wisconsin",
  "https://wispolicyforum.org/research/data-centers-may-change-wisconsins-utility-landscape/",
  "https://wisconsinwatch.org/2026/08/wisconsin-psc-regulators-data-center-connection-project-atc-back-to-drawing-board-port-washington/",
  "https://wisconsinexaminer.com/2026/02/12/democratic-lawmakers-propose-data-center-moratorium/",
  "https://wausaupilotandreview.com/2026/06/01/what-is-up-with-all-these-data-centers-a-wisconsin-guide/",
  "https://dailyreporter.com/2026/04/09/wisconsin-data-center-boom-water-energy-demand/",
  "https://wnanews.com/2026/07/07/youll-be-hearing-a-lot-about-data-centers-and-energy-from-the-campaign-trail/"
 ]
},

"/data-centers/united-states/michigan/washtenaw-county/": {
 "paragraphs": [
  "Saline Township said no and then had to say yes. The township board voted to deny the rezoning "
  "needed for a large data center campus; the developer Related Digital and the landowners sued, "
  "alleging the refusal amounted to exclusionary zoning barred by the Michigan constitution; and "
  "the township settled by consent judgment filed on October 15 in Washtenaw County Circuit Court, "
  "allowing a $7 billion Oracle and OpenAI project to proceed. A trustee described the settlement "
  "as the lesser of two evils.",

  "What the township extracted for that is unusually specific. The consent judgment bars the "
  "operator from expanding the data center, sets a noise limit, prohibits solar farms on the site, "
  "and commits it not to use water-intensive evaporative cooling. The developer pays $2 million to "
  "the township for farmland preservation and another $2 million into a community investment fund, "
  "the Saline Area Fire Department receives $7 million, and the Clinton Township and Manchester "
  "fire departments receive $500,000 each. The project's local tax break came in nine times "
  "smaller than the developer had asked for.",

  "Not everyone in the township accepted the deal. A resident moved to intervene, arguing the "
  "trustees had entered the consent judgment in secret in breach of Michigan's Open Meetings Act. "
  "In February 2026 a Washtenaw County judge denied the motion, and separately refused a request "
  "to slow construction while the challenge was heard. The township has publicly defended the "
  "decision.",

  "The lesson other Michigan boards have drawn from this is the reason more than twenty of them "
  "have adopted moratoriums: a straight refusal can be litigated into a settlement, and the terms "
  "of that settlement are better negotiated before the vote than after it."
 ],
 "sources": [
  "https://planetdetroit.org/2025/10/saline-data-center-settlement/",
  "https://www.datacenterdynamics.com/en/news/township-in-michigan-settles-lawsuit-allows-data-center-project-to-proceed/",
  "https://thesuntimesnews.com/saline-township-settles-lawsuit-as-data-center-project-moves-forward/",
  "https://planetdetroit.org/2026/02/judge-denies-data-center-intervention/",
  "https://www.wemu.org/wemu-news/2026-02-20/lawsuit-aimed-at-stopping-saline-township-data-center-rejected-by-washtenaw-county-judge",
  "https://www.detroitnews.com/story/news/local/michigan/2026/02/20/judge-denies-request-to-slow-construction-of-oracle-openai-chatgpt-data-center-saline-michigan/88759349007/",
  "https://bridgemi.com/business-watch/massive-data-center-wins-local-tax-break-but-9-times-smaller-than-requested/"
 ]
},

"/data-centers/united-states/georgia/newton-county/": {
 "paragraphs": [
  "Newton County's problem is that its rules stop at the city limits. The county runs an overlay "
  "governing where data centers may go, but Covington, Social Circle and Porterdale are not bound "
  "by it, so developers have been buying land at the edges and asking the cities to annex it. The "
  "county's zoning is intact and largely beside the point.",

  "The response has been a series of short pauses. In February 2026 the county commission "
  "unanimously adopted a 30-day moratorium on data center applications, alongside one on "
  "convenience stores. Covington had gone first, enacting a 180-day moratorium at its council "
  "meeting on January 20.",

  "Social Circle shows what a moratorium is actually for. The city adopted a 90-day pause in 2025 "
  "which contained a clause ending it automatically once the city had data center rules in place. "
  "Two unanimous votes, on amendments to the development code covering data centers and on the "
  "special-use permitting procedure, triggered that clause, and the moratorium lapsed because it "
  "had done its job rather than because it expired.",

  "The same argument is running across the state. DeKalb County has extended its own moratorium as "
  "the backlash has spread through Georgia, and the annexation route Newton County is dealing with "
  "is the one developers are using elsewhere too."
 ],
 "sources": [
  "https://www.covnews.com/news/county/newton-county-enacts-moratoriums-data-centers-convenience-stores/",
  "https://www.rockdalenewtoncitizen.com/news/newton-county-puts-moratorium-on-data-center-applications/article_9dec6ba2-6c6c-408f-afbd-d10a63f09add.html",
  "https://www.covnews.com/news/cities/social-circle-enacts-90-day-moratorium-data-centers-vote-annexations/",
  "https://www.covnews.com/news/cities/social-circle-council-lifts-moratorium-new-data-center-requests/",
  "https://news.monroelocal.org/social-circle-council-approves-data-center/",
  "https://saportareport.com/dekalb-extends-moratorium-as-data-center-backlash-grows-across-georgia/columnists/adrianne-murchison/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
