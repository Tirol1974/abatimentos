'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BanknoteArrowDown, BanknoteArrowUp, FileCheck2 } from "lucide-react";
import { BreadLinks } from "@/components/navigations/bread-links";
import { DevolucoesTab } from "./_tabs/devolucoes";
import { VerbasTab } from "./_tabs/verbas";
import { AbatimentosTab } from "./_tabs/abatimentos";

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
          <TabsTrigger value="abatimentos">
            <FileCheck2 />
            Abatimentos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devolucoes" className="pt-3">
          <DevolucoesTab />
        </TabsContent>
        <TabsContent value="verbas" className="pt-3">
          <VerbasTab />
        </TabsContent>
        <TabsContent value="abatimentos" className="pt-3">
          <AbatimentosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
