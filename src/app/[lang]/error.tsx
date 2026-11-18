"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/web/status-screen";
import { useI18n } from "@/i18n/client";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { errors } = useI18n().dict;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen code="Error" title={errors.errorTitle} description={errors.errorDescription}>
      <Button onClick={retry}>{errors.retry}</Button>
      <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
        {errors.home}
      </Button>
    </StatusScreen>
  );
}
