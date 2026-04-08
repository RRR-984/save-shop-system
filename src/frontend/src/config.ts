import { createActorWithConfig as _createActorWithConfig } from "@caffeineai/core-infrastructure";
import { createActor, type backendInterface } from "./backend";

/**
 * Initializes and returns the ICP backend actor.
 * Uses the Caffeine core-infrastructure config loader to discover the canister ID
 * and network host automatically (from env.json / CANISTER_ID_BACKEND env var).
 *
 * This function is safe to call multiple times — config is cached by the library.
 */
export async function createActorWithConfig(): Promise<backendInterface> {
  return _createActorWithConfig<backendInterface>(createActor);
}
