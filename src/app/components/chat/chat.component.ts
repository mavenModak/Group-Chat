import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chat$: Observable<any>;
  newMsg: string;

  constructor(
    public cs: ChatService,
    private route: ActivatedRoute,
    public auth: AuthService
  ) { }

  ngOnInit(): void {

    const chatId = this.route.snapshot.paramMap.get('id');
    const source = this.cs.get(chatId);
    this.chat$ = this.cs.joinUsers(source);
    this.scrollBottom();
  }

  submit(chatId) {
    this.cs.sendMessage(chatId, this.newMsg);
    this.newMsg = '';
  }

  trackByCreated(i, msg) {
    return msg.createdAt;
  }

  private scrollBottom() {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
  }

}
