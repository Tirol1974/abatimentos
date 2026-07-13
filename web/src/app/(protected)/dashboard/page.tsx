'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
import { BreadLinks } from "@/components/navigations/bread-links";
import { DevolucoesTab } from "./_tabs/devolucoes";
import { VerbasTab } from "./_tabs/verbas";

export default function Dashboardpage() {
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
            address: '/',
            name: 'Dashboard'
          }
        ]}
      />
      <Tabs defaultValue="devolucoes">
        <TabsList variant="line">
          <TabsTrigger value="devolucoes">
            <BanknoteArrowDown />
            Devoluções
          </TabsTrigger>
          <TabsTrigger value="verbas">
            <BanknoteArrowUp />
            Verbas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devolucoes" className="pt-3">
          <DevolucoesTab />
        </TabsContent>
        <TabsContent value="verbas" className="pt-3">
          <VerbasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}