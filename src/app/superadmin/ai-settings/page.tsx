import { getPlatformAiSettingsAction } from "@/lib/actions/ai-actions";
import { PlatformAiSettingsForm } from "./platform-ai-settings-form";

export default async function PlatformAiSettingsPage() {
  const settings = await getPlatformAiSettingsAction();
  return <PlatformAiSettingsForm settings={settings} />;
}
