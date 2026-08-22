export const candidateStorageKey = 'ai-interview-candidate'

export const saveCandidateForDevelopment = (candidate) => {
  const candidateForStorage = {
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    sessionId: candidate.sessionId,
    resumeScore: candidate.resumeScore,
    estimatedWait: candidate.estimatedWait,
    resumeName: candidate.resumeName,
    resumeSize: candidate.resumeSize,
    resumeType: candidate.resumeType,
    savedAt: candidate.savedAt,
  }
  window.localStorage.setItem(candidateStorageKey, JSON.stringify(candidateForStorage))
}

export const validateCandidateForm = ({ name, email, resume }) => {
  const errors = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!trimmedName) {
    errors.name = 'Full name is required.'
  } else if (trimmedName.split(/\s+/).length < 2) {
    errors.name = 'Enter first and last name.'
  }
  if (!trimmedEmail) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!resume) {
    errors.resume = 'Upload a PDF, DOC, or DOCX resume.'
  }
  return errors
}
