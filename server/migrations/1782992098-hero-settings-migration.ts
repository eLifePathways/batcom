import { InsertHeroSettings } from '../../shared/schema'
import { client } from '../db'
import { storage } from '../storage'
import { checkTableExists } from './helpers'

export const createHeroSettingsTableAndAddDefaults = async () => {
  console.log(
    'Starting database migration for create hero_section_settings table...',
  )

  const tableExists = await checkTableExists('hero_section_settings')

  if (!tableExists) {
    await client`
		CREATE TABLE IF NOT EXISTS hero_section_settings (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			title TEXT NOT NULL,
			description TEXT NOT NULL
		);
	`
    console.log(
      'Created hero_section_settings table, populating with default values...',
    )
  }

  const heroSettings = await storage.getAllHeroSettings()

  if (!!heroSettings.length) {
    console.log('hero_section_settings values already exist.')
    return
  }

  const existingDefs: InsertHeroSettings[] = [
    {
      name: 'backgroundPapers',
      title: 'Background Papers',
      description:
        'Our background papers provide comprehensive overviews of bat virus research, synthesizing key findings and highlighting important knowledge gaps. These papers are designed to be accessible to researchers, public health officials, and policymakers.',
    },
    {
      name: 'contact',
      title: 'Contact Us',
      description:
        'Have questions about our research or want to collaborate? Get in touch with the Bat-Com team. We welcome inquiries from researchers, public health officials, and other stakeholders.',
    },
    {
      name: 'home',
      title:
        'Our teams curate and assess historical and emerging research on bat virus spillover events.',
      description:
        'We prioritize high-quality research on spillover events to shed light on viral reservoirs, intermediate hosts, recipient hosts, and possible spillover pathways.',
    },
    {
      name: 'publications',
      title: 'Most Recent Reviews',
      description:
        'Explore our curated collection of research on bat virus spillover events, categorized by virus family, evidence quality, and geographical region.',
    },
    {
      name: 'search',
      title: 'Search Our Reviews',
      description:
        'Find specific research papers and reviews on bat virus spillover events by searching our comprehensive database.',
    },
    {
      name: 'team',
      title: 'Our Research Team',
      description:
        'Meet the dedicated researchers behind our work on bat virus spillover events. Our interdisciplinary team combines expertise in virology, epidemiology, ecology, and public health.',
    },
    {
      name: 'whatWeDo',
      title: 'What We Do',
      description:
        'At Bat-Com, we systematically review and evaluate scientific evidence related to bat viruses and their potential to cause human disease. Our work focuses on providing high-quality, accessible information to researchers, public health officials, and policymakers.',
    },
  ]

  await Promise.all(existingDefs.map(def => storage.createHeroSettings(def)))

  console.log('Populated hero_section_settings with default values.')
}
