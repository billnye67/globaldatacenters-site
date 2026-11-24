# -*- coding: utf-8 -*-
"""Batch ten: CyrusOne, Oracle, Malaysia."""
import io, json, os

R = {

"/company/cyrusone/": {
 "paragraphs": [
  "The CyrusOne fight that mattered in 2026 was in Sangamon County, Illinois, and it turned on "
  "whether a county is allowed to say wait. The company proposed a $500 million campus of six "
  "single-storey buildings, each 250,000 square feet, on 280 acres of farmland in Talkington "
  "Township just outside Waverly, in southwest Sangamon County. The land is zoned agricultural, "
  "so the application was for a conditional permitted use rather than a rezoning.",

  "Residents asked the county for a six-month moratorium while it worked out what it thought. In "
  "February 2026 officials refused, after the Sangamon County state's attorney's office concluded "
  "the county had no authority to impose a binding pause, and sent the application on to the full "
  "county board instead. The zoning board of appeals then recommended approval unanimously.",

  "The board settled it in April, voting 23-5 to take the proposal off the table where it had been "
  "parked and then approving the conditional permitted use. Board meetings through the winter had "
  "drawn sustained criticism from residents, and the county stayed visibly split over it, but the "
  "legal advice that it could not lawfully pause was what decided the sequence.",

  "That is the pattern worth watching around this company's applications: the substantive argument "
  "about farmland, water and power often never gets had, because the procedural question of "
  "whether the local body has power to delay gets answered first."
 ],
 "sources": [
  "https://www.sangamonreporter.com/post/county-board-to-vote-on-proposed-cyrusone-data-center",
  "https://www.illinoistimes.com/news/sangamon-county-approves-data-center/",
  "https://www.illinoistimes.com/news/data-center-project-moves-forward/",
  "https://www.illinoistimes.com/news/divided-over-data-centers/",
  "https://www.illinoistimes.com/news/more-details-on-proposed-data-center/",
  "https://www.myjournalcourier.com/news/article/sangamon-county-data-center-draws-criticism-board-21329868.php",
  "https://capitolcitynow.com/news/248842-a-step-forward-for-proposed-data-center/"
 ]
},

"/company/oracle/": {
 "paragraphs": [
  "Oracle's data center programme is largely one programme: Stargate, the $500 billion four-year "
  "plan to build ten gigawatts of AI compute in the United States, funded with OpenAI, SoftBank "
  "and Abu Dhabi's MGX. Oracle oversees the flagship campus at Abilene, Texas, built on leased "
  "land with Crusoe Energy. Two buildings have been running there since September 2025 and the "
  "site is heading for 1.2 gigawatts.",

  "The expansion of it has stalled. Oracle and OpenAI ended talks on a planned 600 megawatt "
  "addition at Abilene, with reporting attributing the decision to timing rather than to "
  "opposition: power would not be available at the site for about a year, by which point OpenAI "
  "expects to be deploying Nvidia's Vera Rubin generation rather than the Blackwell GPUs going "
  "into Abilene now. Meta has been reported in talks to take up Crusoe capacity there instead.",

  "Water has been less of a flashpoint here than at other Texas sites because of how the buildings "
  "are cooled. Abilene uses direct-to-chip liquid cooling on a closed loop with no evaporative "
  "loss, and the city's mayor has said the campus would use under one per cent of Abilene's daily "
  "water, a claim from the city rather than an independent measurement.",

  "Local feeling is genuinely mixed rather than uniformly hostile. Economic support in Abilene has "
  "been broad, and an organised opposition group formed alongside it, raising grid reliability and "
  "the risk of groundwater contamination. The wider Texas argument reached the Capitol in Austin, "
  "where community groups protested against the state's data center legislation.",

  "The programme is not confined to Texas. Oracle and OpenAI are building a further Stargate site "
  "in Michigan."
 ],
 "sources": [
  "https://www.datacenterdynamics.com/en/news/oracleopenai-drop-plans-to-expand-flagship-abilene-stargate-site-meta-in-talks-to-pick-up-crusoe-capacity-with-nvidias-help/",
  "https://epoch.ai/publications/openai-stargate-where-the-us-sites-stand",
  "https://www.compute-atlas.com/facilities/stargate-abilene-tx",
  "https://www.enverus.com/blog/stargate-scales-back-openai-and-oracle-abandon-data-center-expansion/",
  "https://www.cnbc.com/2026/06/01/stargate-project-michigan-live-updates.html",
  "https://intuitionlabs.ai/articles/openai-stargate-datacenter-details"
 ]
},

"/data-centers/malaysia/": {
 "paragraphs": [
  "Malaysia has stopped approving data centres that are not for artificial intelligence. Prime "
  "Minister Anwar Ibrahim confirmed the freeze publicly on February 24, 2026, saying that non-AI "
  "projects had in practice been blocked for the previous eighteen months to two years, and giving "
  "electricity and water as the reason. He named the risk directly: that continued growth pushes "
  "tariffs up for ordinary consumers.",

  "Regulators have been careful not to use the word. Their position is that this is not a "
  "moratorium but a response to a glut, which is a distinction with real consequences for "
  "developers holding land but no approval.",

  "Almost all of it lands in one state. Johor, on the Singapore border, took the bulk of the boom "
  "because land is cheaper and electricity tariffs lower than across the strait, and now hosts "
  "around 72 facilities. During drought, state authorities asked investors to postpone "
  "water-cooled expansions for roughly eighteen months, to about the middle of 2027, and to stop "
  "approving the largest and thirstiest facilities altogether. Whether households or data centres "
  "have the prior claim on Johor's water has become an argument about rights rather than about "
  "engineering.",

  "The pricing has been rewritten on the same logic. Developers now have to supply their own "
  "renewable energy, pay higher electricity tariffs and meet network connection fees upfront, "
  "under a causer-pays structure meant to recover the cost of new infrastructure from whoever "
  "makes it necessary.",

  "Civil society wants more than that. Groups including Aliran have called for a full moratorium "
  "on new data centres until the country can guarantee that citizens' water and power needs come "
  "first, arguing the current freeze exempts exactly the projects growing fastest."
 ],
 "sources": [
  "https://www.malaymail.com/news/malaysia/2026/02/24/malaysia-freezes-new-non-ai-data-centres-over-power-and-water-concerns-says-anwar/210287",
  "https://techwireasia.com/2026/03/malaysia-data-centre-policy-ai-moratorium/",
  "https://theenergy.co/articles/its-not-a-moratorium-malaysian-regulators-battle-data-centre-glut",
  "https://thediplomat.com/2026/04/whose-water-powers-the-cloud-data-centers-and-the-right-to-water-in-johor/",
  "https://aliran.com/civil-society-voices/why-malaysia-must-pause-its-data-centre-boom",
  "https://www.freemalaysiatoday.com/category/opinion/2026/06/26/impose-moratorium-on-new-data-centres-until-citizens-needs-are-guaranteed",
  "https://www.fticonsulting.com/insights/articles/regulation-geopolitics-pressures-southeast-asia-data-centres"
 ]
},
}

p='data/place-reports.json'
e=json.load(io.open(p,encoding='utf-8')) if os.path.exists(p) else {}
e.update(R)
io.open(p,'w',encoding='utf-8').write(json.dumps(e,ensure_ascii=False,indent=1))
print('total reports: %d'%len(e))
for k in R: print('  %-46s %4d words, %d sources'%(k,sum(len(x.split()) for x in R[k]['paragraphs']),len(R[k]['sources'])))
