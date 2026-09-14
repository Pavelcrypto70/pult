import { CompanyDetailClient } from "./company-detail-client";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function CompanyDetailPage() {
  return <CompanyDetailClient />;
}
