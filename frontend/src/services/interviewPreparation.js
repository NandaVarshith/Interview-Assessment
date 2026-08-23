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

  return { questions, resumeClaims: Array.isArray(payload?.resumeClaims) ? payload.resumeClaims : [] }
}

export async function generateFollowUpQuestion(question, answer) {
  const response = await fetch(`${apiBaseUrl}/api/interview/follow-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to generate a follow-up question.')
  }

  if (!['clear', 'vague', 'insufficient'].includes(payload?.answerClass)) {
    throw new Error('Backend returned an invalid answer classification.')
  }
  if (payload.followUpQuestion == null) {
    return payload
  }
  if (typeof payload.followUpQuestion !== 'string' || !payload.followUpQuestion.trim()) {
    throw new Error('Backend returned an invalid follow-up question.')
  }
  return { ...payload, followUpQuestion: payload.followUpQuestion.trim() }
}

export async function generateCrossQuestion(resumeClaims, question, answer, followUpQuestion, followUpAnswer, usedClaimIndexes) {
  const response = await fetch(`${apiBaseUrl}/api/interview/cross-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeClaims, question, answer, followUpQuestion, followUpAnswer, usedClaimIndexes }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to generate a cross-question.')
  }
  if (payload?.skip) {
    return payload
  }
  if (typeof payload?.crossQuestion !== 'string' || !payload.crossQuestion.trim()) {
    throw new Error('Backend returned an invalid cross-question.')
  }
  return {
    ...payload,
    crossQuestion: payload.crossQuestion.trim(),
  }
}

export async function decideInterviewAction(context) {
  const response = await fetch(`${apiBaseUrl}/api/interview/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to decide the next interview action.')
  }
  if (!['probe', 'clarify', 'cross_question', 'change_topic', 'next'].includes(payload?.action)) {
    throw new Error('Backend returned an invalid interview decision.')
  }
  if (['probe', 'clarify', 'cross_question'].includes(payload.action)
    && (typeof payload.question !== 'string' || !payload.question.trim())) {
    throw new Error('Backend returned an invalid interview question.')
  }
  return { ...payload, question: payload.question?.trim() || null }
}
