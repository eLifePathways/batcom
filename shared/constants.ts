export const REVIEW_GEOGRAPHIC_REGION_FIELD = 'reviewGeographicRegion'
export const REVIEW_EVIDENCE_INFECTION_FIELD = 'reviewEvidenceInfection'
export const REVIEW_EVIDENCE_SPILLOVER_FIELD = 'reviewEvidenceSpillover'
export const REVIEW_VIRUS_CATEGORY_FIELD = 'reviewViral_Family'
export const REVIEW_COUNTRY_FIELD = 'reviewCountry'
export const REVIEW_HOST_GENUS_FIELD = 'reviewBat_Source_Host_Genus'
export const REVIEW_RECIPIENT_HOST_FIELD = 'reviewRecipientHost'
export const REVIEW_STUDY_DESIGN_FIELD = 'reviewStudyDesign'
export const REVIEW_INVESTIGATION_DETAILS_FIELD = 'reviewInvestigationDetails'
export const REVIEW_POPULATION_SETTING_METHOD_FIELD =
  'reviewPopulationSettingMethods'
export const REVIEW_MAIN_FINDINGS_FIELD = 'reviewMainFindings'
export const REVIEW_STUDY_STRENGTHS_FIELD = 'reviewStudyStrengths'
export const REVIEW_LIMITATIONS_FIELD = 'reviewLimitations'
export const REVIEW_VALUE_ADDED_FIELD = 'reviewValueAdded'
export const REVIEW_FINAL_TAKE_FIELD = 'reviewFinalTake'

export const VIRAL_FAMILIES = {
  coronaviridae: 'Coronaviridae',
  filoviridae: 'Filoviridae',
  paramyxoviridae: 'Paramyxoviridae',
  reoviridae: 'Reoviridae',
  rhabdoviridae: 'Rhabdoviridae',
  other: 'Other',
  unknown: 'Unknown',
}

export const GEOGRAPHIC_REGIONS = {
  africa: 'Africa',
  americas: 'Americas',
  eastern_mediterranean: 'Eastern Mediterranean',
  europe: 'Europe',
  southeast_asia: 'Southeast Asia',
  western_pacific: 'Western Pacific',
}

export const BAT_SOURCE_HOST_GENI = {
  desmodus: 'Desmodus',
  eidolon: 'Eidolon',
  eptesicus: 'Eptesicus',
  miniopterus: 'Miniopterus',
  myotis: 'Myotis',
  pteropus: 'Pteropus',
  rhinolophus: 'Rhinolophus',
  rousettus: 'Rousettus',
  other: 'Other',
  unknown: 'Unknown',
}

export const RECIPIENT_HOSTS = {
  recipientHumans: 'Humans',
  recipientDomestic: 'Domestic or peridomestic animal',
  recipientWild: 'Non-reservoir wild animal',
  recipientNA: 'NA',
}

export const STUDY_DESIGNS = {
  Case_control: 'Case-control',
  Case_report: 'Case report',
  Cohort: 'Cohort',
  'Cross-sectional': 'Cross-sectional',
}

export const INVESTIGATION_DETAILS = {
  clinical_signs_symptoms: 'Clinical signs & symptoms',
  virus_isolation: 'Virus isolation',
  microscopy: 'Microscopy',
  pcr: 'PCR',
  sequencing: 'Sequencing',
  serology: 'serology',
  'non-human_animal_investigation': 'Non-human animal investigation',
  other: 'Other',
}

export const EVIDENCE_QUALITY_INFECTION = {
  infectionHigh: 'High',
  infectionModerate: 'Moderate',
  infectionLow: 'Low',
  infectionNot_Investigated: 'Not investigated',
} as const

export const EVIDENCE_QUALITY_SPILLOVER = {
  spilloverHigh: 'High',
  spilloverModerate: 'Moderate',
  spilloverLow: 'Low',
  spilloverNot_Investigated: 'Not investigated',
} as const

export const INFECTION_KEYS_TUPLE = Object.keys(EVIDENCE_QUALITY_INFECTION) as [
  string,
  ...string[],
]

export const SPILLOVER_KEYS_TUPLE = Object.keys(EVIDENCE_QUALITY_SPILLOVER) as [
  string,
  ...string[],
]

export const REGION_KEYS_TUPLE = Object.keys(GEOGRAPHIC_REGIONS) as [
  string,
  ...string[],
]

export type EvidenceInfection = keyof typeof EVIDENCE_QUALITY_INFECTION
export type EvidenceSpillover = keyof typeof EVIDENCE_QUALITY_SPILLOVER
export type Region = keyof typeof GEOGRAPHIC_REGIONS

export const regions = Object.entries(GEOGRAPHIC_REGIONS).map(
  ([key, value]) => ({ key, value }),
)

export const QUALITY_COLOURS = {
  High: '#16a34a',
  Moderate: '#eab308',
  Low: '#dc2626',
  Not_Investigated: '#9ca3af',
} as const

export type QualityKey = keyof typeof QUALITY_COLOURS
