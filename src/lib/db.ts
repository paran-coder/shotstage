// IndexedDB 기반 캐릭터/환경/스타일 프리셋 저장소 (브라우저 로컬 저장, 서버 없음)
import { openDB, type IDBPDatabase } from "idb";
import type { CharacterPreset, EnvironmentPreset, StylePreset } from "@/types";

const DB_NAME = "shotstage-asset-library";
const DB_VERSION = 1;

const STORES = {
  character: "characterPresets",
  environment: "environmentPresets",
  style: "stylePresets",
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB는 브라우저 환경에서만 사용할 수 있습니다.");
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const storeName of Object.values(STORES)) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        }
      },
    });
  }
  return dbPromise;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function listPresets<T>(storeName: string): Promise<T[]> {
  const db = await getDb();
  const items = (await db.getAll(storeName)) as (T & { createdAt: number })[];
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

async function putPreset<T extends { id: string }>(storeName: string, item: T) {
  const db = await getDb();
  await db.put(storeName, item);
}

async function deletePreset(storeName: string, id: string) {
  const db = await getDb();
  await db.delete(storeName, id);
}

// 캐릭터 프리셋
export const listCharacterPresets = () => listPresets<CharacterPreset>(STORES.character);
export const saveCharacterPreset = (input: {
  id?: string;
  name: string;
  subjectText: string;
  referenceImage: string | null;
}) =>
  putPreset<CharacterPreset>(STORES.character, {
    id: input.id ?? makeId(),
    name: input.name,
    subjectText: input.subjectText,
    referenceImage: input.referenceImage,
    createdAt: Date.now(),
  });
export const deleteCharacterPreset = (id: string) => deletePreset(STORES.character, id);

// 환경 프리셋
export const listEnvironmentPresets = () =>
  listPresets<EnvironmentPreset>(STORES.environment);
export const saveEnvironmentPreset = (input: {
  id?: string;
  name: string;
  environmentText: string;
  referenceImage: string | null;
}) =>
  putPreset<EnvironmentPreset>(STORES.environment, {
    id: input.id ?? makeId(),
    name: input.name,
    environmentText: input.environmentText,
    referenceImage: input.referenceImage,
    createdAt: Date.now(),
  });
export const deleteEnvironmentPreset = (id: string) => deletePreset(STORES.environment, id);

// 스타일 프리셋
export const listStylePresets = () => listPresets<StylePreset>(STORES.style);
export const saveStylePreset = (input: { id?: string; name: string; styleText: string }) =>
  putPreset<StylePreset>(STORES.style, {
    id: input.id ?? makeId(),
    name: input.name,
    styleText: input.styleText,
    createdAt: Date.now(),
  });
export const deleteStylePreset = (id: string) => deletePreset(STORES.style, id);
