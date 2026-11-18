import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StartBuildingButton } from "./start-building-button";
import { Eyebrow } from "./section-heading";
import { getDictionary } from "@/i18n/get-dictionary";

export async function CtaSection() {
  const { cta } = await getDictionary();

  return (
    <section aria-labelledby="cta-title" className="px-6 pb-24 md:pb-32">
      <Card className="reveal relative isolate mx-auto max-w-6xl items-center rounded-3xl bg-card/40 px-6 py-20 text-center md:py-28">
        <div aria-hidden className="bg-topo absolute inset-0 -z-10 opacity-15 dark:opacity-20" />

        <CardHeader className="flex w-full flex-col items-center gap-5">
          <Eyebrow>{cta.eyebrow}</Eyebrow>
          <CardTitle>
            <h2
              id="cta-title"
              className="max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl"
            >
              {cta.titleBefore} <span className="text-amber-500">Outpost</span>
            </h2>
          </CardTitle>
          <CardDescription className="max-w-lg text-base">
            {cta.description}
          </CardDescription>
        </CardHeader>

        <CardFooter className="mt-5">
          <StartBuildingButton />
        </CardFooter>
      </Card>
    </section>
  );
}
