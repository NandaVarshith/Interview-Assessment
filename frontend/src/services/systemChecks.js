import { useEffect, useState } from 'react'
import { systemCheckItems } from '../data/appData'

const faceApiBaseUrl = import.meta.env.VITE_GAZE_API_BASE_URL || 'http://127.0.0.1:5051'

export function useSystemChecks() {
  const createInitialChecks = () =>
    Object.fromEntries(
      systemCheckItems.map((check) => [
        check.key,
        {
          status: ['face', 'singleFace', 'lighting'].includes(check.key) ? 'unavailable' : 'pending',
          detail: ['face', 'singleFace', 'lighting'].includes(check.key)
            ? 'This check is not available yet'
            : 'Checking now',
        },
      ]),
    )
  const [checks, setChecks] = useState({
    ...createInitialChecks(),
  })
  const [cameraStream, setCameraStream] = useState(null)
  const [microphoneLevel, setMicrophoneLevel] = useState(0)
  useEffect(() => {
    let cancelled = false
    let animationFrame = 0
    let audioContext = null
    let faceInterval = 0
    let faceVideo = null
    let faceCanvas = null
    let faceProcessing = false
    const activeStreams = []
    const setCheck = (key, status, detail) => {
      if (!cancelled) {
        setChecks((value) => ({ ...value, [key]: { status, detail } }))
      }
    }
    const updateConnection = () => {
      const isOnline = window.navigator.onLine
      setCheck(
        'internet',
        isOnline ? 'passed' : 'failed',
        isOnline ? 'Connection is available' : 'Connection is unavailable',
      )
    }
    const startFaceChecks = async (stream) => {
      faceVideo = document.createElement('video')
      faceVideo.srcObject = stream
      faceVideo.muted = true
      faceVideo.playsInline = true
      faceCanvas = document.createElement('canvas')
      await faceVideo.play().catch(() => {})
      const checkFace = async () => {
        if (cancelled || faceProcessing || !faceVideo || !faceCanvas || faceVideo.readyState < 2) return
        faceProcessing = true
        try {
          faceCanvas.width = faceVideo.videoWidth
          faceCanvas.height = faceVideo.videoHeight
          const context = faceCanvas.getContext('2d')
          context.drawImage(faceVideo, 0, 0, faceCanvas.width, faceCanvas.height)
          const frame = await new Promise((resolve) => faceCanvas.toBlob(resolve, 'image/jpeg', 0.6))
          if (!frame || cancelled) return
          const response = await fetch(`${faceApiBaseUrl}/api/face/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body: frame,
          })
          if (!response.ok) throw new Error('Face check unavailable')
          const result = await response.json()
          const faceCount = Number(result.faceCount) || 0
          const hasFace = faceCount >= 1
          const singleFaceCentered = faceCount === 1 && result.centered === true
          setCheck('face', hasFace ? 'passed' : 'failed', hasFace ? 'Face is visible' : 'Please ensure your face is visible to the camera')
          setCheck('singleFace', singleFaceCentered ? 'passed' : 'failed', singleFaceCentered ? 'Only you are visible and centered' : 'Please keep only one face visible and centered')
        } catch {
          setCheck('face', 'failed', 'Face check is temporarily unavailable')
          setCheck('singleFace', 'failed', 'Single-face check is temporarily unavailable')
        } finally {
          faceProcessing = false
        }
      }
      await checkFace()
      faceInterval = window.setInterval(checkFace, 800)
    }
    const runMediaChecks = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        const detail = 'Camera and microphone access is not supported in this browser'
        setCheck('camera', 'failed', detail)
        setCheck('preview', 'failed', detail)
        setCheck('microphone', 'failed', detail)
        setCheck('audioInput', 'failed', detail)
        setCheck('permissions', 'failed', detail)
        return
      }
      let cameraGranted = false
      let microphoneGranted = false
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        activeStreams.push(stream)
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (!cancelled) {
          cameraGranted = stream.getVideoTracks().length > 0
          setCameraStream(stream)
          setCheck('camera', cameraGranted ? 'passed' : 'failed', cameraGranted ? 'Camera is available' : 'Camera could not be started')
          setCheck('preview', cameraGranted ? 'passed' : 'failed', cameraGranted ? 'Preview is available' : 'Camera preview is unavailable')
          if (cameraGranted) void startFaceChecks(stream)
        }
      } catch (error) {
        const detail = error?.name === 'NotAllowedError' ? 'Camera permission was denied' : 'Camera access failed'
        setCheck('camera', 'failed', detail)
        setCheck('preview', 'failed', detail)
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        activeStreams.push(stream)
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const hasAudioTrack = stream.getAudioTracks().length > 0
        microphoneGranted = hasAudioTrack
        setCheck('microphone', hasAudioTrack ? 'passed' : 'failed', hasAudioTrack ? 'Microphone is available' : 'Microphone could not be started')
        setCheck('audioInput', hasAudioTrack ? 'passed' : 'failed', hasAudioTrack ? 'Audio input is available' : 'Audio input is unavailable')
        if (hasAudioTrack) {
          audioContext = new AudioContext()
          const analyser = audioContext.createAnalyser()
          const source = audioContext.createMediaStreamSource(stream)
          const samples = new Uint8Array(analyser.frequencyBinCount)
          source.connect(analyser)
          const readLevel = () => {
            analyser.getByteTimeDomainData(samples)
            const peak = samples.reduce((max, sample) => Math.max(max, Math.abs(sample - 128)), 0)
            setMicrophoneLevel(Math.min(100, Math.round((peak / 64) * 100)))
            animationFrame = window.requestAnimationFrame(readLevel)
          }
          readLevel()
        }
      } catch (error) {
        const detail = error?.name === 'NotAllowedError' ? 'Microphone permission was denied' : 'Microphone access failed'
        setCheck('microphone', 'failed', detail)
        setCheck('audioInput', 'failed', detail)
      }
      setCheck(
        'permissions',
        cameraGranted && microphoneGranted ? 'passed' : 'failed',
        cameraGranted && microphoneGranted
          ? 'Camera and microphone permissions are granted'
          : 'Allow camera and microphone permissions to continue',
      )
    }
    updateConnection()
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    runMediaChecks()
    return () => {
      cancelled = true
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
      window.cancelAnimationFrame(animationFrame)
      window.clearInterval(faceInterval)
      activeStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()))
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [])
  return { checks, cameraStream, microphoneLevel }
}
