import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StagingService } from '../../services/staging.service';

@Component({
  selector: 'app-staging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staging.html',
  styleUrls: ['./staging.css']
})
export class Staging implements OnInit {
  staging = inject(StagingService);
  modifiedKeys: string[] = [];
  isPushing = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.modifiedKeys = this.staging.getModifiedKeys();
  }

  async push() {
    if (!confirm('Are you sure you want to push these changes to PRODUCTION? This will affect all live users.')) return;
    
    this.isPushing = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      await this.staging.pushToProduction();
      this.successMessage = 'Successfully pushed to production!';
      this.refresh();
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isPushing = false;
    }
  }

  discard() {
    if (!confirm('Discard all staging changes?')) return;
    this.staging.discardChanges();
    this.refresh();
  }
}
