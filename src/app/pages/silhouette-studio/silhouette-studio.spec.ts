import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SilhouetteStudio } from './silhouette-studio';

describe('SilhouetteStudio', () => {
  let component: SilhouetteStudio;
  let fixture: ComponentFixture<SilhouetteStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SilhouetteStudio],
    }).compileComponents();

    fixture = TestBed.createComponent(SilhouetteStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
