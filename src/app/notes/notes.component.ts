import { Component } from '@angular/core';
import { FormGroup, FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Notes } from '../services/notes';
import { merge, fromEvent, map, Observable, Observer, async } from 'rxjs';
import { liveQuery } from 'dexie';
import { db, Request } from '../services/db';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export class NotesComponent {
  requestLists$ = liveQuery(() => db.requestLists.toArray());
  requests: Request[] = [];
  notes: Notes[] = [];
  isOnline = true;

  constructor(
    private dataService: DataService
  ){
    this.fetchMessage();
    this.createOnline$().subscribe(data => {
      this.isOnline = data

      if(this.isOnline) this.flushCache();
    })

    this.requestLists$.subscribe(data => {
      this.requests = data;
    })
  }

  messageForm = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  //Triggers all request currently on cache
  flushCache(){
    //Iterates through all requests in cache
    this.requests.forEach(request => {
      console.log(request.id);
      switch (request.requestType) {
        case 'POST':
          this.messageForm.patchValue({
            message: request.body
          })
          this.submitMessage();
          db.requestLists.delete(request.id!);
          break;

        case 'DELETE':
          this.deleteNote(+request.body);
          db.requestLists.delete(request.id!);
          break;
      
        default:
          break;
      }
    })
  }

  fetchMessage(){
    this.dataService.getData('getNotes').subscribe({
      next: (next: any) => {
        console.log(next);
        this.notes = next.data;
      },
      error: (err: any) => {
        console.log(err)
      },
    })
  }

  //POST REQUEST
  submitMessage(){
    console.log(this.messageForm.get('message')?.value);

    if(this.isOnline){
      //Send as is if online
      this.dataService.postData(this.messageForm, "addMessage").subscribe({
        next: (next: any) => {
          console.log(next);
        },
        complete: () => {
          this.messageForm.get('message')?.reset();
          try {
            this.fetchMessage();
          } catch (error) {
            console.log(error);
          }
        }
      });
    }
    else{
      this.addNewRequest(this.messageForm.get('message')!.value+'', 'POST');
    }
  }

  //DELETE REQUEST
  deleteNote(id: number){
    console.log("Deleting...");

    if(this.isOnline){
      this.dataService.deleteData(id, 'deleteMessage?id=' + id).subscribe({
        complete: () => {
          this.messageForm.get('message')?.reset();
          try {
            this.fetchMessage();
          } catch (error) {
            console.log(error);
          }
        }
      })
    }
    else{
      this.addNewRequest(id+"", 'DELETE')
    }
  }

  //Creates a new record on IndexedDB
  async addNewRequest(body: string, request: string) {
    await db.requestLists.add({
      body: body,
      requestType: request
    })
  }

  //Observable function for ofline checking
  createOnline$() {
    return merge<any>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  
}
