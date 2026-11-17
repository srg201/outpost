import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const SiteHeader = () => {
  const isSignedIn = false;
  const isLandingPage = true;
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-18 items-center justify-between border-b border-white/6 bg-background/70 px-6 backdrop-blur-md md:px-10">
      <Link className="flex items-center" href={"/"}>
        <Image
          src={"/brand/logo-navbar-dark.png"}
          alt="Outpost"
          width={314}
          height={160}
          className="h-9 w-auto"
          priority
        />
      </Link>

      {isLandingPage && (
        <nav className="flex gap-4 items-center">
          <Button nativeButton={false} variant={"link"} render={<Link href={"/product"}>Product</Link>} />
          <Button nativeButton={false} variant={"link"} render={<Link href={"/how-it-works"}>How it works</Link>} />
          <Button nativeButton={false} variant={"link"} render={<Link href={"/Pricing"}>Pricing</Link>} />
        </nav>
      )}


      <Button>
        Sign in
      </Button>
    </header>
  );
};

export default SiteHeader;
