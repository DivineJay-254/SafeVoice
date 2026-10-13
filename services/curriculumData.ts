import { EducationModule, OfficialDocumentReference, PocketCard } from '../types';

export const CURRICULUM_TRACKS = [
  'All Tracks',
  'Foundations & Human Rights',
  'Survivor-Centered & PFA',
  'Clinical CMR & 72h Golden Window',
  'Panzi 4-Pillar Model (DRC)',
  'PSEA & Humanitarian Accountability',
  'Traditional Practices & Child Protection',
  'Legal Frameworks & Formal Justice',
  'Diversity, Disability & Inclusion'
] as const;

export const OFFICIAL_GBV_DOCUMENTS: OfficialDocumentReference[] = [
  {
    id: 'doc-iasc-2015',
    title: 'Guidelines for Integrating Gender-Based Violence Interventions in Humanitarian Action',
    organization: 'IASC',
    year: '2015',
    category: 'Policy',
    summary: 'The universal global humanitarian blueprint for preventing GBV across camp coordination, food security, health, shelter, and water/sanitation clusters. Mandates that all humanitarian actors assume GBV is occurring in emergencies and take immediate protective mitigation steps.',
    corePrinciples: [
      'GBV prevention is a life-saving, core humanitarian priority from Day 1 of any crisis.',
      'All sectoral clusters (WASH, Food, Camp Coordination) must design layouts to prevent GBV risks.',
      'Strict adherence to survivor-centered ethics: Safety, Confidentiality, Respect, Non-Discrimination.'
    ],
    fieldActionChecklist: [
      'Audit latrines and water points for lighting, locks, and separated gender facilities.',
      'Distribute dignity kits containing culturally appropriate sanitary items and torches.',
      'Establish clear, safe inter-agency referral pathways without requiring disclosure of details.'
    ],
    relevanceToKakumaDRC: 'Primary guideline governing UNHCR, DRC, and partner operations in Kakuma, Kalobeyei, and eastern DRC displacement corridors.'
  },
  {
    id: 'doc-unhcr-gbv-2020',
    title: 'Policy on the Prevention of, Risk Mitigation and Response to Gender-Based Violence',
    organization: 'UNHCR',
    year: '2020',
    category: 'Policy',
    summary: 'Institutional UNHCR policy holding country representatives and operations accountable for institutionalizing survivor-centered GBV programming across all phases of forced displacement.',
    corePrinciples: [
      'Zero tolerance for inaction on GBV risks in refugee camps and urban asylum settings.',
      'Centering survivor autonomy: survivors decide what assistance they want and when to stop.',
      'Intersectionality: tailored risk mitigation for LGBTIQ+ refugees, youth, and persons with disabilities.'
    ],
    fieldActionChecklist: [
      'Maintain 24/7 emergency confidential GBV hotline and protection desks in all camp zones.',
      'Guarantee free, immediate clinical referrals without requiring police P3 filing beforehand.',
      'Regular safety audits with refugee women, adolescent girls, and marginalized groups.'
    ],
    relevanceToKakumaDRC: 'Enforced at UNHCR Kakuma sub-office and across all refugee settlements in Kenya and the Great Lakes region.'
  },
  {
    id: 'doc-who-cmr-2020',
    title: 'Clinical Management of Rape and Intimate Partner Violence Survivors',
    organization: 'WHO',
    year: '2020',
    category: 'Clinical Guideline',
    summary: 'Gold-standard clinical protocol developed jointly by WHO, UNHCR, and UNFPA for healthcare workers providing emergency post-assault medical care.',
    corePrinciples: [
      'Post-Exposure Prophylaxis (PEP) must be initiated within 72 hours to prevent HIV transmission.',
      'Emergency contraception is effective up to 120 hours (5 days), with peak efficacy within 72 hours.',
      'Presumptive treatment for sexually transmitted infections (Chlamydia, Gonorrhea, Trichomonas, Syphilis).',
      'Tetanus toxoid and Hepatitis B vaccinations administered on day of presentation.'
    ],
    fieldActionChecklist: [
      'Administer PEP starter pack immediately upon arrival (do not wait for HIV lab confirmation).',
      'Provide non-judgmental Psychological First Aid during physical triage.',
      'Document injuries carefully on standardized medical forms while strictly preserving confidentiality.'
    ],
    relevanceToKakumaDRC: 'Standard operating protocol used by International Rescue Committee (IRC) clinics in Kakuma and Kalobeyei.'
  },
  {
    id: 'doc-panzi-model',
    title: 'The Panzi 4-Pillar Holistic Healing Model for Survivors of Sexual Violence',
    organization: 'Panzi Foundation',
    year: '2021',
    category: 'Field SOP',
    summary: 'Pioneered by 2018 Nobel Peace Prize Laureate Dr. Denis Mukwege at Panzi Hospital in Bukavu (DRC). Combines medical care, psychological trauma therapy, socioeconomic empowerment, and legal aid under one integrated roof.',
    corePrinciples: [
      'Pillar 1 - Medical: Advanced reconstructive gynecological surgery, fistula repair, and clinical care.',
      'Pillar 2 - Psychological: Prolonged Exposure Therapy, trauma groups, and safe haven stabilization.',
      'Pillar 3 - Socioeconomic: Village Savings & Loans (VSLA), vocational apprenticeships, and food security.',
      'Pillar 4 - Legal: Mobile court trials, free legal defense, and forensic documentation to end impunity.'
    ],
    fieldActionChecklist: [
      'Treat the physical body and psychological wound simultaneously, not sequentially.',
      'Provide unconditional livelihood capital so economic vulnerability does not force return to abuser.',
      'Support survivor-led advocacy (Mouvement National des Survivantes de VSV en RDC).'
    ],
    relevanceToKakumaDRC: 'Global gold standard for conflict-related sexual violence recovery, actively referenced by DRC protection units.'
  },
  {
    id: 'doc-drc-gbv-sop',
    title: 'Humanitarian Protection & GBV Standard Operating Procedures (SOPs)',
    organization: 'DRC',
    year: '2022',
    category: 'Field SOP',
    summary: 'Operational case management guidelines implemented by the Danish Refugee Council for field protection desks, safe spaces, and legal assistance in displacement settings.',
    corePrinciples: [
      'Survivor safety is paramount: no action without explicit informed consent from the survivor.',
      'Confidentiality: survivor identities and case files encrypted, anonymized, and never shared with authorities without consent.',
      'Best Interests Determination (BID) for child survivors conducted with certified child protection officers.'
    ],
    fieldActionChecklist: [
      'Verify physical safety before conducting any intake interview.',
      'Provide complete, objective information regarding available medical, legal, and psychosocial options.',
      'Facilitate secure referrals without requiring the survivor to recount their traumatic story multiple times.'
    ],
    relevanceToKakumaDRC: 'Guides DRC Protection Desks across Kalobeyei Settlement, Kakuma Camp, and cross-border operations.'
  },
  {
    id: 'doc-un-psea-2003',
    title: 'Special Measures for Protection from Sexual Exploitation and Sexual Abuse (ST/SGB/2003/13)',
    organization: 'UNHCR',
    year: '2003',
    category: 'PSEA Standards',
    summary: 'Secretary-General Bulletin establishing mandatory standards of conduct for all UN personnel, NGO staff, and humanitarian contractors. Explicitly criminalizes the exchange of aid, food, money, or services for sexual favors.',
    corePrinciples: [
      'Sexual exploitation and sexual abuse are acts of gross misconduct and grounds for summary dismissal and criminal prosecution.',
      'Sexual activity with children (persons under 18 years) is strictly prohibited; mistake of age is no defense.',
      'Exchange of money, employment, goods, food, or assistance for sex is prohibited.',
      'Sexual relationships based on inherently unequal power dynamics are strongly discouraged.',
      'Mandatory reporting: all humanitarian personnel have a duty to report suspected SEA.'
    ],
    fieldActionChecklist: [
      'Display toll-free reporting channels (UNHCR 1517 / inspector@unhcr.org) at every food distribution point.',
      'Maintain anonymous suggestion and complaint boxes locked and managed by independent PSEA focal points.',
      'Provide immediate protective shelter and clinical care to victims of humanitarian exploitation.'
    ],
    relevanceToKakumaDRC: 'Strict zero-tolerance code binding all staff, caseworkers, security, and volunteers in Kakuma and DRC operations.'
  },
  {
    id: 'doc-kenya-soa-2006',
    title: 'The Sexual Offences Act (Act No. 3 of 2006) & PADVA (2015)',
    organization: 'Government of Kenya',
    year: '2006',
    category: 'Legal Framework',
    summary: 'Kenyan statutory laws governing rape, attempted rape, sexual assault, gang rape, defilement of minors, and domestic abuse. The Protection Against Domestic Violence Act (PADVA 2015) provides emergency protection orders and prohibits forced evictions of spouses.',
    corePrinciples: [
      'Rape and defilement carry mandatory minimum custodial sentences ranging from 10 years to life imprisonment.',
      'Defilement of a child under 11 carries life imprisonment; 12-15 carries 20 years; 16-17 carries 15 years.',
      'Traditional or informal arbitration ("Maslah") for sexual offences is illegal under Section 43 of the Sexual Offences Act.',
      'PADVA allows courts to issue restraining and eviction orders removing the perpetrator from the family residence.'
    ],
    fieldActionChecklist: [
      'Support survivors who choose to pursue criminal charges by escorting them to the Gender Desk at Police Stations.',
      'Ensure the Police P3 Medical Examination form is completed by registered medical practitioners.',
      'Resist and report attempts by community elders to adjudicate rape or defilement via livestock compensation.'
    ],
    relevanceToKakumaDRC: 'Governs all criminal justice procedures and police interventions within Kakuma Camp and Turkana County jurisdiction.'
  },
  {
    id: 'doc-unfpa-standards',
    title: 'Minimum Standards for Prevention and Response to Gender-Based Violence in Emergencies',
    organization: 'UNFPA',
    year: '2019',
    category: 'Policy',
    summary: 'The 16 core humanitarian standards ensuring life-saving healthcare, Women and Girls Safe Spaces (WGSS), dignity kit distributions, and coordinated GBV case management in humanitarian emergencies.',
    corePrinciples: [
      'Safe spaces for women and girls must provide physical security, skill training, and confidential peer support.',
      'Dignity kits must be distributed respectfully without requiring public registration or conditional tests.',
      'GBV Information Management System (GBVIMS) data protection protocol must be strictly adhered to.'
    ],
    fieldActionChecklist: [
      'Establish WGSS centers within safe walking distance of camp residential blocks.',
      'Conduct community awareness campaigns addressing toxic masculinity and bystander intervention.',
      'Train female community health volunteers in identifying GBV red flags.'
    ],
    relevanceToKakumaDRC: 'Standard framework for UNFPA and partner women safe havens in Kalobeyei and Kakuma 1-4.'
  }
];

export const POCKET_GUIDES: PocketCard[] = [
  {
    id: 'card-pep-72h',
    title: '72-Hour Golden Medical Window',
    subtitle: 'Post-Exposure Prophylaxis (PEP) & Emergency Contraception',
    organization: 'WHO / UNHCR / IRC',
    urgency: 'critical',
    steps: [
      'Step 1: Get to IRC Kalobeyei Super Clinic or Kakuma Clinic immediately within 72 hours of incident.',
      'Step 2: Do NOT wash, bathe, douche, or change clothes if possible (preserves physical evidence for P3 form).',
      'Step 3: Begin 28-day HIV PEP medication course immediately (starter packs given without waiting for tests).',
      'Step 4: Receive Emergency Contraception (effective up to 120h, highest efficacy in first 24-72h).',
      'Step 5: Receive prophylactic antibiotics for STIs, Tetanus shot, and Hepatitis B vaccine.',
      'Step 6: Clinical GBV treatment is 100% FREE, safe, and confidential under UNHCR protection.'
    ],
    goldenRule: 'PEP reduces HIV infection risk by over 80-90% if taken within 72 hours. Every minute matters.'
  },
  {
    id: 'card-survivor-centered',
    title: 'The 4 Core Survivor-Centered Principles',
    subtitle: 'Mandatory standard for all responders & community allies',
    organization: 'UNHCR / DRC / IASC',
    urgency: 'high',
    steps: [
      '1. SAFETY: Prioritize the immediate physical and emotional safety of the survivor and their children.',
      '2. CONFIDENTIALITY: Never reveal names, locations, or details to neighbors, elders, police, or public without explicit written consent.',
      '3. RESPECT: Treat the survivor as the primary decision-maker. Never tell them what they "should" do; empower their agency.',
      '4. NON-DISCRIMINATION: Provide equal, compassionate care regardless of gender, nationality, sexual orientation, disability, or marital status.'
    ],
    goldenRule: 'The survivor is the expert on their own safety and recovery. Responders facilitate choices, not dictate them.'
  },
  {
    id: 'card-pfa-look-listen-link',
    title: 'Psychological First Aid: Look, Listen, Link',
    subtitle: 'WHO Field Crisis Support Protocol',
    organization: 'WHO / DRC Mental Health',
    urgency: 'standard',
    steps: [
      'LOOK: Check for immediate physical danger, medical emergencies, bleeding, or urgent physical needs (water, blanket).',
      'LISTEN: Approach respectfully. Ask "How can I support you right now?" Listen quietly without interrupting or pressing for traumatic details.',
      'LINK: Connect survivor with basic urgent needs (health clinic, safe shelter, food, trusted friend, helpline 1195/1517).'
    ],
    goldenRule: 'Never force a survivor to retell what happened. Offer calm presence, physical comfort, and immediate options.'
  },
  {
    id: 'card-psea-rules',
    title: 'The 6 Inviolable UN/DRC PSEA Rules',
    subtitle: 'Prevention of Sexual Exploitation and Abuse by Aid Workers',
    organization: 'UN SG Bulletin ST/SGB/2003/13',
    urgency: 'critical',
    steps: [
      'Rule 1: ZERO TOLERANCE: Sexual exploitation and abuse by aid staff or contractors is gross misconduct.',
      'Rule 2: NO AID FOR SEX: Never exchange food rations, cash, shelter, SIM cards, or tokens for sexual favors or attention.',
      'Rule 3: NO ACTIVITY WITH MINORS: Sexual relations with anyone under 18 years is strictly prohibited; age mistake is not a defense.',
      'Rule 4: POWER BOUNDARIES: Humanitarian workers are strictly barred from sexual relationships with beneficiaries involving unequal power.',
      'Rule 5: MANDATORY REPORTING: All aid workers must report suspected SEA violations immediately.',
      'Rule 6: REPORTING CONTACTS: Call UNHCR Hotline 1517, DRC 0800720414, or email inspector@unhcr.org.'
    ],
    goldenRule: 'Humanitarian aid is completely unconditional and 100% FREE. No one has the right to ask for favors.'
  },
  {
    id: 'card-maslah-vs-justice',
    title: 'Formal Legal Justice vs. Traditional "Maslah"',
    subtitle: 'Why sexual offences cannot be settled by community elders',
    organization: 'Kenya Judiciary & UNHCR Legal Aid',
    urgency: 'high',
    steps: [
      'Rule: Section 43 of Kenya Sexual Offences Act prohibits out-of-court arbitration or settlements for sexual violence.',
      'Danger of Maslah: Traditional kangaroo courts often order payment of goats/camels to the victim’s clan or force the victim to marry the rapist.',
      'Survivor Loss: The survivor receives no justice, ongoing trauma, and the perpetrator walks free to re-offend.',
      'Legal Right: Every refugee has the right to free legal representation through DRC and Kituo Cha Sheria in formal Kenyan courts.'
    ],
    goldenRule: 'Rape and defilement are serious criminal offences under Kenyan law. They can never be settled with livestock or bride price.'
  }
];

export const FIELD_DILEMMAS = [
  {
    id: 'case-pep-timing',
    title: 'The 60-Hour Presentation Window',
    narrative: 'Amina, a 22-year-old resident of Kakuma 2, arrives at a community protection pavilion on Sunday morning. She discloses that she was sexually assaulted on Friday evening (approximately 60 hours ago). She is terrified, hesitant to go to a clinic because she fears the police will interrogate her, and someone told her it was "too late" for medical help.',
    dilemma: 'What is the immediate priority survivor-centered protocol you must take?',
    options: [
      {
        text: 'Insist that she first reports to the Kakuma Police Station to get an official P3 form stamped before visiting the clinic.',
        correct: false,
        explanation: 'Incorrect & Dangerous. Visiting police first wastes critical hours and is NOT required. Medical care (PEP and emergency contraception) must be provided immediately without police documentation.'
      },
      {
        text: 'Immediately arrange confidential, supportive transport to IRC Kalobeyei or Kakuma Clinic so she receives HIV PEP within the 72-hour window and emergency contraception, reassuring her that medical care is free, confidential, and does not require police filing.',
        correct: true,
        explanation: 'Correct! Under WHO/UNHCR CMR guidelines, 60 hours is within the 72-hour window for life-saving HIV PEP and within the 120-hour window for emergency contraception. Clinical care always takes precedence over legal reporting.'
      },
      {
        text: 'Advise her that because more than 48 hours have passed, clinical care cannot help and she should rest at home.',
        correct: false,
        explanation: 'Incorrect! The PEP window is a full 72 hours, and emergency contraception is effective up to 120 hours. Medical care is still urgently life-saving.'
      }
    ]
  },
  {
    id: 'case-elder-pressure',
    title: 'Community Pressure & Maslah Kangaroo Court',
    narrative: 'A 16-year-old girl discloses to a school counselor that an older neighbor assaulted her. Later that evening, family elders and community leaders summon the girl’s parents to a traditional "Maslah" gathering, proposing that the perpetrator’s family pay three cows to settle the matter and that no police report be made.',
    dilemma: 'How should the case worker and advocate respond under humanitarian and Kenyan law?',
    options: [
      {
        text: 'Encourage the family to accept the settlement since peaceful clan relations are most important in refugee settlements.',
        correct: false,
        explanation: 'Incorrect. Out-of-court settlements for sexual offences violate Section 43 of the Sexual Offences Act and UNHCR child protection guidelines.'
      },
      {
        text: 'Explain to the family and child that under Kenyan law and UNHCR policy, sexual offences against children (defilement) cannot be settled through traditional payments; connect them with DRC legal protection and ensure child safeguarding and safe shelter.',
        correct: true,
        explanation: 'Correct! Traditional Maslah arbitration denies justice to survivors, creates lifelong revictimization, and is illegal under Kenyan statutory law. Responders must safeguard the child through official protection mechanisms.'
      },
      {
        text: 'Confront the elders publicly at the meeting and threaten them with immediate arrest.',
        correct: false,
        explanation: 'Incorrect. Confronting elders recklessly can escalate safety risks for the child and family. The survivor-centered protocol focuses on safe relocation, legal empowerment, and formal justice with trained protection officers.'
      }
    ]
  },
  {
    id: 'case-aid-exploitation',
    title: 'Food Distribution Token Coercion (PSEA Breach)',
    narrative: 'During a bi-monthly food assistance verification at a camp reception center, a contracted distribution assistant takes a young mother’s ration token and whispers that he will only return it if she meets him privately after dark at a local tea kiosk.',
    dilemma: 'What constitutes this behavior and what is the mandated humanitarian protocol?',
    options: [
      {
        text: 'This is a private interpersonal misunderstanding that the beneficiary should resolve by negotiating with the worker.',
        correct: false,
        explanation: 'Incorrect. This is a severe breach of humanitarian power and a classic case of Sexual Exploitation and Abuse (SEA).'
      },
      {
        text: 'This is Sexual Exploitation (PSEA breach). The mother has the absolute right to receive food assistance unconditionally. The incident must be reported immediately via UNHCR 1517 or the independent PSEA focal point, with immediate protection and replacement of her ration token.',
        correct: true,
        explanation: 'Correct! Under UN ST/SGB/2003/13, conditioning humanitarian aid on sexual favors is gross misconduct. Aid is 100% free and unconditional. Whistleblower and victim protections are guaranteed.'
      },
      {
        text: 'Advise the woman to just borrow food from a neighbor to avoid offending the distribution staff.',
        correct: false,
        explanation: 'Incorrect. Conditioning survival aid on sexual favors is predatory and criminal. It requires immediate institutional reporting and beneficiary safeguarding.'
      }
    ]
  }
];

export const COMPREHENSIVE_CURRICULUM_MODULES: EducationModule[] = [
  // TRACK 1: FOUNDATIONS & HUMAN RIGHTS
  {
    id: 'mod-gbv-foundations',
    title: 'Understanding Gender-Based Violence: Roots, Power & Autonomy',
    track: 'Foundations & Human Rights',
    level: 'Foundational',
    estimatedMinutes: 8,
    description: 'Comprehensive exploration of GBV root causes, power imbalances, gender inequality, and human rights frameworks.',
    imageUrl: '/src/assets/images/gbv_camp_protection_1791740538544.jpg',
    organizationSources: ['UNHCR', 'IASC', 'WHO'],
    learningObjectives: [
      'Define Gender-Based Violence (GBV) according to UNHCR and IASC standards.',
      'Differentiate between biological sex and socially constructed gender roles.',
      'Identify how power imbalances drive violence in homes and displacement camps.',
      'Understand bodily autonomy as an inalienable fundamental human right.'
    ],
    content: `### 1. What is Gender-Based Violence (GBV)?
Gender-Based Violence (GBV) is an umbrella term for any harmful act that is perpetrated against a person's will and that is based on socially ascribed (gender) differences between males and females. It includes acts that inflict physical, sexual, or mental harm or suffering, threats of such acts, coercion, and other deprivations of liberty.

### 2. The Core Driver: Power Imbalances
GBV is fundamentally about unequal power relationships. Power can be derived from:
- Gender social norms (male dominance and female subordination)
- Economic control (controlling money, food rations, shelter)
- Institutional authority (aid workers, police, military, family elders)
- Social isolation (refugee status, lack of legal identification, displacement)

In humanitarian and refugee contexts such as Kakuma, Kalobeyei, and eastern DRC, displacement shatters community safety nets, placing women, girls, and marginalized individuals at exponential risk of violence.

### 3. Bodily Autonomy & Human Rights
Every human being possesses an inalienable right to bodily integrity, physical security, and freedom from cruel, inhuman, or degrading treatment. These rights are codified in:
- Universal Declaration of Human Rights (UDHR)
- UN Convention on the Elimination of All Forms of Discrimination Against Women (CEDAW)
- The African Charter on Human and Peoples' Rights (Maputo Protocol)
- Kenya Constitution (2010) Article 29 & The Refugees Act 2021`,
    keyTakeaways: [
      'GBV is rooted in gender inequality and the abuse of power.',
      'Violence is never the fault of the survivor.',
      'Bodily autonomy is guaranteed under international and Kenyan law.'
    ],
    protocols: [
      {
        title: 'Community Awareness Protocol',
        steps: [
          'Facilitate dialogue on positive masculinity and equal decision-making at household levels.',
          'Challenge customs that treat women or girls as property or commodities.',
          'Promote awareness of free survivor support services across all camp languages.'
        ]
      }
    ],
    officialDocuments: [
      {
        title: 'IASC Guidelines for Integrating GBV Interventions in Humanitarian Action',
        publisher: 'Inter-Agency Standing Committee',
        year: '2015',
        summary: 'Primary international standard directing all humanitarian actors to prevent and respond to GBV.'
      }
    ],
    quiz: [
      {
        question: 'What is the primary root cause of Gender-Based Violence according to UNHCR and IASC?',
        options: [
          'Alcohol consumption and poverty alone',
          'Unequal power dynamics and systemic gender inequality',
          'Misunderstandings between family members',
          'Lack of formal educational degrees'
        ],
        correctIndex: 1,
        explanation: 'UNHCR and IASC establish that while poverty or substance abuse may exacerbate risk, the primary root cause of GBV is systemic gender inequality and unequal power relationships.'
      },
      {
        question: 'Under international humanitarian law, bodily autonomy is classified as:',
        options: [
          'A privilege granted at the discretion of community elders',
          'A conditional benefit depending on refugee camp status',
          'An inalienable fundamental human right',
          'An optional guideline for non-profit organizations'
        ],
        correctIndex: 2,
        explanation: 'Bodily autonomy and freedom from violence are inalienable human rights protected under CEDAW, the Maputo Protocol, and national constitutions.'
      }
    ]
  },
  {
    id: 'mod-gbvims-classifications',
    title: 'The 6 Standard GBVIMS Incident Classifications',
    track: 'Foundations & Human Rights',
    level: 'Foundational',
    estimatedMinutes: 10,
    description: 'Master the internationally recognized 6 core classifications defined by the Gender-Based Violence Information Management System.',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['GBVIMS Steering Committee', 'UNHCR', 'UNFPA', 'IRC'],
    learningObjectives: [
      'Memorize the 6 standardized GBVIMS incident categories.',
      'Recognize how psychological abuse and economic deprivation constitute violence.',
      'Understand why standardized classification is vital for humanitarian resource allocation.'
    ],
    content: `The Gender-Based Violence Information Management System (GBVIMS) is the global gold standard used by UNHCR, DRC, IRC, and UNICEF to track and analyze incidents ethically.

### The 6 Core Classifications:
1. **Rape**: Non-consensual penetration (however slight) of the vagina, anus, or mouth with a penis or other body part, or object. Also includes penetration of the vagina or anus with an object by force, coercion, or abuse of power.
2. **Sexual Assault**: An act of sexual violence not including rape, such as attempted rape, unwanted touching, kissing, fondling, or forced viewing of sexual acts without consent.
3. **Physical Assault**: An act of physical violence that is not sexual, including hitting, slapping, choking, burning, kicking, or weapons use by an intimate partner or non-partner.
4. **Forced Marriage**: Marriage of an individual against their will or without their valid, informed consent. This includes child marriage (under 18 years of age), forced levirate (widow inheritance), and forced marriage to a rapist.
5. **Denial of Resources, Opportunities, or Services**: Denial of rightful access to economic resources, food assistance, education, healthcare, water tokens, employment, or inheritance by an intimate partner or family member.
6. **Psychological / Emotional Abuse**: Infliction of mental or emotional pain, including threats, intimidation, humiliation, forced isolation, stalking, cyber harassment, and verbal aggression.`,
    keyTakeaways: [
      'Denial of food or economic control is an officially recognized form of GBV.',
      'Emotional and verbal harassment cause severe measurable trauma.',
      'GBVIMS classifications ensure survivor data is categorized consistently and ethically worldwide.'
    ],
    quiz: [
      {
        question: 'Which of the following constitutes "Denial of Resources" under GBVIMS?',
        options: [
          'A humanitarian organization reducing rations due to global funding cuts',
          'A spouse confiscating a partner’s food ration card or preventing them from accessing medical clinics',
          'A shopkeeper running out of household items',
          'A bank charging standard transfer fees'
        ],
        correctIndex: 1,
        explanation: 'Under GBVIMS, Denial of Resources involves an individual intentionally depriving another of sustenance, ration cards, money, or vital healthcare to exercise control.'
      },
      {
        question: 'Is any marriage involving an individual under 18 years of age recognized as Forced Marriage under international standards?',
        options: [
          'No, if parents and community elders give their blessing',
          'Only if the child actively objects in court',
          'Yes, because minors cannot legally provide free, informed consent',
          'Only if there is physical violence during the ceremony'
        ],
        correctIndex: 2,
        explanation: 'Under the UN Convention on the Rights of the Child and Kenyan law, any marriage under 18 is child marriage and categorized as forced marriage because minors cannot give legal consent.'
      }
    ]
  },
  {
    id: 'mod-dispelling-myths',
    title: 'Dispelling Harmful Myths, Victim-Blaming & Stigma',
    track: 'Foundations & Human Rights',
    level: 'Foundational',
    estimatedMinutes: 7,
    description: 'Deconstruct pervasive cultural myths surrounding clothing, alcohol, consent, and false allegations.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'DRC', 'Amnesty International'],
    learningObjectives: [
      'Identify victim-blaming language and attitudes in community spaces.',
      'Disprove common falsehoods regarding clothing, time of day, and intoxication.',
      'Explain the reality of trauma responses (freeze, appease, dissociative states).'
    ],
    content: `### Harmful Myth 1: "She asked for it because of how she dressed or where she walked at night."
**FACT:** Violence is caused 100% by the perpetrator's decision to assault someone. Clothes, makeup, walking routes, or late hours NEVER cause or justify sexual violence. Studies across refugee camps demonstrate survivors were wearing diverse clothing—including traditional hijabs, loose dresses, and school uniforms—at the time of assault.

### Harmful Myth 2: "If she didn't fight back, scream, or scratch, she consented."
**FACT (Neurobiology of Trauma):** Under extreme terror, the human brain triggers the "tonic immobility" or freeze response. The brain releases a flood of stress hormones that physically paralyzes vocal cords and muscles. Involuntary freezing is a biological survival mechanism, NOT consent.

### Harmful Myth 3: "Rape only happens between strangers in dark alleyways."
**FACT:** Over 70-80% of GBV incidents globally are committed by persons known to the survivor—husbands, partners, relatives, neighbors, or colleagues. Intimate partner violence is the most frequent form of GBV worldwide.

### Harmful Myth 4: "Women make up false reports for financial gain or resettlement."
**FACT:** Empirical studies by law enforcement and academic researchers show false reporting rates for sexual assault are between 2% and 8%—identical to false reporting rates for other crimes such as burglary. Given the intense social stigma and personal risk, survivors overwhelmingly under-report rather than fabricate cases.`,
    keyTakeaways: [
      'Victim-blaming protects perpetrators and silences future survivors.',
      'Tonic immobility (freezing) is an involuntary biological reaction to extreme fear.',
      'The responsibility for violence rests solely with the person who chooses to commit it.'
    ],
    quiz: [
      {
        question: 'Why might a survivor of sexual assault remain silent or physically motionless during an attack?',
        options: [
          'Because they are silently consenting to the interaction',
          'Because of the biological "freeze" response (tonic immobility) triggered by terror',
          'Because they are not genuinely afraid',
          'Because they forgot to seek assistance'
        ],
        correctIndex: 1,
        explanation: 'Tonic immobility is an involuntary neurological survival mechanism where the body freezes in response to overwhelming traumatic terror.'
      }
    ]
  },

  // TRACK 2: SURVIVOR-CENTERED & PFA
  {
    id: 'mod-survivor-centered-principles',
    title: 'The 4 Inviolable Survivor-Centered Principles',
    track: 'Survivor-Centered & PFA',
    level: 'Practitioner',
    estimatedMinutes: 9,
    description: 'Learn the foundational ethics that govern all humanitarian GBV case management: Safety, Confidentiality, Respect, and Non-Discrimination.',
    imageUrl: '/src/assets/images/gbv_support_counseling_1791740549646.jpg',
    organizationSources: ['UNHCR', 'DRC', 'IASC'],
    learningObjectives: [
      'Operationalize Safety, Confidentiality, Respect, and Non-Discrimination in daily practice.',
      'Distinguish between mandatory reporting vs survivor consent in adult cases.',
      'Implement data confidentiality protocols in community and digital spaces.'
    ],
    content: `The Survivor-Centered Approach is the philosophical bedrock of all humanitarian GBV programming. It places the rights, dignity, wishes, and safety of the survivor at the absolute center of every decision.

### 1. SAFETY (Physical and Emotional Security)
- The primary question at every step: "Is the survivor and their family safe right now?"
- Evaluate perpetrator proximity, risk of retaliation, and safe shelter options before any action.
- Never force an interaction that could expose the survivor to community retaliation.

### 2. CONFIDENTIALITY (Privacy & Data Protection)
- Every piece of survivor information (name, address, story) is confidential.
- Information is shared ONLY on a strict "need-to-know" basis with organizations the survivor has explicitly authorized in writing.
- Adult survivors must NEVER have their details reported to police or community leaders without their informed consent.
- Breaching confidentiality destroys trust and can put the survivor's life in mortal danger.

### 3. RESPECT (Survivor Autonomy & Decision-Making)
- The survivor is the expert on their own life and safety.
- Responders do not tell survivors what to do. Responders provide clear, truthful, objective information about available services (medical, psychosocial, legal, shelter) and respect the survivor's choices.
- If a survivor chooses not to pursue legal action or pauses case management, their choice must be respected without punitive loss of other services.

### 4. NON-DISCRIMINATION (Equitable, Dignified Care)
- Every survivor receives identical high-standard, compassionate care regardless of age, nationality, tribe, sexual orientation, gender identity, religion, marital status, or disability.`,
    keyTakeaways: [
      'Adult survivors must never be forced to report to police or legal authorities.',
      'Confidentiality is an absolute humanitarian duty, not a suggestion.',
      'All services remain available even if the survivor declines police involvement.'
    ],
    quiz: [
      {
        question: 'An adult survivor comes to your protection desk and explicitly asks for medical care but refuses to report the perpetrator to the police. What should you do?',
        options: [
          'Refuse medical referrals until they agree to sign a police statement',
          'Secretly alert the police so the perpetrator does not escape',
          'Respect their decision, uphold confidentiality, and immediately facilitate free clinical care',
          'Call their family elders to convince them to report'
        ],
        correctIndex: 2,
        explanation: 'Under the survivor-centered approach, adult survivors have full autonomy over their legal choices. Medical care is never conditional on police reporting.'
      }
    ]
  },
  {
    id: 'mod-pfa-who-field',
    title: 'Psychological First Aid (PFA): The "Look, Listen, Link" Model',
    track: 'Survivor-Centered & PFA',
    level: 'Practitioner',
    estimatedMinutes: 9,
    description: 'Field-tested psychological first aid framework developed by WHO for frontline responders and community advocates.',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['WHO', 'DRC', 'War Child'],
    learningObjectives: [
      'Apply the WHO "Look, Listen, Link" framework during acute crises.',
      'Recognize severe distress indicators and provide grounding support.',
      'Avoid harmful interventions that re-traumatize survivors.'
    ],
    content: `Psychological First Aid (PFA) describes a humane, supportive response to a fellow human being who is suffering and may need support. It is NOT professional psychiatric therapy; anyone can learn and provide PFA.

### The WHO Framework: LOOK, LISTEN, LINK

#### 1. LOOK
- **Check for safety:** Is the environment safe from ongoing violence or weather?
- **Check for people with urgent basic needs:** Does the survivor have acute physical bleeding, shock, extreme cold, or thirst?
- **Check for people with severe distress reactions:** Are they trembling uncontrollably, disoriented, or catatonic?

#### 2. LISTEN
- **Approach respectfully:** Introduce yourself by name and affiliation.
- **Ask about needs and concerns:** "I am here to support you. Would you like a glass of water or a quiet seat?"
- **Listen calmly:** Do NOT pressure them to recount traumatic details of the assault. Allow silence.
- **Help them feel calm:** Practice slow breathing, grounding exercises (e.g. noticing 5 physical objects in the room).

#### 3. LINK
- **Help address basic needs:** Connect to water, blanket, or secure private room.
- **Connect with services:** Facilitate referrals to clinic (within 72 hours for PEP), psychosocial workers, or safe shelter.
- **Connect with social support:** Help them reach trusted friends, family members, or designated refugee focal points.
- **Provide accurate information:** Explain what happens next in simple, calm language.`,
    keyTakeaways: [
      'PFA is about practical, respectful care and connecting survivors to resources.',
      'Never force someone to describe an assault.',
      'Grounding techniques help restore emotional stabilization after shock.'
    ],
    quiz: [
      {
        question: 'What is a core rule when listening to someone in severe distress during Psychological First Aid?',
        options: [
          'Demand a chronological, detailed timeline of the traumatic event',
          'Tell them everything happens for a reason to make them smile',
          'Listen calmly without pressuring them to talk about details of what happened',
          'Interrupt them frequently to give personal life advice'
        ],
        correctIndex: 2,
        explanation: 'Frontline PFA responders must never interrogate or pressure survivors to re-tell traumatic memories, as this can trigger secondary traumatization.'
      }
    ]
  },
  {
    id: 'mod-trauma-communication',
    title: 'Trauma-Informed Communication: What to Say and What NEVER to Say',
    track: 'Survivor-Centered & PFA',
    level: 'Practitioner',
    estimatedMinutes: 8,
    description: 'Concrete verbal guidelines, active listening behaviors, and phrasing protocols for speaking with trauma survivors.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'DRC', 'Panzi Foundation'],
    learningObjectives: [
      'Identify empowering versus stigmatizing language.',
      'Memorize helpful, trauma-informed response phrases.',
      'Avoid cliché statements that invalidate survivor pain.'
    ],
    content: `The words used by first responders and community allies in the first minutes and hours following an incident can profoundly shape a survivor’s psychological trajectory.

### What TO Say (Empowering, Compassionate, Grounding):
- *"I believe you."* (Validates reality and combats self-doubt).
- *"It took enormous courage to tell me this. You are safe here."*
- *"None of this is your fault. You did nothing wrong."*
- *"You are in control of what happens next. I am here to help you explore your options."*
- *"Would you like a sip of water or a blanket?"*
- *"Take all the time you need. We do not have to rush."*

### What NEVER to Say (Harmful, Invalidating, Victim-Blaming):
- *"Why were you out so late? Why were you wearing that?"* (Blames the victim).
- *"Are you sure it wasn't just a misunderstanding?"* (Minimizes criminal violence).
- *"You should have fought harder or screamed."* (Ignores tonic immobility).
- *"You need to move on and be strong for your children."* (Silences grief and shock).
- *"I know exactly how you feel."* (Centers the responder instead of the survivor).
- *"Everything happens for a reason."* (Cruel theological or philosophical rationalization).

### Body Language Principles:
- Maintain open, non-confrontational posture.
- Sit at the same eye level as the survivor (never stand over them).
- Maintain gentle, respectful eye contact without staring.
- Keep vocal tone calm, soft, and unhurried.`,
    keyTakeaways: [
      '"I believe you" and "It is not your fault" are the most healing words a survivor can hear.',
      'Never judge clothing, timing, or emotional reactions.',
      'Eye level and calm pacing communicate physical safety.'
    ],
    quiz: [
      {
        question: 'Which of the following is the most supportive statement to make to someone who just disclosed sexual assault?',
        options: [
          '"You need to be strong and stop crying so we can fill the forms."',
          '"I believe you, you are safe here, and this was not your fault."',
          '"Why didn’t you call for help right when it happened?"',
          '"At least it wasn’t worse."'
        ],
        correctIndex: 1,
        explanation: 'Affirming belief, safety, and non-culpability directly counteracts the guilt, self-blame, and terror common in acute trauma.'
      }
    ]
  },

  // TRACK 3: CLINICAL CMR & 72H GOLDEN WINDOW
  {
    id: 'mod-pep-72h-golden-window',
    title: 'The Critical 72-Hour Medical Golden Window: HIV PEP & Contraception',
    track: 'Clinical CMR & 72h Golden Window',
    level: 'Practitioner',
    estimatedMinutes: 10,
    description: 'In-depth clinical guide on Post-Exposure Prophylaxis (PEP), emergency contraception, and life-saving protocols.',
    imageUrl: '/src/assets/images/gbv_medical_clinic_1791740560176.jpg',
    organizationSources: ['WHO', 'UNHCR', 'IRC', 'MSF'],
    learningObjectives: [
      'Explain the mechanism and timeline of HIV Post-Exposure Prophylaxis (PEP).',
      'Describe emergency contraception efficacy windows (up to 120 hours).',
      'Explain why medical care must precede police or legal filing.'
    ],
    content: `In cases of sexual assault and penetrative rape, medical care is an emergency with strict physiological time limits.

### 1. Post-Exposure Prophylaxis (PEP) — The 72-Hour Rule
- **What is PEP?** A short 28-day course of antiretroviral medications that prevents HIV from taking hold in the human immune system after exposure.
- **The Critical Window:** PEP MUST be started within **72 hours (3 days)** of the assault. The sooner it is initiated (ideally within 2 to 24 hours), the higher the protective efficacy (over 80-90%).
- **Starter Packs:** At IRC Kalobeyei Super Clinic and Kakuma General Mission Hospital, healthcare workers provide PEP immediately upon arrival. Clinicians do NOT delay medication while waiting for laboratory confirmation.

### 2. Emergency Contraception (ECP) — Preventing Unintended Pregnancy
- **The Window:** Emergency contraceptive pills (such as levonorgestrel) are effective up to **120 hours (5 days)** after unprotected sexual intercourse.
- **Optimal Efficacy:** Efficacy is highest when taken within the first 24 to 72 hours.
- Medical staff assess pregnancy risk and administer emergency contraception with non-judgmental dignity.

### 3. Preserving Clinical Evidence (When Possible)
Survivors should be informed that if they wish to have forensic evidence collected:
- Avoid bathing, washing genitalia, brushing teeth (in oral penetration), or douching before the clinical exam.
- Place clothes worn during the assault in a clean paper bag (not plastic, which traps moisture and degrades DNA).
- **Crucial Clarification:** If the survivor has already bathed or changed clothes, THEY MUST STILL GO TO THE CLINIC IMMEDIATELY! Medical care and PEP remain life-saving regardless of evidence preservation.`,
    keyTakeaways: [
      'PEP must start within 72 hours to prevent HIV.',
      'Emergency contraception works up to 120 hours (5 days).',
      'Even if a survivor has washed or changed clothes, PEP and clinical treatment are still fully accessible.'
    ],
    quiz: [
      {
        question: 'What is the absolute maximum time limit to begin Post-Exposure Prophylaxis (PEP) after potential HIV exposure?',
        options: [
          '24 hours',
          '72 hours (3 days)',
          '1 week (7 days)',
          '1 month (30 days)'
        ],
        correctIndex: 1,
        explanation: 'According to WHO guidelines, PEP must be started within 72 hours of potential HIV exposure to effectively inhibit viral replication.'
      },
      {
        question: 'A survivor took a bath immediately after an assault because they felt dirty. Can they still receive emergency medical care at the clinic?',
        options: [
          'No, clinicians cannot assist anyone who has bathed',
          'Yes, absolutely. PEP, STI prophylaxis, and healthcare are fully provided regardless of whether they bathed',
          'Only if they bring police officers with them',
          'Only if they wait 2 weeks for test results'
        ],
        correctIndex: 1,
        explanation: 'Medical care is always provided! While bathing affects forensic DNA collection, it does not diminish the urgent medical need for HIV PEP and STI prevention.'
      }
    ]
  },
  {
    id: 'mod-sti-tetanus-wound-care',
    title: 'STI Prophylaxis, Hepatitis B, Tetanus & Clinical Wound Triage',
    track: 'Clinical CMR & 72h Golden Window',
    level: 'Practitioner',
    estimatedMinutes: 8,
    description: 'Comprehensive medical overview of comprehensive clinical care: syndromic STI management, vaccinations, and laceration triage.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['WHO', 'MSF', 'IRC'],
    learningObjectives: [
      'Understand the syndromic treatment package for sexually transmitted infections.',
      'Recognize the importance of Tetanus and Hepatitis B vaccination.',
      'Explain physical wound and soft tissue triage for survivors.'
    ],
    content: `Beyond HIV and pregnancy, sexual violence exposes survivors to multiple acute clinical risks that require systematic preventive therapy.

### 1. Syndromic Management of STIs
Rather than waiting days for bacterial cultures, WHO clinical guidelines mandate presumptive (preventive) treatment for common sexually transmitted infections upon presentation:
- **Chlamydia & Gonorrhea:** Single-dose antibiotic therapy (e.g. Cefixime/Ceftriaxone + Azithromycin).
- **Trichomoniasis:** Metronidazole dose.
- **Syphilis:** Serological screening and Penicillin treatment if indicated.

### 2. Immunizations
- **Tetanus Toxoid:** Administered to prevent lockjaw and fatal bacterial infection, especially if physical struggle resulted in abrasions, lacerations, or bites.
- **Hepatitis B Vaccine:** Administered on Day 1 (first dose of a standard 3-dose course) to prevent viral Hepatitis B transmission.

### 3. Physical Trauma & Wound Triage
- Inspection and suturing of perineal, vaginal, or anal tears under sterile, pain-managed conditions.
- Documentation of contusions, bite marks, strangulation petechiae, and blunt trauma.
- Free analgesic medication for pain relief.`,
    keyTakeaways: [
      'Presumptive antibiotic treatment prevents lifelong pelvic inflammatory disease and infertility.',
      'Tetanus and Hepatitis B immunizations are administered on day of presentation.',
      'All clinical treatments at humanitarian camp clinics are provided at zero cost.'
    ],
    quiz: [
      {
        question: 'Why do clinicians administer presumptive STI antibiotics even before laboratory tests come back?',
        options: [
          'Because labs are completely unavailable in humanitarian settings',
          'To eradicate common STIs immediately and prevent severe complications like Pelvic Inflammatory Disease',
          'To punish the patient',
          'Because antibiotics cure viral infections'
        ],
        correctIndex: 1,
        explanation: 'Presumptive syndromic management ensures that common bacterial STIs (Gonorrhea, Chlamydia, Trichomonas) are eradicated immediately before causing permanent reproductive tract damage.'
      }
    ]
  },
  {
    id: 'mod-forensics-p3-form',
    title: 'Forensic Evidence, Medico-Legal Examination & The Kenyan P3 Form',
    track: 'Clinical CMR & 72h Golden Window',
    level: 'Advanced',
    estimatedMinutes: 9,
    description: 'Understand the legal-medical bridge: chain of custody, physical evidence collection, and the police P3 form.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['Government of Kenya', 'UNHCR Legal Aid', 'Kituo Cha Sheria'],
    learningObjectives: [
      'Define the role of the Police Medical Examination Form (P3) in Kenya.',
      'Explain the legal chain of custody for biological evidence.',
      'Know that clinical treatment is NEVER delayed while waiting for a P3 form.'
    ],
    content: `In Kenya, the primary legal document connecting clinical injuries to criminal court proceedings is the **P3 Form (Police Medical Examination Form)**.

### What is the P3 Form?
The P3 form is an official government legal document used by police and the Directorate of Public Prosecutions (ODPP) to record medical evidence of assault, bodily harm, and sexual offences for court trials.

### The Standard Sequence (How It Should Work):
1. **Medical Care First:** The survivor attends the clinic and receives immediate PEP, wound care, and medical stabilization.
2. **Clinical Notes:** The examining medical officer records detailed clinical notes, diagrams of contusions, and forensic findings in the patient's confidential file.
3. **P3 Form Completion:** If the survivor decides to report to police, police issue a blank P3 form. An authorized registered medical officer or clinician transcribes the medical findings onto the P3 form, stamps it, and signs it.
4. **Free of Charge:** Under Kenyan Ministry of Health directives, filling the P3 form for survivors of sexual offences is **100% FREE** at public facilities. Charging survivors for a P3 form in sexual offences is illegal.

### Chain of Custody:
Any collected swabs, clothing, or biological evidence must be documented with strict custody tracking (who collected it, who sealed it, who delivered it to the Government Chemist). If the chain is broken, evidence may be ruled inadmissible in court.`,
    keyTakeaways: [
      'Medical triage always precedes P3 paperwork.',
      'Filling the P3 form for sexual violence is free under Kenyan law.',
      'The P3 form is essential evidence in court trials to prove penetration and physical trauma.'
    ],
    quiz: [
      {
        question: 'Under Kenyan law and Ministry of Health directives, how much should a survivor pay for a clinician to fill out a P3 form for a sexual offence?',
        options: [
          '5,000 Kenyan Shillings',
          'It is completely free of charge',
          'A fee determined by the local village chief',
          '50 US Dollars'
        ],
        correctIndex: 1,
        explanation: 'Kenyan law and directives stipulate that medical examination and P3 form completion for sexual offences must be provided free of charge to survivors.'
      }
    ]
  },

  // TRACK 4: PANZI 4-PILLAR MODEL (DRC)
  {
    id: 'mod-panzi-medical-psychological',
    title: 'The Panzi Model (Part 1): Medical Excellence & Deep Trauma Healing',
    track: 'Panzi 4-Pillar Model (DRC)',
    level: 'Advanced',
    estimatedMinutes: 9,
    description: 'How Nobel Laureate Dr. Denis Mukwege developed an integrated holistic recovery model for conflict-related sexual violence in eastern DRC.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['Panzi Foundation', 'Dr. Denis Mukwege', 'UNHCR DRC'],
    learningObjectives: [
      'Describe the origin and philosophy of the Panzi Holistic Healing Model in Bukavu, DRC.',
      'Explain Pillar 1 (Advanced Medical Care) and Pillar 2 (Psychological Therapy).',
      'Understand how treating the mind and body simultaneously accelerates recovery.'
    ],
    content: `Founded in 1999 by Dr. Denis Mukwege (2018 Nobel Peace Prize Laureate) in Bukavu, South Kivu (Democratic Republic of Congo), the Panzi Hospital and Foundation has treated over 80,000 survivors of sexual violence and complex gynecological trauma.

### The Guiding Philosophy: One-Stop Integrated Healing
Dr. Mukwege realized that stitching physical wounds without addressing psychological terror, social ostracization, and legal impunity meant survivors would relapse into poverty and despair. Panzi pioneered the **One-Stop Center**, where four pillars operate under one coordinated system.

### PILLAR 1: MEDICAL RECONSTRUCTION
- Emergency clinical triage and infection treatment.
- World-renowned reconstructive gynecological surgery for obstetric and traumatic fistulas (tears between the vagina and bladder/rectum caused by violent assault).
- Long-term physical therapy and nutritional rehabilitation.

### PILLAR 2: PSYCHOLOGICAL HEALING
- Individual psychotherapy for Post-Traumatic Stress Disorder (PTSD), severe depression, and anxiety.
- Group therapy and safe survivor solidarity circles (Maison Dorcas).
- Expressive art therapy, dance, and music therapy to release somatic trauma stored in the body.
- Specialized support for children born of rape and their mothers.`,
    keyTakeaways: [
      'Panzi proved that medical repair alone is insufficient without trauma therapy and economic autonomy.',
      'Obstetric and traumatic fistula surgery restores physical continence and dignity.',
      'Safe collective healing circles build solidarity among survivors.'
    ],
    quiz: [
      {
        question: 'Who founded the Panzi Model for holistic healing of survivors of sexual violence in the Democratic Republic of Congo?',
        options: [
          'Nelson Mandela',
          'Dr. Denis Mukwege (2018 Nobel Peace Prize Laureate)',
          'Kofi Annan',
          'Wangari Maathai'
        ],
        correctIndex: 1,
        explanation: 'Dr. Denis Mukwege founded Panzi Hospital in Bukavu, DRC, and was awarded the 2018 Nobel Peace Prize for his life-saving work treating survivors.'
      }
    ]
  },
  {
    id: 'mod-panzi-socioeconomic-legal',
    title: 'The Panzi Model (Part 2): Socioeconomic Independence & Ending Impunity',
    track: 'Panzi 4-Pillar Model (DRC)',
    level: 'Advanced',
    estimatedMinutes: 9,
    description: 'Explore Pillars 3 and 4: Livelihood independence through VSLAs and legal accountability through mobile courts.',
    imageUrl: '/src/assets/images/gbv_women_empowerment_1791740574783.jpg',
    organizationSources: ['Panzi Foundation', 'DRC Justice Cluster', 'UN Women'],
    learningObjectives: [
      'Explain Pillar 3: Village Savings and Loans Associations (VSLA) and vocational training.',
      'Explain Pillar 4: Free legal assistance, evidence preservation, and mobile courts.',
      'Analyze how economic autonomy protects survivors from re-victimization.'
    ],
    content: `### PILLAR 3: SOCIOECONOMIC REINTEGRATION
When survivors are economically dependent on abusers or families that reject them due to stigma, they are vulnerable to repeated exploitation.
- **Vocational Skills:** Apprenticeships in tailoring, agriculture, culinary arts, soap-making, and technology.
- **Village Savings and Loans Associations (VSLA):** Micro-lending collectives owned and managed entirely by women survivors. Members pool savings, provide micro-loans for small businesses, and achieve financial sovereignty.
- **Education for Children:** School fee subsidies and supplies for children so mothers can build sustainable livelihoods.

### PILLAR 4: LEGAL ASSISTANCE & COMBATING IMPUNITY
Without justice, perpetrators continue terrorizing communities with complete impunity.
- **Free Legal Counsel:** Human rights lawyers represent survivors in military and civilian courts at zero cost.
- **Mobile Court Hearings:** Bringing judges, prosecutors, and forensic experts directly to remote rural zones to hold public trials close to affected communities.
- **Forensic Archiving:** Meticulous documentation of war crimes and atrocities submitted to national courts and the International Criminal Court (ICC).
- **Survivor-Led Advocacy:** Supporting survivor networks (e.g. Mouvement National des Survivantes de VSV en RDC) to demand national reparations and legal reform.`,
    keyTakeaways: [
      'Financial independence is one of the most effective shields against recurring abuse.',
      'Mobile courts bring judicial accountability directly to rural and displaced communities.',
      'Survivors are empowered from victims into advocates for justice and human rights.'
    ],
    quiz: [
      {
        question: 'Why does the Panzi Model consider Socioeconomic Reintegration (Pillar 3) essential to preventing GBV relapse?',
        options: [
          'To generate tax revenue for the local government',
          'Because economic independence prevents survivors from having to return to abusers or face starvation',
          'To replace medical treatment completely',
          'To fund the construction of large sports arenas'
        ],
        correctIndex: 1,
        explanation: 'Economic autonomy ensures survivors can feed themselves and their children without remaining dependent on abusers or being forced into exploitative survival sex.'
      }
    ]
  },

  // TRACK 5: PSEA & HUMANITARIAN ACCOUNTABILITY
  {
    id: 'mod-psea-core-principles',
    title: 'PSEA: The 6 Core UN/IASC Rules for Aid Workers and Contractors',
    track: 'PSEA & Humanitarian Accountability',
    level: 'Practitioner',
    estimatedMinutes: 9,
    description: 'Detailed analysis of UN Secretary-General Bulletin ST/SGB/2003/13: Zero tolerance for sexual exploitation and abuse.',
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'IASC', 'DRC', 'UN Secretary-General'],
    learningObjectives: [
      'Define Sexual Exploitation and Sexual Abuse (SEA) in humanitarian work.',
      'Recite the 6 core UN Secretary-General PSEA principles.',
      'Explain why humanitarian assistance is 100% unconditional.'
    ],
    content: `Prevention of Sexual Exploitation and Abuse (PSEA) refers to the absolute duty of all aid workers, UN personnel, NGO staff, security guards, and contractors to never abuse their positions of power over affected populations.

### Core Definitions:
- **Sexual Exploitation:** Any actual or attempted abuse of a position of vulnerability, differential power, or trust, for sexual purposes, including profiting monetarily, socially, or politically from the sexual exploitation of another.
- **Sexual Abuse:** The actual or threatened physical intrusion of a sexual nature, whether by force or under unequal or coercive conditions.

### The 6 Core UN/IASC PSEA Rules:
1. **Gross Misconduct:** SEA constitutes acts of gross misconduct and is grounds for immediate termination of employment, debarment, and criminal prosecution.
2. **No Sex with Minors:** Sexual activity with anyone under 18 years is strictly prohibited; ignorance or mistake of age is no defense.
3. **No Exchange of Aid for Sex:** Exchange of money, employment, food rations, shelter, blankets, SIM cards, or tokens for sex is strictly prohibited.
4. **Power Imbalance Relationships:** Any sexual relationships between humanitarian workers and beneficiaries based on unequal power are strongly discouraged and subject to strict disciplinary scrutiny.
5. **Mandatory Reporting:** Every aid worker is obligated to immediately report any suspected SEA to designated focal points.
6. **Supportive Environment:** Humanitarian managers must create safe environments that foster reporting without fear of retaliation.`,
    keyTakeaways: [
      'Humanitarian aid is completely free; asking for personal favors is a criminal violation.',
      'Age of consent in humanitarian work is strictly 18 years.',
      'All personnel have a mandatory duty to report suspected SEA.'
    ],
    quiz: [
      {
        question: 'An aid worker at a camp distribution point offers to fast-track a woman’s food ration in exchange for meeting him at his private quarters. This is an example of:',
        options: [
          'A friendly cultural accommodation',
          'Sexual Exploitation (a severe PSEA violation)',
          'Standard priority processing',
          'An informal barter agreement'
        ],
        correctIndex: 1,
        explanation: 'Exchanging or conditioning humanitarian assistance on sexual favors or private meetings is a severe case of Sexual Exploitation and a direct violation of UN/IASC standards.'
      }
    ]
  },
  {
    id: 'mod-psea-reporting-channels',
    title: 'PSEA Safe Reporting Channels & Whistleblower Protections',
    track: 'PSEA & Humanitarian Accountability',
    level: 'Practitioner',
    estimatedMinutes: 8,
    description: 'How beneficiaries and whistleblowers can safely report abuse without fear of losing aid or facing retaliation.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR Inspector General’s Office (IGO)', 'DRC Compliance'],
    learningObjectives: [
      'Identify dedicated, confidential channels for reporting aid worker misconduct.',
      'Understand whistleblower protections against retaliation and ration cuts.',
      'Explain how independent investigation units protect victim safety.'
    ],
    content: `Many refugee survivors of humanitarian exploitation stay silent because they fear aid workers will cut off their family's food rations, cancel their refugee registration, or deport them.

### The Truth: Your Aid CANNOT Be Cancelled
- Aid entitlement is determined by UNHCR and the World Food Programme (WFP) based on humanitarian vulnerability, NOT individual staff members.
- Whistleblower and victim protections guarantee that reporting misconduct **will never result in loss of food, shelter, or status**.
- Retaliation against any person who reports SEA is grounds for immediate termination of the retaliator's employment.

### Official Reporting Channels:
1. **UNHCR Toll-Free Helpline:** Dial **1517** (Kakuma/Kalobeyei) — operates 24/7 with confidential multi-lingual operators.
2. **DRC Toll-Free Legal Desk:** Dial **0800720414** for independent advice.
3. **UNHCR Inspector General’s Office (IGO) in Geneva:**
   - Email: **inspector@unhcr.org**
   - Confidential Web Form: Directly accessible without going through camp staff.
4. **Independent Physical Suggestion Boxes:** Locked metal boxes placed outside NGO offices, emptied ONLY by designated international PSEA monitors.`,
    keyTakeaways: [
      'No aid worker has the power to cancel your refugee ration for reporting abuse.',
      'Whistleblowers and survivors are protected by international anti-retaliation policies.',
      'Reports to 1517 and inspector@unhcr.org go directly to independent investigators.'
    ],
    quiz: [
      {
        question: 'If a refugee reports a corrupt NGO worker for sexual exploitation, can their food ration card be revoked?',
        options: [
          'Yes, the NGO worker has full control over the camp database',
          'No. Aid entitlements are legally protected, and retaliation against victims is strictly prohibited',
          'Only if the complaint is not proven within 24 hours',
          'Yes, all aid is halted during investigations'
        ],
        correctIndex: 1,
        explanation: 'UNHCR and donor regulations strictly forbid retaliation; aid is unconditionally protected, and independent investigators handle complaints.'
      }
    ]
  },

  // TRACK 6: TRADITIONAL PRACTICES & CHILD PROTECTION
  {
    id: 'mod-fgm-medical-legal',
    title: 'Female Genital Mutilation / Cutting (FGM/C): Typology, Medical Realities & Laws',
    track: 'Traditional Practices & Child Protection',
    level: 'Foundational',
    estimatedMinutes: 9,
    description: 'Comprehensive medical and legal analysis of FGM/C: the 4 WHO types, lifelong health risks, and Kenyan criminal penalties.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['WHO', 'UNICEF', 'UNFPA', 'Kenya Anti-FGM Board'],
    learningObjectives: [
      'Classify the 4 WHO types of Female Genital Mutilation.',
      'Explain acute and chronic health complications of FGM/C.',
      'Know the penalties under the Kenya Prohibition of FGM Act 2011.'
    ],
    content: `Female Genital Mutilation (FGM) comprises all procedures involving the partial or total removal of the external female genitalia or other injury to the female genital organs for non-medical reasons. It has NO health benefits and causes severe physical and psychological harm.

### The 4 WHO Types:
- **Type 1 (Clitoridectomy):** Partial or total removal of the clitoral glans and/or the prepuce/clitoral hood.
- **Type 2 (Excision):** Partial or total removal of the clitoral glans and the labia minora, with or without excision of the labia majora.
- **Type 3 (Infibulation):** Narrowing of the vaginal orifice with creation of a covering seal by cutting and repositioning the labia minora and/or labia majora, sometimes through stitching.
- **Type 4 (Other):** All other harmful procedures to the female genitalia for non-medical purposes (pricking, piercing, incising, scraping, and cauterization).

### Medical Complications:
- **Immediate:** Severe pain, hemorrhage (fatal bleeding), bacterial infection, tetanus, urinary retention, and shock.
- **Long-Term:** Chronic urinary infections, painful menstruation (dysmenorrhea), keloid scar formation, sexual dysfunction (anorgasmia, dyspareunia), obstetric complications (obstructed labor, fistula, newborn mortality).

### Kenyan Law (Prohibition of FGM Act 2011):
- Performing, aiding, or abetting FGM is a criminal offence punishable by a minimum of 3 years imprisonment and fines up to KES 200,000.
- If FGM causes the death of the girl, the perpetrator faces life imprisonment.
- Medicalized FGM (doctors or nurses performing cutting in clinics) is strictly illegal and leads to revocation of medical licenses.`,
    keyTakeaways: [
      'FGM has zero medical benefits and causes severe lifelong obstetric complications.',
      'Performing or assisting FGM carries a minimum 3-year prison sentence in Kenya.',
      'Medicalized FGM in clinics is strictly illegal.'
    ],
    quiz: [
      {
        question: 'Under the Kenya Prohibition of Female Genital Mutilation Act 2011, what is the legal consequence of performing FGM?',
        options: [
          'A verbal warning from community elders',
          'A minimum of 3 years imprisonment and substantial financial fines',
          'A minor fine payable in livestock',
          'No legal penalty if performed in a private residence'
        ],
        correctIndex: 1,
        explanation: 'The Prohibition of FGM Act 2011 mandates a minimum custodial sentence of 3 years imprisonment for performing or abetting FGM.'
      }
    ]
  },
  {
    id: 'mod-cefm-child-marriage',
    title: 'Child, Early & Forced Marriage (CEFM): Health Impacts & Protection Pathways',
    track: 'Traditional Practices & Child Protection',
    level: 'Foundational',
    estimatedMinutes: 8,
    description: 'Analyze early marriage through health, human rights, and legal lenses: preventing bride price commodification and protecting adolescent girls.',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNICEF', 'Girls Not Brides', 'UNHCR'],
    learningObjectives: [
      'Define child marriage under international and Kenyan law (under 18).',
      'Explain obstetric risks of early pregnancy on undeveloped adolescent bodies.',
      'Detail legal rescue mechanisms for girls facing imminent forced marriage.'
    ],
    content: `Child marriage is defined as any formal marriage or informal union between a child under the age of 18 and an adult or another child.

### Why Child Marriage is a Severe Form of GBV:
- **Inability to Consent:** Minors do not possess the developmental or legal capacity to give informed consent to marriage.
- **Economic Transaction:** In displacement contexts, families under extreme economic hardship sometimes marry off young daughters to collect bride price or reduce the number of mouths to feed.
- **Denial of Education:** Early marriage immediately halts a girl's schooling, trapping her in generational poverty.

### Severe Medical Realities:
- Adolescent girls aged 15-19 are twice as likely to die in childbirth as women in their twenties; girls under 15 are five times more likely to die.
- The adolescent pelvis is not fully grown. Early labor frequently causes **obstructed labor**, leading to **obstetric fistula** (uncontrollable leakage of urine and feces) and permanent nerve damage.

### Legal Protections in Kenya:
- **Children Act 2022 & Marriage Act 2014:** The legal age of marriage for all Kenyan citizens and residents (including refugees) is strictly **18 years**.
- Parents, religious leaders, and spouses involved in marrying off minors commit a felony.
- Protection desks and police can issue emergency rescue orders to place girls in secure boarding schools and safe shelters.`,
    keyTakeaways: [
      'Legal minimum age for marriage in Kenya is strictly 18 years without exception.',
      'Early pregnancy carries high risks of obstetric fistula and maternal death.',
      'Refugee children have the right to emergency protection desks and safe shelter.'
    ],
    quiz: [
      {
        question: 'Under Kenyan law (Marriage Act 2014 and Children Act 2022), what is the minimum legal age for marriage?',
        options: [
          '14 years with parental blessing',
          '16 years if traditional custom permits',
          '18 years without exception',
          '21 years'
        ],
        correctIndex: 2,
        explanation: 'Kenyan statutory law sets the minimum legal age of marriage strictly at 18 years; child marriage is a criminal offense.'
      }
    ]
  },
  {
    id: 'mod-bid-child-survivors',
    title: 'Supporting Child Survivors & The Best Interests Determination (BID) Protocol',
    track: 'Traditional Practices & Child Protection',
    level: 'Advanced',
    estimatedMinutes: 9,
    description: 'Humanitarian protocols for child and adolescent survivors: the UNHCR Best Interests Determination (BID) and child-friendly case management.',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR Child Protection', 'UNICEF'],
    learningObjectives: [
      'Define Best Interests Assessment (BIA) vs. Best Interests Determination (BID).',
      'Explain informed assent for minors vs informed consent by parents/guardians.',
      'Navigate conflicts of interest when the perpetrator is a parent or family guardian.'
    ],
    content: `When a survivor of GBV is a child (under 18 years), standard case management protocols adapt to prioritize child safeguarding and international child rights frameworks.

### Best Interests Assessment (BIA) & Determination (BID):
- **BIA:** A rapid, continuous assessment by child protection caseworkers to evaluate a child's immediate safety, family situation, and risks.
- **BID:** A formal multi-disciplinary process (involving child protection officers, caseworkers, legal specialists, and UNHCR) that makes decisions regarding significant life changes for the child (e.g. alternative care placement, legal proceedings, resettlement).

### Consent vs. Assent:
- **Informed Consent:** Legally provided by the parent or certified legal guardian.
- **Informed Assent:** Provided by the child. Even if parents consent, the child must be informed in age-appropriate, child-friendly language and agree to medical examinations and psychosocial support.

### Guardian Conflicts of Interest:
If the perpetrator is a parent, relative, or household guardian:
- Do NOT inform the guardian if doing so would endanger the child.
- Engage designated Child Protection Officers (UNHCR/UNICEF/DRC) to appoint an independent case guardian and arrange protective emergency foster placement.`,
    keyTakeaways: [
      'The best interests of the child are the paramount consideration in all decisions.',
      'Never inform an abusive parent or guardian if it puts the child at risk.',
      'Child-friendly language and emotional assent are required before medical exams.'
    ],
    quiz: [
      {
        question: 'What must a caseworker do if a child discloses that their own father or guardian is sexually abusing them?',
        options: [
          'Call the father immediately to discuss family harmony',
          'Do NOT notify the abusive guardian; immediately activate UNHCR Child Protection BID protocol and emergency safe haven placement',
          'Wait until the child turns 18 before taking any action',
          'Tell the child to pray and obey their guardian'
        ],
        correctIndex: 1,
        explanation: 'Under UNHCR Child Protection SOPs, when the guardian is the alleged abuser, notifying them puts the child in mortal danger. Independent child safeguarding and safe shelter must be mobilized immediately.'
      }
    ]
  },

  // TRACK 7: LEGAL FRAMEWORKS & FORMAL JUSTICE
  {
    id: 'mod-formal-justice-vs-maslah',
    title: 'Why Traditional "Maslah" Kangaroo Courts Must Never Adjudicate GBV',
    track: 'Legal Frameworks & Formal Justice',
    level: 'Foundational',
    estimatedMinutes: 9,
    description: 'Examine why customary dispute arbitration ("Maslah") violates international law and how formal Kenyan justice protects survivors.',
    imageUrl: 'https://images.unsplash.com/photo-1453733190028-57a51ce3dacb?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['Kenya Judiciary', 'UNHCR Legal Aid', 'Kituo Cha Sheria'],
    learningObjectives: [
      'Define "Maslah" and traditional clan arbitration systems.',
      'Explain Section 43 of Kenya’s Sexual Offences Act prohibiting out-of-court settlements.',
      'Compare survivor outcomes in formal justice versus clan arbitration.'
    ],
    content: `In many pastoral and refugee communities across northern Kenya, Somalia, South Sudan, and the DRC border, customary justice mechanisms—commonly known as **Maslah** or village elder courts—are used to settle civil disputes (such as livestock theft or land boundaries).

However, using Maslah to settle sexual offences and severe GBV is **strictly illegal and deeply destructive**.

### Why Maslah Fails and Harms GBV Survivors:
1. **Perpetrator Impunity:** Maslah treats rape as an offence against the clan's honor or family wealth, NOT an offence against the survivor's body.
2. **Payment to Men:** Fines (camels, goats, or cash) are paid to the survivor’s male relatives or clan elders. The survivor receives zero compensation.
3. **Forced Marriage to Rapist:** In extreme customary rulings, elders force the survivor to marry the rapist to "cleanse clan shame," locking the victim in lifelong enslavement with their abuser.
4. **Repeat Offences:** Because the rapist is never imprisoned, they remain in the community free to assault others.

### The Law in Kenya:
- **Section 43 of the Sexual Offences Act (2006):** Explicitly makes it a criminal offence for anyone to negotiate, settle, arbitrate, or compound a sexual offence out of court.
- Elders, parents, and mediators who facilitate Maslah settlements for rape or defilement can be arrested and prosecuted as accomplices to the crime.
- Every refugee has the right to free legal representation through DRC, UNHCR, and Kituo Cha Sheria in formal Kenyan Magistrate Courts.`,
    keyTakeaways: [
      'Settling rape through livestock or money violates Section 43 of the Sexual Offences Act.',
      'Elders who arbitrate sexual offences can be arrested and prosecuted.',
      'Refugees are entitled to free formal legal aid through UNHCR and partner organizations.'
    ],
    quiz: [
      {
        question: 'Under Kenyan law, what is the legal status of customary "Maslah" agreements to settle a sexual offence with livestock or money?',
        options: [
          'It is officially recognized as a valid alternative dispute mechanism',
          'It is completely illegal under Section 43 of the Sexual Offences Act and mediators can be prosecuted',
          'It is allowed if the village chief signs the receipt',
          'It is permitted for non-citizens only'
        ],
        correctIndex: 1,
        explanation: 'Section 43 of the Sexual Offences Act outlaws any out-of-court compounding or settlement of sexual offences, making customary arbitration criminal.'
      }
    ]
  },
  {
    id: 'mod-legal-rights-protection-orders',
    title: 'Legal Rights, Restraining Orders & Safe Escorts in Kenya',
    track: 'Legal Frameworks & Formal Justice',
    level: 'Practitioner',
    estimatedMinutes: 8,
    description: 'Learn how the Protection Against Domestic Violence Act (PADVA) enables emergency protection orders and safe relocation.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['Government of Kenya', 'UNHCR Legal Aid'],
    learningObjectives: [
      'Utilize Protection Orders under the Protection Against Domestic Violence Act (PADVA 2015).',
      'Explain police duties under the National Police Service Gender Desk.',
      'Detail safe relocation and witness protection pathways in refugee camps.'
    ],
    content: `Survivors of domestic violence and stalking in Kenya have legal instruments designed to physically remove perpetrators and protect families.

### 1. Protection Against Domestic Violence Act (PADVA 2015)
PADVA provides rapid civil remedies without requiring a lengthy criminal trial:
- **Protection Orders:** A court order barring the abuser from entering the shared residence, approaching within a specified distance, or contacting the survivor.
- **Eviction Orders:** The court can order the perpetrator to vacate the family shelter, even if the perpetrator claims ownership of the structure.
- **Custody Orders:** Immediate temporary custody of children awarded to the non-abusive parent.

### 2. The Police Gender Desk
Every police station in Kenya (including Kakuma Police Station) is mandated to maintain a dedicated **Gender Desk**:
- Staffed by officers trained in handling trauma and sexual offences.
- Private intake room for giving statements away from public view.
- Issuance of formal OB (Occurrence Book) numbers and free P3 forms.

### 3. Safe Escorts & Temporary Shelters:
- In cases of active threats, DRC and UNHCR arrange **safe havens** and secure escorts to safe houses in Kakuma or transit facilities in Nairobi.`,
    keyTakeaways: [
      'PADVA allows courts to evict an abuser from the family home.',
      'Police Gender Desks provide private statement recording and OB numbers.',
      'Emergency safe haven relocation is available for high-risk survivors.'
    ],
    quiz: [
      {
        question: 'Under the Protection Against Domestic Violence Act (PADVA 2015), what can a court order do?',
        options: [
          'Force the survivor to reconcile with the abuser',
          'Order the perpetrator to immediately vacate the residence and stay away from the survivor',
          'Cancel the survivor’s national ID card',
          'Confiscate all household food rations'
        ],
        correctIndex: 1,
        explanation: 'PADVA allows courts to issue restraining and eviction orders that remove the abuser from the home and forbid contact.'
      }
    ]
  },

  // TRACK 8: DIVERSITY, DISABILITY & INCLUSION
  {
    id: 'mod-lgbtiq-protection-displacement',
    title: 'LGBTIQ+ Refugee Protection: Human Rights, Safeguards & Safe Havens',
    track: 'Diversity, Disability & Inclusion',
    level: 'Foundational',
    estimatedMinutes: 9,
    description: 'Specific protection mandates, vulnerability profiles, and confidential referral safeguards for LGBTIQ+ refugees.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'ILGA World', 'DRC Protection'],
    learningObjectives: [
      'Understand UNHCR’s protection mandate regarding sexual orientation and gender identity.',
      'Identify acute risks of targeted mob violence and secondary migration.',
      'Apply strict confidentiality and safe housing protocols.'
    ],
    content: `LGBTIQ+ (Lesbian, Gay, Bisexual, Transgender, Intersex, and Queer) refugees face heightened, compounding risks of discrimination, physical assault, targeted arson, and social ostracization in displacement settings.

### 1. UNHCR Protection Mandate
- UNHCR is mandated to protect ALL refugees without discrimination based on sexual orientation, gender identity, or sex characteristics.
- Under international human rights law, violence targeted at an individual because of their real or perceived sexual orientation is a severe form of Gender-Based Violence.

### 2. Specific Protection Risks in Camp Settings:
- **Mob Violence & Arson:** Communal shelters and residential blocks are frequent targets of hostility.
- **Blackmail & Extortion:** Perpetrators threaten to expose the individual to police or hostile community members unless money or sexual favors are provided.
- **Secondary Movement Hazards:** Due to persecution, LGBTIQ+ individuals frequently attempt secondary movements to urban centers, risking human trafficking, arbitrary detention, and exploitation.

### 3. Frontline Safe Safeguards:
- Absolute confidentiality: Never record gender identity or sexual orientation in public registers.
- Designated sensitized focal points at DRC Protection and UNHCR desks.
- Access to specialized safe houses, emergency protection transfers, and expedited vulnerability assessments.`,
    keyTakeaways: [
      'Violence based on sexual orientation or gender identity is a recognized form of GBV.',
      'LGBTIQ+ refugees are entitled to equal, non-discriminatory UNHCR protection.',
      'Confidentiality is life-saving due to severe risks of mob violence and extortion.'
    ],
    quiz: [
      {
        question: 'Under UNHCR’s global protection mandate, how should LGBTIQ+ refugees be treated by humanitarian caseworkers?',
        options: [
          'Turned away because host countries have varying laws',
          'With full equality, dignity, strict confidentiality, and targeted protection safeguards',
          'Reported to community elders for moral counseling',
          'Segregated without access to healthcare'
        ],
        correctIndex: 1,
        explanation: 'UNHCR mandates equitable, dignified, and strictly confidential protection for all individuals regardless of sexual orientation or gender identity.'
      }
    ]
  },
  {
    id: 'mod-disability-inclusion-gbv',
    title: 'Displaced Persons with Disabilities: Coercion, Accessibility & Care',
    track: 'Diversity, Disability & Inclusion',
    level: 'Practitioner',
    estimatedMinutes: 8,
    description: 'Address intersectional risks faced by women and girls with physical, sensory, and intellectual disabilities.',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'Humanity & Inclusion (HI)', 'IASC'],
    learningObjectives: [
      'Analyze why persons with disabilities face 3 to 4 times higher rates of GBV.',
      'Identify physical, communication, and attitudinal barriers to reporting.',
      'Implement accessible, inclusive GBV support and assistive adaptations.'
    ],
    content: `Globally and in refugee settlements, women and girls with disabilities face between three and four times the risk of sexual, physical, and emotional violence compared to their peers without disabilities.

### Key Risk Factors:
- **Dependence on Caregivers:** Perpetrators are frequently family members, neighbors, or caregivers upon whom the survivor relies for daily bathing, feeding, and mobility.
- **Physical Vulnerability:** Inability to flee an attacker or physically defend oneself.
- **Communication Barriers:** Deaf survivors or individuals with speech impairments cannot call out for help or use standard voice hotlines.
- **Discredited Credibility:** Societal myths falsely assume persons with intellectual disabilities "imagine" or "exaggerate" abuse.

### Humanitarian Accessibility Standards:
- **Physical Access:** Ramps, wide doors, and accessible private latrines at all clinic and protection desks.
- **Communication Access:** Sign language interpreters, visual pictograms, simplified easy-to-read materials, and SMS/chat reporting channels (like the digital reporting tool in this app).
- **Informed Consent Accommodations:** Take time to explain medical procedures using assistive tools, never assuming an individual cannot comprehend their rights.`,
    keyTakeaways: [
      'Persons with disabilities face up to four times higher rates of GBV.',
      'Caregiver dependence makes reporting challenging without accessible channels.',
      'Text/chat reporting and physical ramps are essential humanitarian prerequisites.'
    ],
    quiz: [
      {
        question: 'Why are digital chat and written reporting tools vital for survivors with disabilities in displacement camps?',
        options: [
          'They allow deaf or speech-impaired survivors to communicate discreetly and safely without relying on voice hotlines',
          'They replace the need for physical doctors entirely',
          'They are cheaper than providing medical supplies',
          'They ensure only educated people can report'
        ],
        correctIndex: 0,
        explanation: 'Alternative digital communication tools empower individuals who are deaf, hard of hearing, or in close physical proximity to abusive caregivers to report safely.'
      }
    ]
  },
  {
    id: 'mod-male-survivors-crsv',
    title: 'Male Survivors of Sexual Violence: Overcoming Stigma & Clinical Access',
    track: 'Diversity, Disability & Inclusion',
    level: 'Advanced',
    estimatedMinutes: 8,
    description: 'Humanitarian guidelines on identifying, supporting, and medically treating men and boys who are survivors of sexual violence.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    organizationSources: ['UNHCR', 'All Survivors Project', 'WHO', 'MSF'],
    learningObjectives: [
      'Recognize Conflict-Related Sexual Violence (CRSV) against men and boys.',
      'Understand profound societal shame, emasculation myths, and barriers to disclosure.',
      'Apply clinical protocols including 72-hour PEP for male survivors.'
    ],
    content: `While women and girls constitute the overwhelming majority of GBV survivors, men and boys are also targeted with sexual violence, particularly during armed conflict, forced conscription, detention, and displacement.

### Conflict-Related Sexual Violence (CRSV) Against Men:
- In armed conflicts in eastern DRC, South Sudan, and the Central African Republic, armed groups use sexual torture, forced nudity, and castration as deliberate weapons to terrorize, demoralize, and subjugate male captives.

### Acute Barriers to Disclosure:
- **Severe Social Stigma & Emasculation:** Cultural beliefs falsely equate sexual victimhood with weakness or homosexuality.
- **Lack of Dedicated Services:** Many camp health centers and safe spaces are branded exclusively for women, inadvertently signaling to male survivors that they cannot seek care.
- **Legal Barriers:** In some jurisdictions, laws do not clearly define male rape, or male survivors fear being falsely accused under anti-homosexuality statutes.

### Clinical & Psychosocial Protocols:
- **Equal Medical Protocol:** The 72-hour PEP window, STI prophylaxis, Tetanus shot, Hepatitis B vaccination, and wound care apply IDENTICALLY to male survivors.
- Non-judgmental, confidential clinical examination in private triage areas.
- Psychosocial support addressing feelings of shame, physiological responses during assault (erection or ejaculation can be involuntary physiological reflex reactions to extreme trauma and terror, NOT consent or pleasure), and trauma processing.`,
    keyTakeaways: [
      'Male survivors require identical 72-hour PEP and clinical prophylaxis.',
      'Involuntary physical reactions (erections) during trauma are neurological reflexes, never consent.',
      'Confidentiality and specialized counseling are essential to overcome profound stigma.'
    ],
    quiz: [
      {
        question: 'Does the 72-hour medical golden window for Post-Exposure Prophylaxis (PEP) apply to male survivors of sexual assault?',
        options: [
          'No, PEP is only approved for female patients',
          'Yes, identical 72-hour PEP and clinical prophylaxis protocols apply to male survivors',
          'Only if the survivor has a police warrant',
          'Only for boys under 10 years old'
        ],
        correctIndex: 1,
        explanation: 'HIV transmission risks exist regardless of gender; the 72-hour PEP golden window is universally applicable to all human survivors.'
      }
    ]
  }
];
