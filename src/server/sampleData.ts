import { InvestigationReport } from '../types/investigation.ts';

export const initialSeedReports: InvestigationReport[] = [
  {
    id: "rep-2026-8912",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sourceText: "BREAKING: Internal Federal Reserve memo leaked showing emergency interest rate cut scheduled for Monday morning due to severe regional banking liquidity collapse. Gold prices expected to hit $4,500/oz by weekend. Insiders already dumping bank stocks!",
    sourceMetadata: {
      platform: "X / Twitter",
      author: "MarketAlphaLeaks",
      handle: "@market_alpha_wire",
      reachEstimate: "4.8M impressions",
      engagement: {
        likes: "34.2K",
        reposts: "12.8K",
        views: "4.8M"
      }
    },
    overallVerdict: "HIGHLY_MISLEADING",
    credibilityScore: 18,
    misinformationRisk: "HIGH",
    executiveSummary: "The viral post fabricates an unscheduled emergency rate cut by the Federal Reserve and falsely claims a 'leaked internal memo'. Standard Federal Reserve FOMC meeting schedules remain unchanged, discount window liquidity indicators show normal stability, and the viral document circulating is a doctored PDF using an obsolete 2023 Federal Reserve Board letterhead template.",
    metrics: {
      durationMs: 3820,
      searchesExecuted: 5,
      sourcesConsulted: 7,
      claimsCount: 3,
      loopCycles: 2
    },
    status: "APPROVED",
    humanReviewSummary: {
      reviewer: "Elena Vance (Senior Markets Fact-Checker)",
      decision: "APPROVED",
      decisionNotes: "Confirmed with Federal Reserve Board public calendar and verified the viral PDF circulating on Telegram lacks legitimate cryptographic signatures.",
      reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    claims: [
      {
        id: "c-1",
        statement: "Federal Reserve scheduled an emergency interest rate cut for Monday morning due to banking liquidity collapse.",
        originalQuoteSnippet: "Internal Federal Reserve memo leaked showing emergency interest rate cut scheduled for Monday morning",
        category: "policy",
        verdict: "FALSE",
        confidence: 96,
        explanation: "No emergency Federal Open Market Committee (FOMC) meeting is scheduled. Federal Reserve discount window and Bank Term Funding facilities show standard operating levels with zero systemic liquidity anomalies.",
        evidenceSummary: "Federal Reserve Board public releases and official FOMC calendar confirm next rate decision is at the scheduled meeting. Bank regulators issued no emergency capital directives.",
        counterEvidence: "The circulating screenshot cites a 'Division of Reserve Bank Operations Memo 2026-B', an ID format nonexistent in Federal Reserve record-keeping archives.",
        decontextualizationFactor: "Outright fabrication using repurposed crisis terminology to drive speculative trading in precious metals and meme stocks.",
        citations: [
          {
            title: "Federal Reserve Board - Official FOMC Meeting Calendars and Statements",
            url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
            publisher: "Board of Governors of the Federal Reserve System",
            domain: "federalreserve.gov",
            reliabilityTier: "OFFICIAL"
          },
          {
            title: "Bloomberg Markets: Federal Reserve Rebuts Social Media Rate Cut Rumors",
            url: "https://www.bloomberg.com/markets",
            publisher: "Bloomberg News",
            domain: "bloomberg.com",
            reliabilityTier: "NEWS_WIRE"
          }
        ],
        humanReview: {
          status: "ACCEPTED",
          reviewerName: "Elena Vance",
          notes: "Corroborated directly against official Fed communications feed.",
          reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      },
      {
        id: "c-2",
        statement: "Gold prices are guaranteed to hit $4,500/oz by weekend following the liquidity collapse.",
        originalQuoteSnippet: "Gold prices expected to hit $4,500/oz by weekend",
        category: "statistic",
        verdict: "UNVERIFIABLE",
        confidence: 88,
        explanation: "Commodity price speculation presented as foregone causal certainty; spot gold is currently trading around standard historical ranges without parabolic deviation on major exchanges.",
        evidenceSummary: "COMEX and London Bullion Market Association (LBMA) spot settlement data confirm ordinary trading spreads.",
        decontextualizationFactor: "Hyperbolic price target engineered to manufacture FOMO among retail investors.",
        citations: [
          {
            title: "London Bullion Market Association (LBMA) Daily Gold Prices",
            url: "https://www.lbma.org.uk/prices-and-data/precious-metal-prices",
            publisher: "LBMA",
            domain: "lbma.org.uk",
            reliabilityTier: "PRIMARY"
          }
        ]
      },
      {
        id: "c-3",
        statement: "Banking insiders are mass-dumping regional bank equities.",
        originalQuoteSnippet: "Insiders already dumping bank stocks!",
        category: "event",
        verdict: "MISLEADING",
        confidence: 91,
        explanation: "SEC Form 4 filings for major regional banks show standard scheduled 10b5-1 pre-planned executive dispositions rather than emergency insider dumping.",
        evidenceSummary: "SEC EDGAR filing database verifies no abnormal volume of emergency insider sales among S&P Regional Banking ETF (KRE) constituents.",
        citations: [
          {
            title: "U.S. Securities and Exchange Commission EDGAR Search - Form 4 Filings",
            url: "https://www.sec.gov/edgar/searchedgar/companysearch",
            publisher: "SEC",
            domain: "sec.gov",
            reliabilityTier: "OFFICIAL"
          }
        ]
      }
    ],
    cognitiveTrace: [
      {
        id: "cog-1",
        phase: "PLAN",
        title: "Claim Decomposition & Verification Strategy",
        detail: "Extracted 3 discrete verifiable claims across monetary policy, market pricing, and SEC insider trading activity. Formulating cross-referencing plan against official Federal Reserve publications and SEC EDGAR databases.",
        searchQueries: [
          "Federal Reserve emergency rate cut statement",
          "Federal Reserve leaked memo banking liquidity",
          "SEC Form 4 regional bank insider sales volume"
        ],
        timestamp: "2026-10-30T17:50:15.000Z",
        status: "completed"
      },
      {
        id: "cog-2",
        phase: "ACT",
        title: "Search Grounding & Primary Source Retrieval",
        detail: "Queried Federal Reserve calendar, FOMC statements, and news wires for emergency announcements. Retrieved official releases and market reporting.",
        findings: [
          "No emergency meeting listed on federalreserve.gov FOMC calendar.",
          "Bloomberg and Reuters report normal discount window liquidity operations.",
          "SEC EDGAR shows no surge in emergency Form 4 filings."
        ],
        timestamp: "2026-10-30T17:50:16.800Z",
        status: "completed"
      },
      {
        id: "cog-3",
        phase: "OBSERVE",
        title: "Evidence & Document Authenticity Analysis",
        detail: "Inspected claims of 'leaked memo'. Checked format against standard Federal Reserve docket numbering system.",
        findings: [
          "Memo ID does not conform to Federal Reserve Board numbering standards.",
          "Similar rumor template identified circulating in private crypto channels 48 hours earlier."
        ],
        timestamp: "2026-10-30T17:50:17.500Z",
        status: "completed"
      },
      {
        id: "cog-4",
        phase: "REPLAN",
        title: "Adversarial Stress Test on Market Data",
        detail: "Formulated re-plan query to test if any regional lenders accessed emergency discount facilities in the last 72 hours.",
        searchQueries: ["Federal Reserve H.4.1 factors affecting reserve balances"],
        findings: [
          "Weekly H.4.1 report shows reserve balances at $3.2T with zero anomalous discount spikes."
        ],
        timestamp: "2026-10-30T17:50:18.200Z",
        status: "completed"
      },
      {
        id: "cog-5",
        phase: "SYNTHESIZE",
        title: "Confidence Calibration & Final Verdict Assembly",
        detail: "Synthesized evidence across 3 claims. Assigned credibility score 18/100, high misinformation risk due to market manipulation potential.",
        timestamp: "2026-10-30T17:50:18.820Z",
        status: "completed"
      }
    ],
    allCitations: [
      {
        title: "Federal Reserve Board - Official FOMC Meeting Calendars and Statements",
        url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
        domain: "federalreserve.gov",
        count: 2,
        reliabilityTier: "OFFICIAL"
      },
      {
        title: "Bloomberg Markets: Federal Reserve Rebuts Social Media Rate Cut Rumors",
        url: "https://www.bloomberg.com/markets",
        domain: "bloomberg.com",
        count: 1,
        reliabilityTier: "NEWS_WIRE"
      },
      {
        title: "U.S. Securities and Exchange Commission EDGAR Search - Form 4 Filings",
        url: "https://www.sec.gov/edgar/searchedgar/companysearch",
        domain: "sec.gov",
        count: 1,
        reliabilityTier: "OFFICIAL"
      },
      {
        title: "London Bullion Market Association (LBMA) Daily Gold Prices",
        url: "https://www.lbma.org.uk/prices-and-data/precious-metal-prices",
        domain: "lbma.org.uk",
        count: 1,
        reliabilityTier: "PRIMARY"
      }
    ]
  },
  {
    id: "rep-2026-7731",
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    sourceText: "Scientists in Tokyo have officially confirmed that drinking 3 cups of green tea with crushed cloves destroys 99.8% of microplastics inside human blood vessels in under 48 hours. Medical industry is suppressing this cheap cure!",
    sourceMetadata: {
      platform: "TikTok",
      author: "HolisticBioHacker99",
      handle: "@holistic_biohack",
      reachEstimate: "1.2M views",
      engagement: {
        likes: "182K",
        reposts: "45K",
        views: "1.2M"
      }
    },
    overallVerdict: "FABRICATED",
    credibilityScore: 4,
    misinformationRisk: "CRITICAL",
    executiveSummary: "A completely unfounded pseudoscientific claim that conflates in-vitro microplastic degradation studies in soil microbes with human clinical vascular biology. No human trial or credible institutional study has demonstrated that green tea and cloves eliminate microplastics from human vascular circulation.",
    metrics: {
      durationMs: 4100,
      searchesExecuted: 4,
      sourcesConsulted: 6,
      claimsCount: 2,
      loopCycles: 2
    },
    status: "APPROVED",
    humanReviewSummary: {
      reviewer: "Dr. Marcus Wei (Health Science Fact-Checker)",
      decision: "APPROVED",
      decisionNotes: "Reviewed against PubMed and WHO microplastics scientific brief. Complete pseudoscience.",
      reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    claims: [
      {
        id: "c-1",
        statement: "Tokyo scientists confirmed green tea with crushed cloves destroys 99.8% of microplastics in human blood vessels within 48 hours.",
        category: "scientific",
        verdict: "FALSE",
        confidence: 99,
        explanation: "No such research exists. Neither the University of Tokyo nor any peer-reviewed biomedical journal has published any protocol showing plant catechins breaking down synthetic polymers in living human bloodstream.",
        evidenceSummary: "Comprehensive PubMed literature review yields zero clinical trials supporting clearance of vascular microplastics via herbal infusion.",
        decontextualizationFactor: "Pure fabrication misattributing vague 'Tokyo scientists' to create an illusion of academic authority.",
        citations: [
          {
            title: "World Health Organization: Dietary and Inhalation Exposure to Nano- and Microplastic Particles",
            url: "https://www.who.int/publications/i/item/9789240054608",
            publisher: "WHO",
            domain: "who.int",
            reliabilityTier: "OFFICIAL"
          },
          {
            title: "National Center for Biotechnology Information (PubMed) Literature Database",
            url: "https://pubmed.ncbi.nlm.nih.gov/",
            publisher: "NCBI / NIH",
            domain: "nih.gov",
            reliabilityTier: "ACADEMIC"
          }
        ]
      },
      {
        id: "c-2",
        statement: "The medical industry is actively suppressing this cheap microplastics cure.",
        category: "media",
        verdict: "FALSE",
        confidence: 95,
        explanation: "Classic conspiratorial trope used to explain away the absence of peer-reviewed scientific proof.",
        evidenceSummary: "Medical research on microplastic health impacts is extensively funded worldwide by public grants (NIH, Horizon Europe) with open access publication mandate.",
        citations: [
          {
            title: "European Research Council: Microplastics and Human Health Consortium",
            url: "https://erc.europa.eu",
            publisher: "European Commission",
            domain: "europa.eu",
            reliabilityTier: "OFFICIAL"
          }
        ]
      }
    ],
    cognitiveTrace: [
      {
        id: "c-t1",
        phase: "PLAN",
        title: "Medical Claim Verification Plan",
        detail: "Formulating query for Tokyo microplastic degradation studies and checking NIH / PubMed clinical trial registries.",
        searchQueries: ["Tokyo scientists green tea cloves microplastics blood vessels", "microplastics human bloodstream clearance tea"],
        timestamp: "2026-10-29T23:45:00.000Z",
        status: "completed"
      },
      {
        id: "c-t2",
        phase: "ACT",
        title: "Biomedical Literature Search Execution",
        detail: "Queried PubMed and scientific archives for study match.",
        findings: ["Zero hits for clove-induced microplastic elimination in vivo."],
        timestamp: "2026-10-29T23:45:02.000Z",
        status: "completed"
      },
      {
        id: "c-t3",
        phase: "OBSERVE",
        title: "Disinformation Genealogy Traced",
        detail: "Identified origin as a TikTok video recycling a 2021 environmental engineering paper on bacterial plastic digestion in wastewater treatment plants.",
        timestamp: "2026-10-29T23:45:03.200Z",
        status: "completed"
      },
      {
        id: "c-t4",
        phase: "SYNTHESIZE",
        title: "Verdict Generation",
        detail: "Categorized as fabricated medical disinformation with severe public health deception rating.",
        timestamp: "2026-10-29T23:45:04.100Z",
        status: "completed"
      }
    ],
    allCitations: [
      {
        title: "World Health Organization: Nano- and Microplastic Particles Health Brief",
        url: "https://www.who.int/publications/i/item/9789240054608",
        domain: "who.int",
        count: 1,
        reliabilityTier: "OFFICIAL"
      },
      {
        title: "National Center for Biotechnology Information (PubMed) Literature Database",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
        domain: "nih.gov",
        count: 1,
        reliabilityTier: "ACADEMIC"
      }
    ]
  }
];
