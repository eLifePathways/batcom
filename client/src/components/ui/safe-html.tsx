import DOMPurify from 'dompurify'

export function SafeHtml({ html }: { html: string }) {
  // Enable the SVG profile alongside HTML so the inline MathJax SVGs baked
  // into manuscript text survive sanitisation (the html profile alone strips
  // <svg> and its children, while still allowing <img>).
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
  })

  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
