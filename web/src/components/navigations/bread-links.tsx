import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import Link from "next/link";
import { Fragment } from "react";

type Links = {
  address: string
  name: string
  actual?: boolean
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
        {links.map((link, index) => {
          const isCurrentPage = link.actual ?? index == links.length - 1;

          return (
            <Fragment key={`${link.address}-${link.name}-${index}`}>
              <BreadcrumbItem>
                {isCurrentPage ? (
                  <BreadcrumbPage>{link.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={link.address}>{link.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isCurrentPage && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
