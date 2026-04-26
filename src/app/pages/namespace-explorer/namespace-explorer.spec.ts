import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamespaceExplorer } from './namespace-explorer';

describe('NamespaceExplorer', () => {
  let component: NamespaceExplorer;
  let fixture: ComponentFixture<NamespaceExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamespaceExplorer],
    }).compileComponents();

    fixture = TestBed.createComponent(NamespaceExplorer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
