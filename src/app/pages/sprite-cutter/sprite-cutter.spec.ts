import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteCutter } from './sprite-cutter';

describe('SpriteCutter', () => {
  let component: SpriteCutter;
  let fixture: ComponentFixture<SpriteCutter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpriteCutter],
    }).compileComponents();

    fixture = TestBed.createComponent(SpriteCutter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
