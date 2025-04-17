import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinasDepComponent } from './rutinas-dep.component';

describe('RutinasDepComponent', () => {
  let component: RutinasDepComponent;
  let fixture: ComponentFixture<RutinasDepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinasDepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinasDepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
