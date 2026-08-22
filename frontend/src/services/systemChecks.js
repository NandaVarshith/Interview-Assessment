import { useEffect, useState } from 'react'
import { systemCheckItems } from '../data/appData'

export function useSystemChecks() {
  const createInitialChecks = () =>
    Object.fromEntries(
      systemCheckItems.map((check) => [
        check.key,
        {
          status: ['face', 'singleFace', 'lighting'].includes(check.key) ? 'unavailable' : 'pending',
          detail: ['face', 'singleFace', 'lighting'].includes(check.key)
            ? 'No existing browser/model dependency is configured for this check'
            : 'Waiting for browser result',
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
        isOnline
          ? 'Browser reports online; this does not guarantee connection stability'
          : 'Browser reports offline',
      )
    }
    const runMediaChecks = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        const detail = 'This browser does not support media device access'
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
          setCheck('camera', cameraGranted ? 'passed' : 'failed', cameraGranted ? 'Camera permission granted' : 'No camera video track was found')
          setCheck(
            'preview',
            cameraGranted ? 'passed' : 'failed',
            cameraGranted
              ? 'Live camera stream is attached to the preview'
              : 'No camera video track was found',
          )
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
        setCheck('microphone', hasAudioTrack ? 'passed' : 'failed', hasAudioTrack ? 'Microphone permission granted' : 'No microphone audio track was found')
        setCheck('audioInput', hasAudioTrack ? 'passed' : 'failed', hasAudioTrack ? 'Audio input stream is available' : 'No audio input stream is available')
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
          ? 'Camera and microphone permissions were granted'
          : 'One or more requested media permissions were not granted',
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
      activeStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()))
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [])
  return { checks, cameraStream, microphoneLevel }
}
