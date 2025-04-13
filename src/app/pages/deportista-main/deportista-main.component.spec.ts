import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeportistaMainComponent } from './deportista-main.component';

describe('DeportistaMainComponent', () => {
  let component: DeportistaMainComponent;
  let fixture: ComponentFixture<DeportistaMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeportistaMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeportistaMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
