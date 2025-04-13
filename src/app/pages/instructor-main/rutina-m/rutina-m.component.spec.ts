import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinaMComponent } from './rutina-m.component';

describe('RutinaMComponent', () => {
  let component: RutinaMComponent;
  let fixture: ComponentFixture<RutinaMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinaMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinaMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
