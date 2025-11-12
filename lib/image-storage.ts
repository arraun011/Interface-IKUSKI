/**
 * Utilidad para almacenar imágenes usando IndexedDB
 * IndexedDB tiene mucho más espacio (~50MB-1GB) que sessionStorage (~5-10MB)
 */

const DB_NAME = 'ikuski-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

let dbInstance: IDBDatabase | null = null

/**
 * Inicializa la base de datos IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Error abriendo IndexedDB'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Guarda una imagen en IndexedDB
 */
export async function saveImage(id: string, imageData: string): Promise<void> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.put({ id, data: imageData, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Error guardando imagen'))
    })
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error)
    throw error
  }
}

/**
 * Obtiene una imagen de IndexedDB
 */
export async function getImage(id: string): Promise<string | null> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }

      request.onerror = () => reject(new Error('Error obteniendo imagen'))
    })
  } catch (error) {
    console.error('Error getting image from IndexedDB:', error)
    return null
  }
}

/**
 * Guarda múltiples imágenes en IndexedDB
 */
export async function saveImages(images: Array<{ id: string; url: string }>): Promise<void> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const promises = images.map(img => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put({ id: img.id, data: img.url, timestamp: Date.now() })
        request.onsuccess = () => resolve()
        request.onerror = () => reject()
      })
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Error saving images to IndexedDB:', error)
    throw error
  }
}

/**
 * Obtiene múltiples imágenes de IndexedDB
 */
export async function getImages(ids: string[]): Promise<Map<string, string>> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const imageMap = new Map<string, string>()

    const promises = ids.map(id => {
      return new Promise<void>((resolve) => {
        const request = store.get(id)
        request.onsuccess = () => {
          if (request.result) {
            imageMap.set(id, request.result.data)
          }
          resolve()
        }
        request.onerror = () => resolve() // Continuar aunque falle
      })
    })

    await Promise.all(promises)
    return imageMap
  } catch (error) {
    console.error('Error getting images from IndexedDB:', error)
    return new Map()
  }
}

/**
 * Elimina una imagen de IndexedDB
 */
export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Error eliminando imagen'))
    })
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error)
    throw error
  }
}

/**
 * Limpia todas las imágenes de IndexedDB
 */
export async function clearAllImages(): Promise<void> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Error limpiando imágenes'))
    })
  } catch (error) {
    console.error('Error clearing images from IndexedDB:', error)
    throw error
  }
}
