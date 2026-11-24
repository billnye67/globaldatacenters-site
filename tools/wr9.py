# -*- coding: utf-8 -*-
"""Batch nine: United States, Fairfax County VA, Fauquier County VA, Stafford County VA."""
import io, json, os

R = {

"/data-centers/united-states/": {
 "paragraphs": [
  "American data center policy changed direction in 2026. For a decade the states competed to "
  "give the industry sales tax exemptions; in the first six weeks of this year alone more than 300 "
  "data center bills were filed across upwards of thirty states, and most of them were about "
  "oversight rather than incentives. Moratorium bills were introduced in eleven states.",

  "Two states went furthest. New York's legislature passed the Responsible Data Center Development "
  "Act on June 4, imposing a one-year pause on permits for large data centers, and on July 14 "
  "Governor Kathy Hochul signed Executive Order 62, halting state permitting for anything drawing "
  "50 megawatts or more until the Department of Public Service completes an environmental review. "
  "Maine's legislature passed a construction moratorium running to November 2027; Governor Janet "
  "Mills vetoed it on April 24 and the override vote fell short of two thirds.",

  "The rest moved on money and power rather than permits. Arizona barred new applications for its "
  "data center sales tax exemption for three years from July 1. Oregon's regulators raised large "
  "data center electricity rates by 29.7 per cent under the POWER Act and cut everyone else's. "
  "California signed seven bills on September 21 shifting the cost of grid upgrades onto the "
  "operators that cause them. In Texas the governor halted grid approvals in early August, a "
  "directive reported to stop as many as 1,800 projects.",

  "Most of the actual blocking has happened below the state level. More than 75 build-outs worth "
  "around $130 billion were stopped in the first three months of 2026, another 45 projects worth "
  "$68 billion in the second quarter, and by late summer the running total of projects blocked or "
  "delayed this year had passed $190 billion. County boards, township trustees and town councils "
  "did that, mostly through annexation petitions, rezonings, water service agreements and land "
  "sales rather than through anything called a data center law.",

  "The politics behind it are not partisan. An Echelon Insights survey in June 2026 found 62 per "
  "cent of voters opposed a new data center in their own community, falling only to 58 per cent "
  "after they heard the economic case for one. Twenty-three governors of both parties have signed "
  "a White House pledge to protect utility customers from the cost of new data center "
  "development, a commitment with nothing enforceable attached to it."
 ],
 "sources": [
  "https://www.multistate.us/insider/2026/2/20/state-data-center-legislation-in-2026-tackles-energy-and-tax-issues",
  "https://goodjobsfirst.org/data-center-moratorium-bills-are-spreading-in-2026/",
  "https://www.harrisbeachmurtha.com/insights/new-york-state-legislature-passes-first-in-the-nation-data-center-moratorium/",
  "https://www.governor.ny.gov/executive-order/no-62-establishing-temporary-moratorium-data-centers-new-york-while-state-develops",
  "https://www.rockinst.org/blog/updates-on-the-cloud-more-moratoriums-on-data-centers/",
  "https://www.tomshardware.com/tech-industry/artificial-intelligence/more-than-75-data-center-build-outs-worth-usd130-billion-have-been-successfully-blocked-in-the-first-four-months-of-2026-bipartisan-opposition-mounts-nationwide-over-fears-of-soaring-power-and-water-costs",
  "https://www.tomshardware.com/tech-industry/data-centers/local-opposition-blocked-usd68-billion-worth-of-data-center-projects-in-the-second-quarter-of-2026-data-center-investments-reportedly-still-on-track-to-hit-usd32-trillion-by-2050",
  "https://gizmodo.com/nearly-200-billion-worth-of-data-center-projects-have-been-blocked-or-delayed-this-year-2000815054",
  "https://www.datacenterbans.com/",
  "https://indianacapitalchronicle.com/2026/07/23/indiana-governor-signs-trump-data-center-ratepayer-protection-pledge/"
 ]
},

"/data-centers/united-states/virginia/fairfax-county/": {
 "paragraphs": [
  "Fairfax County wrote its data center rules before most of Northern Virginia did. On September "
  "10, 2024 the Board of Supervisors adopted a zoning ordinance amendment by 8-2, effective the "
  "next day, tightening where a data center can go in the county and what it has to meet to get "
  "there. It was among the first serious attempts in the region to treat these buildings as a "
  "distinct land use rather than ordinary industrial development.",

  "The rules have not ended the arguments, they have relocated them. On August 27, 2026 the "
  "Fairfax County Federation of Citizens Associations voted to oppose the Plaza 500 proposal, a "
  "34-acre data center campus at 6295 and 6299 Edsall Road put forward by Starwood, along with the "
  "electrical substation that would serve it. The campus would replace a 35-foot brick and glass "
  "building and a tree-lined parking lot, and the objections have centred on noise and light "
  "rather than on water.",

  "The opposition to that substation runs across jurisdictions and across offices. Representative "
  "Don Beyer, Mason District Supervisor Andres Jimenez, Alexandria Mayor Alyia Gaskins and the "
  "Alexandria City Council, State Senator Elizabeth Bennett-Parker, House Majority Leader "
  "Charniele Herring and Delegate Vivian Watts have all come out against it, which is an unusual "
  "alignment for an infrastructure application in this part of Virginia.",

  "The county board has continued to weigh further regulation, and the reaction it is getting from "
  "residents is genuinely split rather than uniformly hostile. What the Fairfax case establishes "
  "is that adopting an ordinance is the beginning of the fight rather than the end of it: the "
  "arguments here are now about individual sites and about the substations behind them."
 ],
 "sources": [
  "https://www.fairfaxcounty.gov/planning-development/data-centers",
  "https://www.datacenterfrontier.com/site-selection/article/55139905/northern-virginias-fairfax-county-tightens-data-center-rules",
  "https://www.ffxnow.com/2026/08/31/fairfax-county-civic-group-votes-to-oppose-plaza-500-data-center-substation/",
  "https://www.fox5dc.com/news/fairfax-county-leaders-consider-data-center-regulations-amid-mixed-community-reactions",
  "https://www.sierraclub.org/virginia/great-falls/data-centers-policies",
  "https://www.nvdaily.com/nvdaily/virginia-localities-can-say-no-to-data-centers-the-law-decides-how/article_a3b49985-1a3a-537f-8dde-13276f16c7e6.html"
 ]
},

"/data-centers/united-states/virginia/fauquier-county/": {
 "paragraphs": [
  "Warrenton is where voters removed a council for approving a data center. On February 14, 2023, "
  "after months of public opposition, the town council voted 4-3 to grant Amazon a special use "
  "permit for a 220,000 square foot data center on a 42-acre site on Blackwell Road, beside "
  "Country Chevrolet. In November 2024 every council member who had voted yes was voted out, and "
  "the council that replaced them is made up entirely of opponents of the project.",

  "The permit has been in court almost since it was issued. Citizens for Fauquier County and ten "
  "individual plaintiffs filed suit in Fauquier County Circuit Court in March 2023 to overturn the "
  "approval, and in June 2026, after more than three years, both sides finally presented oral "
  "argument. The town's own attorney told the court that Warrenton no longer shares Amazon's "
  "litigation alignment and that the council's position on data centers has changed considerably "
  "since the vote being challenged.",

  "That is an unusual posture for a defendant: the town is nominally defending a permit its "
  "current elected officials would not have granted. The same group has separately challenged a "
  "town official's rejection of its administrative appeal.",

  "The fight is part of a wider one across the Piedmont, where the Piedmont Environmental Council "
  "and local groups have been contesting data center proposals from Fauquier through Prince "
  "William and Loudoun, and where the argument has been about rural character and viewsheds as "
  "much as about power and water."
 ],
 "sources": [
  "https://www.rappnews.com/land-use/judge-hears-arguments-in-lawsuit-seeking-to-halt-amazon-data-center-in-warrenton-9e942284",
  "https://www.fauquiernow.com/news/business/opposition-groups-slam-amazons-site-plan-for-warrenton-data-center/article_de2b41a4-048f-11ee-b6b4-f7c9104c4109.html",
  "https://www.fauquiernow.com/news/citizens-for-fauquier-county-nonprofit-challenges-warrenton-officials-rejection-of-amazon-data-center-appeal/article_f660549e-1d1b-11ef-a005-6be6bf81b1ee.html",
  "https://www.citizensforfauquier.org/data-centers-overview",
  "https://www.datacenterdynamics.com/en/news/residents-call-for-warrenton-to-reject-giant-amazon-data-center/",
  "https://wjla.com/news/local/fights-over-data-centers-northern-virginia-communities-robert-duvall-fairfax-loudoun-prince-william-fauquier-county-dmv-technology-digital-gateway-youngkin"
 ]
},

"/data-centers/united-states/virginia/stafford-county/": {
 "paragraphs": [
  "Stafford County has sixteen data center projects in its pipeline and has stopped receiving new "
  "ones. At a Board of Supervisors work session on June 23, 2026 the board was told that five are "
  "approved, three of those under construction, and eleven are still under review, and that no new "
  "application had come in since September 2025, when the county adopted a stricter ordinance and "
  "amended its comprehensive plan.",

  "That leaves the board with a problem it has said out loud. Supervisors and staff acknowledged "
  "the concerns residents have raised about the speed of the growth, the noise and the power "
  "demand, while county leaders said stopping the eleven applications part-way through review "
  "would not be legally defensible. The county has instead discussed hiring an outside consultant "
  "for independent expert advice and building public dashboards so residents can see what is "
  "pending without filing a records request.",

  "Approvals have continued through it. The planning commission backed a 590,000 square foot "
  "complex, and the supervisors approved the Stafford Technology Center.",

  "New state law changes the terms from July 1, 2026. Virginia's House Bill 153 requires a "
  "mandatory sound profile assessment for any facility of 100 megawatts or more sited near homes "
  "or schools, along with details of the utility substation serving it, which means Stafford has "
  "to update its zoning ordinance again to take the new requirements in.",

  "Meanwhile the county is running public meetings on the comprehensive plan update itself, which "
  "is the document that decides where the next sixteen applications would be allowed to go."
 ],
 "sources": [
  "https://www.potomaclocal.com/2026/07/02/stafford-county-processes-11-data-center-applications-as-state-budget-fight-looms-over-industry-incentives/",
  "https://www.potomaclocal.com/2026/06/15/stafford-county-to-hold-public-meetings-on-comprehensive-plan-update-amid-data-center-proposals/",
  "https://staffordcountyva.gov/government/departments_p-z/planning_and_zoning/data_centers/index.php",
  "https://wjla.com/news/local/stafford-county-virginia-planning-commission-greenlights-another-data-center-properties-taxes-homeowners-communities-neighborhoods",
  "https://www.fxbgadvance.com/p/stafford-supervisors-approve-stafford",
  "https://www.thecentersquare.com/virginia/article_0197a013-ec97-4cdf-a453-c821b507b7d2.html",
  "https://virginiabusiness.com/stafford-county-data-center-boom-public-backlash/"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
