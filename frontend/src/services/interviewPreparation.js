const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

export async function prepareInterviewQuestions(resumeFile) {
  if (!resumeFile) {
    throw new Error('Resume file is missing.')
  }

  const formData = new FormData()
  formData.append('resume', resumeFile, resumeFile.name)

  const response = await fetch(`${apiBaseUrl}/api/interview/prepare`, {
    method: 'POST',
    body: formData,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to prepare interview questions.')
  }

  const questions = payload?.questions
  if (!Array.isArray(questions) || questions.length < 5) {
    throw new Error('Backend returned an invalid question list.')
  }

  return questions
}
