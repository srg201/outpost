import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/web/status-screen";
import { getDictionary } from "@/i18n/get-dictionary";

// Shown for notFound() anywhere under a locale, and for unknown URLs via [...missing].
export default async function NotFound() {
  const { errors } = await getDictionary();
  return (
    <StatusScreen code="404" title={errors.notFoundTitle} description={errors.notFoundDescription}>
      <Button nativeButton={false} render={<Link href="/" />}>
        {errors.home}
      </Button>
    </StatusScreen>
  );
}
