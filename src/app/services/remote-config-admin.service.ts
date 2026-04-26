import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { secrets } from '../../environments/environment.secret';
import * as jose from 'jose';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigAdminService {
  private http = inject(HttpClient);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private etag: string | null = null;

  private readonly PROJECT_ID = secrets.serviceAccount?.project_id || 'sagas-adventure';
  private readonly BASE_URL = `https://firebaseremoteconfig.googleapis.com/v1/projects/${this.PROJECT_ID}/remoteConfig`;

  /**
   * Generates a Google OAuth2 Access Token using the Service Account key and jose library.
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!secrets.serviceAccount) {
      throw new Error('Service Account key missing in environment.secret.ts');
    }

    const sa = secrets.serviceAccount;
    const now = Math.floor(Date.now() / 1000);
    
    // 1. Create the JWT Header and Payload
    const jwt = await new jose.SignJWT({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.remoteconfig',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: sa.private_key_id })
      .sign(await jose.importPKCS8(sa.private_key, 'RS256'));

    // 2. Exchange JWT for Access Token
    const response: any = await firstValueFrom(
      this.http.post('https://oauth2.googleapis.com/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    );

    this.accessToken = response.access_token;
    this.tokenExpiry = Date.now() + response.expires_in * 1000;
    return this.accessToken!;
  }

  /**
   * Fetches the current Remote Config template and stores the ETag.
   */
  async getTemplate(): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(this.BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Encoding': 'gzip'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    this.etag = response.headers.get('ETag');
    return await response.json();
  }

  /**
   * Pushes a new Remote Config template to Production.
   */
  async publishTemplate(template: any): Promise<void> {
    if (!this.etag) {
      // Ensure we have the latest ETag before pushing
      await this.getTemplate();
    }

    const token = await this.getAccessToken();
    
    const response = await fetch(this.BASE_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'If-Match': this.etag!,
        'Accept-Encoding': 'gzip'
      },
      body: JSON.stringify(template)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Remote Config Push Error:', error);
      throw new Error(`Failed to publish template: ${error.error?.message || response.statusText}`);
    }

    // Update ETag for next operation
    this.etag = response.headers.get('ETag');
  }
}
