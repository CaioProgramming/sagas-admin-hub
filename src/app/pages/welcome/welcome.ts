import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoulKeyService } from '../../services/soul-key.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class Welcome {
  private soulKey = inject(SoulKeyService);
  private router = inject(Router);

  generatedPubKey = signal<string | null>(null);
  isProvisioning = signal(false);

  async provisionMachine() {
    this.isProvisioning.set(true);
    try {
      const pubKey = await this.soulKey.generateKeyPair();
      this.generatedPubKey.set(pubKey);
    } catch (e) {
      console.error('Provisioning failed:', e);
    } finally {
      this.isProvisioning.set(false);
    }
  }

  async tryEnter() {
    const isOk = await this.soulKey.validateHandshake();
    if (isOk) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      alert('Handshake Failed. Your machine is not provisioned with a Sagas Soul Key.');
    }
  }
}
