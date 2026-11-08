'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/** Valor de "sucursal activa" que significa ver ambas sucursales. */
export const TODAS = 'todas'

const PanelContext = createContext(null)

/**
 * Estado compartido por todas las secciones del panel. Lo crea (panel)/layout.js una sola vez,
 * así que sobrevive a la navegación entre Finanzas, Pedidos y Personal.
 */
export function PanelProvider({ usuario, sucursales, children }) {
  const [sucursalActiva, setSucursalActiva] = useState(
    usuario.rol === 'admin' ? usuario.sucursal_id : TODAS
  )
  const [encabezadoExtra, setEncabezadoExtra] = useState(null)

  // Caché en memoria: al volver a una sección se muestran sus últimos datos al instante
  // mientras se recargan en segundo plano. Se pierde al recargar el navegador.
  const cache = useRef(new Map())
  const leerCache = useCallback((clave) => cache.current.get(clave), [])
  const guardarCache = useCallback((clave, valor) => { cache.current.set(clave, valor) }, [])

  const valor = useMemo(() => ({
    usuario,
    sucursales,
    sucursalActiva,
    setSucursalActiva,
    esVistaGlobal: sucursalActiva === TODAS,
    nombreSucursalActiva: sucursalActiva === TODAS
      ? 'Ambas sucursales'
      : (sucursales.find(s => s.id === sucursalActiva)?.nombre || ''),
    encabezadoExtra,
    setEncabezadoExtra,
    leerCache,
    guardarCache,
  }), [usuario, sucursales, sucursalActiva, encabezadoExtra, leerCache, guardarCache])

  return <PanelContext.Provider value={valor}>{children}</PanelContext.Provider>
}

export function usePanel() {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel() debe usarse dentro de (panel)/layout.js')
  return ctx
}
