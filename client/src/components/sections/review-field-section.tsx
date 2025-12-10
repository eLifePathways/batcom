import { SafeHtml } from '@/components/ui/safe-html'
import { isValidElement, ReactNode } from 'react'

type ReviewFieldProps = {
  content: string | ReactNode
  title: string
}

const ReviewField = ({ content, title }: ReviewFieldProps) => {
  const isReactElement = isValidElement(content)
  return (
    <div className="gap-2 mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {!isReactElement ? (
        <p>
          <SafeHtml html={content as string} />
        </p>
      ) : (
        content
      )}
    </div>
  )
}

export default ReviewField
