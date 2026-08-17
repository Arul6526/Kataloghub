import { getMyAiSettingsAction } from "@/lib/actions/ai-actions";
import { AiConfigForm } from "./ai-config-form";

export default async function AiConfigPage() {
  const settings = await getMyAiSettingsAction();
  return <AiConfigForm settings={settings} />;
}
