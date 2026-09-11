import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import HeroSection from '@/components/sections/hero-section'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Mail, MapPin } from 'lucide-react'

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(1, { message: 'Please select a subject' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(500, { message: 'Message cannot exceed 500 characters' }),
})

type FormValues = z.infer<typeof formSchema>

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection
        title="Contact Us"
        description="Please reach out to us by email with any comments, questions or suggestions for papers to review."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">
                Contact Information
              </CardTitle>
              <CardDescription>
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    <a
                      className="text-link hover:text-primary"
                      href="mailto:batvirus@jh.edu"
                    >
                      batvirus@jh.edu
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    Johns Hopkins Bloomberg School of Public Health
                    <br />
                    615 N. Wolfe Street
                    <br />
                    Baltimore, MD 21205
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">
                Media Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For media inquiries, please contact our communications team at:
              </p>
              <p className="text-sm font-medium mt-2">jhsph.media@jhu.edu</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
