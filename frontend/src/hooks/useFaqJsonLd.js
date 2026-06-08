import { useMemo } from 'react'
import { useJsonLd } from './useJsonLd'

export function useFaqJsonLd(id, questions = []) {
  const schema = useMemo(() => {
    const mainEntity = questions
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))

    if (mainEntity.length === 0) {
      return null
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    }
  }, [questions])

  useJsonLd(id, schema)
}

