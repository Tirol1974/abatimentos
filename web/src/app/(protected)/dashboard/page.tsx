'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BanknoteArrowDown, FileCheck2, Info } from "lucide-react";
import { BreadLinks } from "@/components/navigations/bread-links";
import { DevolucoesTab } from "./_tabs/devolucoes";
import { AbatimentosTab } from "./_tabs/abatimentos";
import { SobreTab } from "./_tabs/sobre";

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
          <TabsTrigger value="abatimentos">
            <FileCheck2 />
            Abatimentos
          </TabsTrigger>
          <TabsTrigger value="sobre">
            <Info />
            Sobre
          </TabsTrigger>
        </TabsList>
        <TabsContent value="devolucoes" className="pt-3">
          <DevolucoesTab />
        </TabsContent>
        <TabsContent value="abatimentos" className="pt-3">
          <AbatimentosTab />
        </TabsContent>
        <TabsContent value="sobre" className="pt-3">
          <SobreTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
