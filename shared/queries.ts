export const MANUSCRIPTS_PUBLISHED_SINCE_DATE = {
  query: `query {
	manuscriptsPublishedSinceDate {
	id
	shortId
	totalCount
	reviews {
		id
		jsonData
		users {
			id
			username
			defaultIdentity {
				id
				identifier
			}
		}
	}
	decisions {
		id
		jsonData
		users {
			id
			username
			defaultIdentity {
				id
				identifier
		}
		}
	}
	editors {
		id
		name
		role
	}
	status
	meta {
		source 
	}
	submission
	supplementaryFiles
	submissionWithFields
	publishedDate
	css
	}
}
`,
}
