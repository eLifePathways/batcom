import { Card, CardContent } from '@/components/ui/card'
import { Mail, Globe, Linkedin, Twitter } from 'lucide-react'

type SocialLinkProps = {
  href: string
  icon: React.ReactNode
  label: string
}

const SocialLink = ({ href, icon, label }: SocialLinkProps) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:text-blue-700 transition"
  >
    {icon}
  </a>
)

type TeamMemberCardProps = {
  name: string
  title: string
  institution: string
  description: string
  imageUrl: string
  email?: string
  website?: string
  socialMedia?: string
}

const TeamMemberCard = ({
  name,
  title,
  institution,
  description,
  imageUrl,
  website,
  socialMedia,
}: TeamMemberCardProps) => {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 h-full">
      <div className="aspect-w-1 aspect-h-1 overflow-hidden h-64">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="font-montserrat font-semibold text-primary text-xl mb-1">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{institution}</p>
        <p className="text-gray-700 mb-4">{description}</p>
        <div className="flex gap-3">
          {website && (
            <SocialLink
              href={website}
              icon={<Globe size={18} />}
              label={`${name}'s website`}
            />
          )}
          {socialMedia && socialMedia.includes('linkedin') && (
            <SocialLink
              href={socialMedia}
              icon={<Linkedin size={18} />}
              label={`${name}'s LinkedIn profile`}
            />
          )}
          {socialMedia && socialMedia.includes('twitter') && (
            <SocialLink
              href={socialMedia}
              icon={<Twitter size={18} />}
              label={`${name}'s Twitter profile`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TeamMemberCard
