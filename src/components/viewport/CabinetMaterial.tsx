import { Component, type ReactNode } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { FinishOption } from '../../types'

interface CabinetMaterialProps {
  finish: FinishOption
}

// Error boundary that catches texture load failures and falls back to solid color
class TextureFallback extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function TexturedMaterial({ finish }: CabinetMaterialProps) {
  const texture = useTexture(finish.textureUrl!)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  if (finish.uvRepeat) {
    texture.repeat.set(finish.uvRepeat[0], finish.uvRepeat[1])
  }
  return <meshStandardMaterial map={texture} roughness={finish.roughness} />
}

function SolidMaterial({ finish }: CabinetMaterialProps) {
  return <meshStandardMaterial color={finish.hex} roughness={finish.roughness} />
}

export function CabinetMaterial({ finish }: CabinetMaterialProps) {
  if (finish.type === 'woodgrain' && finish.textureUrl) {
    return (
      <TextureFallback fallback={<SolidMaterial finish={finish} />}>
        <TexturedMaterial finish={finish} />
      </TextureFallback>
    )
  }
  return <SolidMaterial finish={finish} />
}
