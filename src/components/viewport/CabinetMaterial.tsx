import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { FinishOption } from '../../types'

interface CabinetMaterialProps {
  finish: FinishOption
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
    return <TexturedMaterial finish={finish} />
  }
  return <SolidMaterial finish={finish} />
}
