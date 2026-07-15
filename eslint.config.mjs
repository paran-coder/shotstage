import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three-fiber는 useFrame 안에서 camera/mesh 등을 직접 mutate하는 것이
    // 공식적으로 권장되는 패턴이라, React Compiler 전제의 immutability 규칙과 충돌한다.
    // 3D 뷰포트 컴포넌트에 한해 해당 규칙을 끈다.
    files: ["src/components/viewport/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
