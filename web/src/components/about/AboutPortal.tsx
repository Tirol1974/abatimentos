import { Separator } from "@/components/ui/separator";
import { Code2, MonitorCog } from "lucide-react";
import Image from "next/image";

export const AboutPortal = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-1 max-w-3xl flex-col justify-center items-center gap-8 py-4 text-center">
        <div className="relative h-40 w-full max-w-md">
          <Image
            src="/images/logo_ti_tirol.png"
            alt="Logo Tecnologia da Informação Tirol"
            fill
            className="object-contain"
            priority
          />
        </div>

        <Separator />

        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-muted">
            <MonitorCog className="size-6" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">
              Time Interno de Sistemas Tirol
            </span>
            <span className="text-sm text-muted-foreground">
              Soluções digitais construídas por quem vive o processo.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Code2 className="size-5 text-muted-foreground" />
          <span className="text-sm">
            Desenvolvido por <strong>André Lucas Trevizan</strong>
          </span>
        </div>

        <div className="relative h-16 w-full max-w-md">
          <Image
            src="/images/slogan.png"
            alt="Juntos pela transformação"
            fill
            className="object-contain"
          />
        </div>

        <span className="text-xs text-muted-foreground">
          Todos os direitos reservados à Laticínios Tirol LTDA.
        </span>
      </div>
    </div>
  );
}
