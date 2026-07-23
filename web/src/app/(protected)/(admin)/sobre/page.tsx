import { AboutPortal } from "@/components/about/AboutPortal";
import { BreadLinks } from "@/components/navigations/bread-links";

export default function SobrePage() {
  return (
    <div className="flex flex-col gap-y-10">
      <BreadLinks
        links={[
          {
            actual: false,
            address: '/',
            name: 'Home'
          },
          {
            actual: true,
            address: '/sobre',
            name: 'Sobre'
          }
        ]}
      />

      <AboutPortal />
    </div>
  );
}
