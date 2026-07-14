import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";

type Links = {
  address: string
  name: string
  actual: boolean
}

type BreadLinksProps = {
  links: Links[]
}

export const BreadLinks = ({
  links
}: BreadLinksProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map((link) => (
          <>
            <BreadcrumbItem key={link.name}>
              {link.actual ? (
                <BreadcrumbPage>{link.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={link.address}>{link.name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!link.actual && <BreadcrumbSeparator />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}