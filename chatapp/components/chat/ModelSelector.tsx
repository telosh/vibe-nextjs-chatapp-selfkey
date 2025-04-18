"use client";

import { useEffect, useState } from "react";
import { AIModel, aiModels, getModelById } from "@/lib/ai/models";
import { FiChevronDown } from "react-icons/fi";

type ModelSelectorProps = {
  currentModel?: AIModel;
  onModelChange: (modelId: string) => void;
};

export default function ModelSelector({
  currentModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | undefined>(currentModel);

  // currentModelが変更されたら内部状態も更新
  useEffect(() => {
    setSelectedModel(currentModel);
  }, [currentModel]);

  const handleModelSelect = (modelId: string) => {
    const model = getModelById(modelId);
    setSelectedModel(model);
    onModelChange(modelId);
    setIsOpen(false);
  };

  // 選択中のモデル名を表示（存在しない場合はデフォルトテキスト）
  const displayModelName = selectedModel?.name || "モデル選択";

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayModelName}</span>
        <FiChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {aiModels.map((model) => (
              <button
                key={model.id}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedModel?.id === model.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                role="menuitem"
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {model.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 