import FeatureUnavailable from "./FeatureUnavailable";
import { useOwnerBasePath } from "../utils/ownerPaths";

export function CreateLeasePage() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Create lease" homeTo={base} />;
}

export function LeaseDetailPage() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Lease details" homeTo={base} />;
}

export function AllRentDetailPage() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Rent details" homeTo={base} />;
}

export function CreateRentDetail() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Create rent detail" homeTo={base} />;
}

export function SingleRentDetail() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Rent detail" homeTo={base} />;
}

export function SendPaymentEmailPage() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Send payment email" homeTo={base} />;
}

export function CreatePaymentHistory() {
  const base = useOwnerBasePath();
  return <FeatureUnavailable title="Payment history" homeTo={base} />;
}
