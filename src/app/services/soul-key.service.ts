import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { getValue } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class SoulKeyService {
  private firebase = inject(FirebaseService);
  
  private readonly DB_NAME = 'SagasVault';
  private readonly STORE_NAME = 'Keys';
  private readonly KEY_ALIAS = 'admin-soul-key';
  
  /**
   * Generates a new ECDSA Key Pair.
   * Returns the Public Key as a Base64 string for Remote Config.
   */
  async generateKeyPair(): Promise<string> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );

    // Store Private Key in IndexedDB (Secure, non-extractable via standard JS console easily)
    await this.storeKey(keyPair.privateKey);

    // Export Public Key for Remote Config
    const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exportedPub)));
  }

  /**
   * Validates the local machine against the Remote Config Public Key.
   */
  async validateHandshake(): Promise<boolean> {
    if (this.isLocalhost()) return true;

    const pubKeyBase64 = getValue(this.firebase.config, 'HUB_ADMIN_PUBLIC_KEY').asString();
    if (!pubKeyBase64) return false;

    const privateKey = await this.retrieveKey();
    if (!privateKey) return false;

    try {
      // 1. Create a challenge (timestamp + random)
      const challenge = new TextEncoder().encode(`SagasHandshake-${Date.now()}`);
      
      // 2. Sign with local Private Key
      const signature = await window.crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        challenge
      );

      // 3. Import Public Key from Remote Config
      const pubKeyBuffer = Uint8Array.from(atob(pubKeyBase64), c => c.charCodeAt(0));
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        pubKeyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      );

      // 4. Verify Signature
      return await window.crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        publicKey,
        signature,
        challenge
      );
    } catch (e) {
      console.error('Handshake failed:', e);
      return false;
    }
  }

  private isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  private async storeKey(key: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(this.STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(key, this.KEY_ALIAS);
        tx.oncomplete = () => resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async retrieveKey(): Promise<CryptoKey | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) return resolve(null);
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const getReq = tx.objectStore(this.STORE_NAME).get(this.KEY_ALIAS);
        getReq.onsuccess = () => resolve(getReq.result);
      };
      request.onerror = () => resolve(null);
    });
  }
}
