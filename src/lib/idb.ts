import { openDB } from 'idb'
import type { Product } from '../types/product'

const DB_NAME = 'vitallens'
const DB_VERSION = 2

export const db = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains('scan_history')) {
        db.createObjectStore('scan_history', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('saved_products')) {
        db.createObjectStore('saved_products', { keyPath: 'barcode' })
      }
    }

    // Migration to version 2: Use barcode as key for history to prevent duplicates
    if (oldVersion < 2) {
      if (db.objectStoreNames.contains('scan_history')) {
        db.deleteObjectStore('scan_history')
      }
      const historyStore = db.createObjectStore('scan_history', { keyPath: 'barcode' })
      historyStore.createIndex('scanned_at', 'scanned_at')
    }
  }
})

export type HistoryEntry = {
  barcode: string
  product: Product
  scanned_at: string
}

export async function addToHistory(product: Product) {
  const entry: HistoryEntry = { 
    barcode: product.barcode, 
    product, 
    scanned_at: new Date().toISOString() 
  }
  return (await db).put('scan_history', entry)
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const all = await (await db).getAll('scan_history')
  return all.sort((a, b) => b.scanned_at.localeCompare(a.scanned_at))
}

export async function saveProduct(product: Product) {
  return (await db).put('saved_products', product)
}

export async function unsaveProduct(barcode: string) {
  return (await db).delete('saved_products', barcode)
}

export async function getSavedProducts(): Promise<Product[]> {
  return (await db).getAll('saved_products')
}

export async function isProductSaved(barcode: string): Promise<boolean> {
  const item = await (await db).get('saved_products', barcode)
  return !!item
}