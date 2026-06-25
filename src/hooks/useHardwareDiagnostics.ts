import { useState, useEffect } from "react";
import { HardwareSpecs } from "../types";

export function useHardwareDiagnostics() {
  const [specs, setSpecs] = useState<HardwareSpecs>({
    ram: 8,
    threads: 4,
    gpuStatus: "Detecting diagnostic hardware...",
    recommendedModel: "Phi-3 (3.8B)",
  });

  useEffect(() => {
    async function diagnose() {
      // Navigator specs
      const devMemory = (navigator as any).deviceMemory || 8;
      const cpuThreads = navigator.hardwareConcurrency || 4;
      let gpuMsg = "WebGPU unsupported (CPU Execution)";
      let hasWebGPU = false;

      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) {
            gpuMsg = "Active WebGPU (Hardware Accelerated)";
            hasWebGPU = true;
          } else {
            gpuMsg = "WebGPU detected, but adapter failed";
          }
        } catch (e) {
          gpuMsg = "WebGPU interface restricted/error";
        }
      }

      let recModel = "qwen2:0.5b";
      if (devMemory >= 16 && hasWebGPU) {
        recModel = "llama3:8b";
      } else if (devMemory >= 8) {
        recModel = "phi3:3.8b";
      } else if (devMemory >= 4) {
        recModel = "qwen2:1.5b";
      }

      setSpecs({
        ram: devMemory,
        threads: cpuThreads,
        gpuStatus: gpuMsg,
        recommendedModel: recModel,
      });
    }

    diagnose();
  }, []);

  return specs;
}
