"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
      <h2 className="text-base font-bold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export default function ReglamentoPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={user?.isAdmin ?? false} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Reglamento</h1>
          <p className="text-gray-500 text-sm">Mundial 2026 — Prode oficial del grupo</p>
        </div>

        <Section title="📋 Formato del Torneo">
          <div className="space-y-1">
            <Row label="Equipos participantes" value="48 selecciones" />
            <Row label="Grupos" value="12 grupos de 4 equipos" />
            <Row label="Clasifican por grupo" value="Los 2 primeros + 8 mejores terceros" />
            <Row label="Fase eliminatoria" value="16avos → Octavos → Cuartos → Semis → Final" />
            <Row label="Total de partidos" value="103 partidos" />
          </div>
        </Section>

        <Section title="⚽ Sistema de Puntos por Partido">
          <p className="text-xs text-gray-400 mb-3">Los puntos se multiplican según la fase del torneo</p>
          <div className="space-y-1">
            <Row label="Resultado exacto" value="3 puntos × multiplicador" />
            <Row label="Resultado correcto (G/E/P)" value="1 punto × multiplicador" />
            <Row label="Resultado incorrecto" value="0 puntos" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Multiplicadores por fase</p>
            <div className="space-y-1">
              <Row label="Fase de Grupos" value="× 1" />
              <Row label="16avos de Final" value="× 1.5" />
              <Row label="Octavos de Final" value="× 2" />
              <Row label="Cuartos de Final" value="× 2" />
              <Row label="Semifinales" value="× 3" />
              <Row label="Final" value="× 4" />
            </div>
          </div>
        </Section>

        <Section title="🏆 Bonus del Torneo">
          <p className="text-xs text-gray-400 mb-3">
            Se predicen antes del inicio del Mundial. Se cierran 24hs antes del primer partido (11 Jun 2026).
          </p>
          <div className="space-y-1">
            <Row label="Acertar el Campeón" value="+18 puntos" />
            <Row label="Acertar el Goleador" value="+8 puntos" />
          </div>
        </Section>

        <Section title="⏰ Plazos para Predecir">
          <div className="space-y-1">
            <Row label="Partidos de fase grupal y eliminatoria" value="Hasta 24hs antes del partido" />
            <Row label="Campeón y Goleador del torneo" value="Hasta 24hs antes del 11 Jun 2026" />
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              Una vez cerrado el plazo, no se pueden modificar ni agregar predicciones para ese partido. ¡No te olvides de predecir antes!
            </p>
          </div>
        </Section>

        <Section title="📅 Fechas Clave">
          <div className="space-y-1">
            <Row label="Inicio del Mundial" value="11 Jun 2026" />
            <Row label="Inicio de la Fase Eliminatoria" value="28 Jun 2026" />
            <Row label="16avos de Final" value="28 Jun – 1 Jul 2026" />
            <Row label="Octavos de Final" value="4 – 7 Jul 2026" />
            <Row label="Cuartos de Final" value="9 – 10 Jul 2026" />
            <Row label="Semifinales" value="14 – 15 Jul 2026" />
            <Row label="Final" value="19 Jul 2026" />
            <Row label="Sede de la Final" value="MetLife Stadium, New Jersey" />
          </div>
        </Section>

        <Section title="🌍 Sedes">
          <div className="space-y-1">
            <Row label="Estados Unidos" value="11 estadios (New York, LA, Dallas, Miami, Houston, SF, Seattle, KC, Boston, Atlanta, Filadelfia)" />
            <Row label="México" value="3 estadios (Ciudad de México, Guadalajara, Monterrey)" />
            <Row label="Canadá" value="2 estadios (Toronto, Vancouver)" />
          </div>
        </Section>

        <Section title="❓ Preguntas Frecuentes">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">¿Puedo cambiar mi predicción?</p>
              <p className="text-xs text-gray-500 mt-0.5">Sí, podés actualizarla tantas veces como quieras, siempre que el plazo no haya cerrado.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">¿Qué pasa con los partidos eliminatorios que van a tiempo extra o penales?</p>
              <p className="text-xs text-gray-500 mt-0.5">Se considera el resultado al final del tiempo reglamentario (90 min). Si hay empate, el resultado es empate independientemente de lo que pase en extra time o penales.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">¿Cómo se ingresan los resultados?</p>
              <p className="text-xs text-gray-500 mt-0.5">Solo el administrador puede ingresar los resultados oficiales después de cada partido.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">¿Cómo se desempata en la tabla de posiciones del prode?</p>
              <p className="text-xs text-gray-500 mt-0.5">Por puntos totales. En caso de empate, se define por diferencia de puntos en fases avanzadas (TBD por el admin).</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
