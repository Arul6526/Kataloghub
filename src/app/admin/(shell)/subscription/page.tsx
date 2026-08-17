import {
  getMySubscription,
  getSubscriptionPlans,
  getPlatformPaymentSettings,
} from "@/lib/actions/saas-actions";
import { SubscriptionClientView } from "./subscription-client";

export default async function SubscriptionPage() {
  const [data, plans, paymentSettings] = await Promise.all([
    getMySubscription(),
    getSubscriptionPlans(),
    getPlatformPaymentSettings(),
  ]);

  return (
    <SubscriptionClientView
      subscription={data.subscription}
      productCount={data.productCount}
      maxProducts={data.maxProducts}
      brandName={data.brandName}
      storeSlug={data.storeSlug}
      payments={data.payments}
      plans={plans}
      bankAccounts={paymentSettings.bankAccounts}
      paymentInstructions={paymentSettings.instructions}
    />
  );
}
