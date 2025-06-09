import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructoresControlComponent } from './instructores-control.component';

describe('InstructoresControlComponent', () => {
  let component: InstructoresControlComponent;
  let fixture: ComponentFixture<InstructoresControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructoresControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructoresControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
