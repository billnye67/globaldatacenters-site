# -*- coding: utf-8 -*-
"""Raw-text recheck: Pinal County AZ, Milam County TX.

Both were written from WebFetch summaries. Re-read raw with tools/read-article.py: KJZZ, AZFamily,
PinalCentral (BLOX ROT47 obfuscation decoded, not a paywall), KXXV, Texas Tribune.

Pinal corrections:
  - "Supervisor Stephen Miller cast the only vote the other way" - no raw source names the
    dissenter. The 4-1 is confirmed by AZFamily; the name is not. Removed.
  - "around 300 people attended and more than 150 filed cards against it" and "nearly three hours
    of public testimony" - preview only. AZFamily gives five overflow rooms across three
    buildings and "several hours". Replaced with what is on the page.
  - The page read as uniformly opposed. Union members and the Avra Valley fire chief spoke FOR
    the project. That was missing and is a balance error, not just an omission.
  - Casa Grande: the claimants were Vernon Barnes and Ethington & Hwy. 84 LLC, not "Dale Willis
    and Vernon Barnes"; damages were about $140 million total, not $73,180,800 each. Ordinance
    number 3479, the B-4 district, the October 2025 date and the February 2026 A.R.S. 12-1134
    demands are all preview-only and gone.

Milam corrections:
  - "in early February 2026" - KXXV gives no date, only "this week". Removed.
  - Missing: Riot Rockdale runs the largest crypto mining facility in North America, has been
    there since 2021, and already had tax breaks for expansion. That reframes the abatement.
"""
import io, json, os

R = {

"/data-centers/united-states/arizona/pinal-county/": {
 "paragraphs": [
  "So many people came to object that Pinal County set up five overflow rooms across three "
  "separate buildings. The Board of Supervisors heard the public for several hours on August 26, "
  "2026 and then voted 4-1 against rezoning the land for the La Osa Energy Center, south of Eloy, "
  "which killed it.",

  "Vermaland had already given a great deal of ground. The original plan was 59 data center "
  "buildings drawing three gigawatts; by the vote it was eleven buildings of about 400,000 square "
  "feet each, gas-fired generation and battery storage serving a gigawatt in total, with "
  "self-imposed limits on water and an undertaking to shoulder all the energy costs. Between the "
  "May hearing and the vote the company added 22 further development conditions, including a cap "
  "of 600 acre-feet a year on fresh water use inside the buildings and at the on-site gas plant, "
  "close to 200 million gallons. It said it would consider offsetting some of that by buying "
  "effluent water, without committing to it.",

  "Robin Davis, who lives in Hidden Valley, read the retreat as a tactic. The reduction was "
  "“probably planned all along,” she said. “Ask for more than you want and settle "
  "for what you really wanted.”",

  "The water was to come from the Central Arizona Irrigation and Drainage District, whose general "
  "manager the developers said had found the Eloy sub-basin of the Pinal Active Management Area "
  "adequate for the site. Residents who live on that aquifer described something else. "
  "“Many of my neighbors' wells have gone dry and require additional depth,” said Mary "
  "Eileen Flanagan. “It currently costs about $70,000 to drill a well to 900 feet. The "
  "problem is, for many, water is at 1,200 feet.”",

  "The power did not add up in the room. Robert Clang, a Vermaland associate, said the company had "
  "secured 500 megawatts of natural gas from a broker and all the turbines it needed, and would "
  "try to find the rest from nearby solar or from the Palo Verde nuclear generating station, more "
  "than a hundred miles away. Supervisor Jeffrey McClure did not think that was available: "
  "“My understanding is that's dedicated to some other companies.”",

  "It was not a one-sided room. Union members whose people would have built the campus turned out "
  "in support, one saying simply that it was a lot of work for their members. Avra Valley Fire "
  "District chief Brian Delfs also spoke for it, arguing it would mean better response times, more "
  "firefighters, more equipment and possibly a new station on the La Osa development, built by the "
  "developer.",

  "Against that, neighbours five miles away in the Red Rock subdivision said they had not been "
  "told. “They didn't inform our HOA,” said Christine Wyman. “Our community didn't "
  "know about it until several meetings had passed.” Glenda Abercrombie put it plainly: "
  "“We're not very happy about this being in our backyard.” Eirini Pajak warned it would "
  "set a bad precedent. After the vote Wyman said it meant her house, her lungs and her neighbours "
  "were going to be safe. Attorneys for the developer declined to comment but said the company has "
  "other Arizona projects it will pursue.",

  "The most damaging account came from inside the process. Karen Mooney, a county planning and "
  "zoning commissioner, said the earlier applications had given the county incomplete information "
  "and inaccurate job and economic impact data. “Nothing was mentioned about the data center, "
  "and data centers hadn't come here yet,” she said. “So I think if they had given any "
  "bit of indication that that's what they were looking at, we might have even started drafting a "
  "code and maybe had it ready.” La Osa had been under county review since the previous "
  "September.",

  "Mark Seidel, from Florence, spoke for what residents want next, which is rules rather than "
  "another refusal. “I don't want an incomplete and hastily built and ever-changing "
  "proposal,” he said. “I don't want stipulations that are unenforceable or not "
  "enforced. I don't want promises from a lawyer or seller that have no meaning after the sale.”",

  "Casa Grande, in the north of the county, shows what happens when a city writes those rules "
  "late. Its zoning code had not addressed data centers at all. In 2025 staff proposed allowing "
  "them in industrial zones; the council instead required a conditional use permit, giving itself "
  "oversight of water, electrical demand, noise and compatibility with neighbouring uses. The "
  "owners of two adjacent properties, about 480 acres north of Peters Road between Bianco and "
  "Ethington roads on the city's far west side, then filed claims under Arizona's Proposition 207, "
  "arguing the change from a permitted to a conditional use had cut the value of their land. "
  "Vernon Barnes and Ethington & Hwy. 84 LLC put the damage at roughly $140 million.",

  "City Manager Larry Rains told the council Arizona law left it four options: repeal the "
  "ordinance, pay the compensation, deny the claim and defend it in court, or grant a "
  "property-specific waiver. Staff recommended the waiver as the route that protected taxpayers "
  "from serious financial exposure while keeping the permit requirement for everyone else. He was "
  "insistent about what was being decided. “The question before the council is not how the "
  "city should respond to a data center,” he said. “It should be focused on the specific "
  "Proposition 207 claim.”",

  "After more than two hours the council voted 7-0 for the waiver, with operational restrictions "
  "attached and the conditional use permit requirement preserved for every future proposal. Among "
  "the negotiated conditions is a cap of 800 acre-feet a year on potable water for the data center "
  "and its on-site generation, against the roughly 1,240 acre-feet Rains said the farmland "
  "currently uses for agriculture, and a prohibition on once-through cooling."
 ],
 "sources": [
  "https://www.kjzz.org/politics/2026-08-26/pinal-county-rejects-massive-la-osa-data-center-residents-want-more-rules-for-future-projects",
  "https://www.azfamily.com/2026/08/27/pinal-county-board-rejects-massive-data-center-project/",
  "https://www.pinalcentral.com/casa_grande_dispatch/cg-council-oks-waiver-for-potential-data-center-site/article_a4607a3c-4043-4d53-be3a-bf18e505cdd7.html",
  "https://www.kjzz.org/fronteras-desk/2026-05-28/largest-proposed-data-center-in-arizona-to-be-scaled-back-80-after-opposition"
 ],
 "unconfirmed": "Removed in the raw-text recheck: the name of the dissenting supervisor (AZFamily "
   "confirms 4-1, no raw source names who); attendance of about 300 and more than 150 cards filed "
   "against; 'nearly three hours' of testimony. On Casa Grande, removed because they came from a "
   "WebFetch summary of Pinal Post and are not in the PinalCentral text: an ordinance number 3479, "
   "an October 2025 adoption date, the B-4 zoning district, a claimant named Dale Willis, a figure of "
   "$73,180,800 per claim, February 2026 demands under A.R.S. 12-1134, noise limits of 60 and 55 "
   "dBA, three years of post-construction noise studies, weekday generator testing windows, a "
   "24-month and 180-day decommissioning trigger, $5 million for city recreation facilities, and "
   "quotations attributed to Mayor Fitzgibbons, Councilmember Dugan and a resident named Casey Day. "
   "Several of those are probably accurate and are further down the PinalCentral piece than the "
   "portion read; they go back on the page when that is read in full, not before. One conflict "
   "recorded: KJZZ describes a single 500-megawatt gas plant, AZFamily two gas-fired plants."
},

"/data-centers/united-states/texas/milam-county/": {
 "paragraphs": [
  "Everything in Milam County runs off one dead aluminium smelter. The old Alcoa plant at Rockdale "
  "came with a grid connection built for smelting, and that connection is what the data center "
  "industry is buying here. Riot Rockdale has operated on it since 2021 and runs the largest "
  "crypto mining facility in North America.",

  "The county commissioners voted this year to give Riot Rockdale a 75 per cent tax abatement for "
  "ten years, meaning it pays a quarter of its property taxes from 2028, through a payment in lieu "
  "of taxes arrangement. The vote was almost unanimous. The company already held tax breaks for "
  "expansion before this one.",

  "Commissioner Wesley Payne of Precinct 4 was the single vote against. “They were given the "
  "75 per cent,” he said. “I thought that was too steep. I'm not against giving an "
  "abatement entirely, depending on circumstances, but I'm against that high of an abatement on a "
  "data center.” He added that the county “should have been a little lower on the "
  "percentage to help our citizens out.”",

  "Residents were not against the data center so much as against the terms, and against the "
  "pattern. “Other communities seem to be pushing these data centers away,” said James "
  "Pesl, who lives in the county. “Our community seems to be semi-embracing them, giving them "
  "some tax breaks.” He went further on the habit: “I think that the percentage of some "
  "of these abatements are pretty extreme. This county did a slew of abatements when the solar "
  "renewable came through. We are now seeing a pattern that we're doing this for the data centers. "
  "Tax abatements can be a tool, but they can also become detrimental to the community in which "
  "you live.”",

  "Michael Reeves, a property and tax expert, noted that incentives of this kind are ordinary for "
  "businesses being persuaded to build or relocate. Riot Rockdale did not respond to requests for "
  "comment, and residents say the company has been a good neighbour.",

  "The county's other arrival is OpenAI's Stargate campus at 4299-2301 County Road 134 in "
  "Burlington, part of a $500 billion programme and due to be completed during 2026.",

  "It cost the Republican party a member. Rena Schroeder, 62, joined a high school club for "
  "conservative Latinos as a teenager, cast her first presidential vote for Ronald Reagan and had "
  "lost friends over her posts defending the party's positions. “I've always been "
  "committed,” she said. Then she learned the Stargate site was going up south of her "
  "property, championed by a president and a governor from her own party, and concluded that the "
  "party had been captured by industry lobbyists.",

  "In late March, at a Republican precinct meeting in Falls County, she proposed that a data "
  "center ban be put to the state party convention, which sets its priorities. “They started "
  "screaming and yelling, and you would have thought I started World War III,” Schroeder "
  "said. “They said, we won't accept that, Rena. You're gonna have to revise it to "
  "regulations.” She threw her hands in the air. “The only thing that I'm gonna revise, "
  "right here, right now, is my commitment to the Republican Party. Goodbye.” She is an "
  "independent now.",

  "She is not an outlier so much as an early case. The proliferation has caught Texas Republicans "
  "between a president and a governor set on making the state the next global data center hub, and "
  "constituents in the red and rural districts where most of these projects are being proposed."
 ],
 "sources": [
  "https://www.kxxv.com/news/local-news/in-your-neighborhood/milam-county/paving-the-way-for-progress-milam-county-approves-tax-abatement-for-new-data-center",
  "https://www.texastribune.org/2026/05/07/texas-republicans-data-centers-rural/",
  "https://www.datacenterdynamics.com/en/news/riot-to-convert-cryptomine-site-in-texas-to-hpc-signs-25mw-lease-with-amd/",
  "https://www.datacenterdynamics.com/en/news/bitdeer-buys-200-acres-in-milam-county-texas-to-expand-ai-and-hpc-data-center/"
 ],
 "unconfirmed": "Removed in the raw-text recheck: the abatement vote dated to early February 2026, "
   "which KXXV does not give (it says only 'this week'); and a Schroeder quotation, 'I have to fight "
   "for Texas land because if I don't, where's my daughter gonna go?', which is not in the Texas "
   "Tribune text read. Also off the page pending a raw read of their sources: Riot's 700MW "
   "interconnection and dedicated water supply, the 200 acres bought for $96 million, the AMD lease "
   "terms, the Anthropic lease, and Bitdeer's 200 acres for $100 million. Those came from SEC and DCD "
   "material fetched through WebFetch. Note on sourcing: the KXXV report carries a disclosure that it "
   "was reported on air and converted to text with the assistance of AI, with the newsroom stating it "
   "verifies all reporting for fairness and accuracy."
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
old={k:sum(len(x.split()) for x in e.get(k,{}).get('paragraphs',[])) for k in R}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-48s %4d -> %4d words, %d paras, %d sources'%(k,old[k],sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['paragraphs']),len(R[k]['sources'])))
