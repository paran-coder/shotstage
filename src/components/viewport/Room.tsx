// 블로킹용 무채색 placeholder 룸 (벽, 바닥, 창문)
"use client";

export function Room() {
  const wallColor = "#1c2230";
  const floorColor = "#141821";
  const roomWidth = 8;
  const roomDepth = 8;
  const roomHeight = 4;

  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* 뒷벽 */}
      <mesh position={[0, roomHeight / 2, -roomDepth / 2]}>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* 왼쪽 벽 */}
      <mesh
        position={[-roomWidth / 2, roomHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* 오른쪽 벽 */}
      <mesh
        position={[roomWidth / 2, roomHeight / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* 창문 (오른쪽 벽 위) */}
      <mesh
        position={[roomWidth / 2 - 0.02, roomHeight / 2 + 0.3, 1.2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color="#a9c4e0" emissive="#a9c4e0" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
