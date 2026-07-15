// PROMPT 패널: Image/Video 모드, 모델 선택, 캐릭터·환경 시트, 프리셋 라이브러리, 무빙샷, Generate
"use client";

import { useCallback, useState } from "react";
import { PanelSection } from "./PanelSection";
import { PresetDropdown } from "./PresetDropdown";
import { useShotStore } from "@/store/useShotStore";
import { buildFinalPrompt } from "@/lib/promptBuilder";
import { CAMERA_MOVE_PRESETS, MOVE_INTENSITY_OPTIONS } from "@/lib/cameraMoves";
import type { CharacterPreset, EnvironmentPreset, StylePreset } from "@/types";
import {
  deleteCharacterPreset,
  deleteEnvironmentPreset,
  deleteStylePreset,
  listCharacterPresets,
  listEnvironmentPresets,
  listStylePresets,
  saveCharacterPreset,
  saveEnvironmentPreset,
  saveStylePreset,
} from "@/lib/db";

const IMAGE_MODELS = ["GPT Image 2", "Nano Banana Pro", "Midjourney", "Flux"];
const VIDEO_MODELS = ["Higgsfield", "Runway", "Kling"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PromptPanel() {
  const prompt = useShotStore((s) => s.prompt);
  const setPrompt = useShotStore((s) => s.setPrompt);
  const videoMove = useShotStore((s) => s.videoMove);
  const setVideoMove = useShotStore((s) => s.setVideoMove);
  const shotType = useShotStore((s) => s.shotType);
  const angleLabel = useShotStore((s) => s.angleLabel);
  const fov = useShotStore((s) => s.fov);
  const aspectRatio = useShotStore((s) => s.aspectRatio);
  const currentViewDirection = useShotStore((s) => s.currentViewDirection);
  const requestFrameCapture = useShotStore((s) => s.requestFrameCapture);
  const openResultModal = useShotStore((s) => s.openResultModal);

  const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>([]);
  const [environmentPresets, setEnvironmentPresets] = useState<EnvironmentPreset[]>([]);
  const [stylePresets, setStylePresets] = useState<StylePreset[]>([]);

  const refreshCharacters = useCallback(() => {
    listCharacterPresets().then(setCharacterPresets).catch(() => setCharacterPresets([]));
  }, []);
  const refreshEnvironments = useCallback(() => {
    listEnvironmentPresets().then(setEnvironmentPresets).catch(() => setEnvironmentPresets([]));
  }, []);
  const refreshStyles = useCallback(() => {
    listStylePresets().then(setStylePresets).catch(() => setStylePresets([]));
  }, []);

  const modelOptions = prompt.mode === "image" ? IMAGE_MODELS : VIDEO_MODELS;

  async function handleCharacterSheetUpload(file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPrompt({ characterSheetImage: dataUrl });
  }
  async function handleEnvironmentSheetUpload(file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPrompt({ environmentSheetImage: dataUrl });
  }

  function handleSaveCharacter(name: string) {
    const existing = characterPresets.find((p) => p.name === name);
    saveCharacterPreset({
      id: existing?.id,
      name,
      subjectText: prompt.subject,
      referenceImage: prompt.characterSheetImage,
    }).then(refreshCharacters);
  }
  function handleSaveEnvironment(name: string) {
    const existing = environmentPresets.find((p) => p.name === name);
    saveEnvironmentPreset({
      id: existing?.id,
      name,
      environmentText: prompt.environment,
      referenceImage: prompt.environmentSheetImage,
    }).then(refreshEnvironments);
  }
  function handleSaveStyle(name: string) {
    const existing = stylePresets.find((p) => p.name === name);
    saveStylePreset({ id: existing?.id, name, styleText: prompt.lookStyle }).then(refreshStyles);
  }

  function handleGenerate() {
    const finalPrompt = buildFinalPrompt({
      shotType,
      angleLabel,
      fov,
      viewDirection: currentViewDirection,
      aspectRatio,
      prompt,
      videoMove,
    });
    requestFrameCapture();
    openResultModal(finalPrompt);
  }

  return (
    <PanelSection title="프롬프트">
      <div className="mb-3 flex gap-1 rounded-md bg-neutral-900 p-1">
        <button
          onClick={() => setPrompt({ mode: "image" })}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            prompt.mode === "image" ? "bg-accent text-black" : "text-neutral-300"
          }`}
        >
          이미지
        </button>
        <button
          onClick={() => setPrompt({ mode: "video" })}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            prompt.mode === "video" ? "bg-accent text-black" : "text-neutral-300"
          }`}
        >
          비디오
        </button>
      </div>

      <div className="mb-3">
        <label className="mb-1.5 block text-xs text-neutral-400">모델</label>
        <select
          value={prompt.model}
          onChange={(e) => setPrompt({ model: e.target.value })}
          className="w-full rounded-md bg-neutral-900 px-2.5 py-2 text-sm text-neutral-100"
        >
          {modelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 space-y-2">
        <label className="flex items-center gap-1.5 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={prompt.hasCharacterSheet}
            onChange={(e) => setPrompt({ hasCharacterSheet: e.target.checked })}
            className="h-3.5 w-3.5 accent-orange-500"
          />
          캐릭터시트가 있어요
          <span
            title="인물의 얼굴·체형·의상을 고정하기 위한 참조 이미지입니다. 업로드하면 생성 시 이 이미지를 기준으로 외형을 동일하게 유지하라는 지시문이 프롬프트에 자동으로 추가됩니다."
            className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-neutral-800 text-[10px] text-neutral-400"
          >
            ?
          </span>
        </label>
        {prompt.hasCharacterSheet && (
          <div className="ml-5 flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCharacterSheetUpload(e.target.files?.[0] ?? null)}
              className="text-xs text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-800 file:px-2 file:py-1 file:text-xs file:text-neutral-200"
            />
            {prompt.characterSheetImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prompt.characterSheetImage}
                alt="캐릭터시트 미리보기"
                className="h-8 w-8 rounded object-cover"
              />
            )}
          </div>
        )}

        <label className="flex items-center gap-1.5 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={prompt.hasEnvironmentSheet}
            onChange={(e) => setPrompt({ hasEnvironmentSheet: e.target.checked })}
            className="h-3.5 w-3.5 accent-orange-500"
          />
          환경시트가 있어요
          <span
            title="배경·세트의 구조와 재질을 고정하기 위한 참조 이미지입니다. 업로드하면 생성 시 이 이미지를 기준으로 환경을 동일하게 유지하라는 지시문이 프롬프트에 자동으로 추가됩니다."
            className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-neutral-800 text-[10px] text-neutral-400"
          >
            ?
          </span>
        </label>
        {prompt.hasEnvironmentSheet && (
          <div className="ml-5 flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleEnvironmentSheetUpload(e.target.files?.[0] ?? null)}
              className="text-xs text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-800 file:px-2 file:py-1 file:text-xs file:text-neutral-200"
            />
            {prompt.environmentSheetImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prompt.environmentSheetImage}
                alt="환경시트 미리보기"
                className="h-8 w-8 rounded object-cover"
              />
            )}
          </div>
        )}
      </div>

      <FieldWithLibrary
        label="피사체"
        value={prompt.subject}
        placeholder="a young woman in a tan coat"
        onChange={(v) => setPrompt({ subject: v })}
        items={characterPresets}
        onRefresh={refreshCharacters}
        onSelect={(item) =>
          setPrompt({
            subject: item.subjectText,
            characterSheetImage: item.referenceImage,
            hasCharacterSheet: Boolean(item.referenceImage),
          })
        }
        onSaveCurrent={handleSaveCharacter}
        onDelete={(id) => deleteCharacterPreset(id).then(refreshCharacters)}
      />

      <FieldWithLibrary
        label="환경"
        value={prompt.environment}
        placeholder="a sunlit modern living room"
        onChange={(v) => setPrompt({ environment: v })}
        items={environmentPresets}
        onRefresh={refreshEnvironments}
        onSelect={(item) =>
          setPrompt({
            environment: item.environmentText,
            environmentSheetImage: item.referenceImage,
            hasEnvironmentSheet: Boolean(item.referenceImage),
          })
        }
        onSaveCurrent={handleSaveEnvironment}
        onDelete={(id) => deleteEnvironmentPreset(id).then(refreshEnvironments)}
      />

      <FieldWithLibrary
        label="스타일"
        value={prompt.lookStyle}
        placeholder="moody cinematic lighting"
        onChange={(v) => setPrompt({ lookStyle: v })}
        items={stylePresets}
        onRefresh={refreshStyles}
        onSelect={(item) => setPrompt({ lookStyle: item.styleText })}
        onSaveCurrent={handleSaveStyle}
        onDelete={(id) => deleteStylePreset(id).then(refreshStyles)}
      />

      {prompt.mode === "video" && (
        <div className="mb-3 rounded-md border border-neutral-800 p-3">
          <div className="mb-2 text-xs text-neutral-400">카메라 무브</div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {CAMERA_MOVE_PRESETS.map((m) => (
              <button
                key={m.id}
                onClick={() => setVideoMove({ moveType: m.id })}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  videoMove.moveType === m.id
                    ? "bg-accent text-black"
                    : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <div className="mb-1.5 text-xs text-neutral-400">강도</div>
            <div className="flex gap-1.5">
              {MOVE_INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  title={opt.tooltip}
                  onClick={() => setVideoMove({ intensity: opt.id })}
                  className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                    videoMove.intensity === opt.id
                      ? "bg-accent text-black"
                      : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-neutral-400">지속 시간 (초)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={videoMove.durationSeconds}
              onChange={(e) =>
                setVideoMove({ durationSeconds: Number(e.target.value) || 1 })
              }
              className="w-full rounded-md bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        className="w-full rounded-md bg-gradient-to-b from-orange-400 to-accent px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        생성하기
      </button>
    </PanelSection>
  );
}

function FieldWithLibrary<T extends { id: string; name: string }>({
  label,
  value,
  placeholder,
  onChange,
  items,
  onRefresh,
  onSelect,
  onSaveCurrent,
  onDelete,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  items: T[];
  onRefresh: () => void;
  onSelect: (item: T) => void;
  onSaveCurrent: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs text-neutral-400">{label}</label>
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md bg-neutral-900 px-2.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
        />
        <PresetDropdown
          items={items}
          onRefresh={onRefresh}
          onSelect={onSelect}
          onSaveCurrent={onSaveCurrent}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
