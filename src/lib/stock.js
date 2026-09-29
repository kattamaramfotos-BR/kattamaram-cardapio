import { supabase } from './supabase'

export async function getInventory(locationName) {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      id, quantity, updated_at,
      products (id, name, unit, minimum_stock, categories (id, name)),
      locations (id, name, type)
    `)
    .eq('locations.name', locationName)
    .order('updated_at', { ascending: false })
  return { data: data ?? [], error }
}

export async function getDashboardStats() {
  if (!supabase) return { container: 0, barco: 0, lowStock: 0, products: 0, error: null }

  const { data: rows, error } = await supabase
    .from('inventory')
    .select('quantity, location_id, product_id, products(minimum_stock), locations(name)')

  if (error) return { container: 0, barco: 0, lowStock: 0, products: 0, error }

  let container = 0, barco = 0, lowStock = 0
  const ids = new Set()

  for (const row of rows ?? []) {
    ids.add(row.product_id)
    const qty = Number(row.quantity || 0)
    if (row.locations?.name === 'Container') container += qty
    if (row.locations?.name === 'Kattamaram II') barco += qty
    if (qty <= Number(row.products?.minimum_stock ?? 0)) lowStock++
  }

  return { container, barco, lowStock, products: ids.size, error: null }
}
