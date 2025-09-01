import sanitizeHtml from 'sanitize-html'

export const sanitize = (input: string) =>
  sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
