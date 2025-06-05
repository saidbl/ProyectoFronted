import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDeportistaComponent } from './chat-deportista.component';

describe('ChatDeportistaComponent', () => {
  let component: ChatDeportistaComponent;
  let fixture: ComponentFixture<ChatDeportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDeportistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDeportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
