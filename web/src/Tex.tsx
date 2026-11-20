import katex from 'katex'
import 'katex/dist/katex.min.css'

export default function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: block })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
