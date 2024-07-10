import { Component } from '@angular/core';
import { FormGroup, FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Notes } from '../services/notes';
import { merge, fromEvent, map, Observable, Observer, async, startWith } from 'rxjs';
import { liveQuery } from 'dexie';
import { db, Request } from '../services/db';
import { ServiceWorkerModule } from '@angular/service-worker';

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }

  interface SyncEvent {
    readonly lastChance: boolean;
    readonly tag: string;
  }

  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}

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
  prepSync = false;

  

  constructor(
    private dataService: DataService
  ){
    // Register service worker for some reason
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./custom-service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            registration.update();
          }, (error) => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }


    this.fetchMessage();
    this.createOnline$().subscribe(data => {
      this.isOnline = data

      if(this.isOnline) {
        this.prepSync = true;
        this.backgroundSync();
      }
    })

    this.requestLists$.subscribe(data => {
      this.requests = data;
    })

    // Listen to BroadcastChannel for updates
    const broadcast = new BroadcastChannel('dexie-updates');
    broadcast.onmessage = (event) => {
      if (event.data.type === 'delete') {
        // Trigger Dexie's liveQuery to refresh
        db.requestLists.where('id').equals(event.data.id).delete();
      }
    };


  }

  messageForm = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  fetchMessage(){
    this.dataService.getData('getNotes').subscribe({
      next: (next: any) => {this.notes = next.data;},
      error: (err: any) => {console.log(err)},
    })
  }

  //POST REQUEST
  submitMessage(){
    console.log(this.messageForm.get('message')?.value);

    if(this.isOnline){
      //Send as is if online
      this.dataService.postData(this.messageForm, "addMessage").subscribe({
        complete: () => {
          this.messageForm.get('message')?.reset();
          this.fetchMessage();
        },
        error: (err) => {
          console.log(err);
          this.addNewRequest(this.messageForm.get('message')!.value+'', 'POST');
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
        },
        error: (err) => {
          console.log(err);
          this.addNewRequest(id+"", 'DELETE');
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
      message: body,
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
      })
    ).pipe(
      startWith(navigator.onLine)
    );
  }
  
  showNotification() {
    Notification.requestPermission().then((result) => {
      console.log("Notif permission: ", result);
      if (result === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('Hello from Angular!', {
            body: 'This is a notification from your Angular app.'
          });
        });
      }
    });
  }

  backgroundSync() {
    // if ('serviceWorker' in navigator && 'SyncManager' in window) {
    //   navigator.serviceWorker.ready.then((registration) => {
    //     return registration.sync.register('queue-data')
    //       .then(() => {
    //         console.log('Sync registered');
    //       });
    //   }).catch((error) => {
    //     console.log('Sync registration failed:', error);
    //   });
    // }

    setTimeout(() =>
      {
        this.prepSync = false;
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            return new Promise((resolve, reject) => {
    
              registration.sync.register('queue-data');
              navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'SYNC_COMPLETE') {
                  if (event.data.success) {
                    console.log("Flush Finished!")
                    this.showNotification();
                    this.fetchMessage();
                    resolve("Yeet");
                  } else {
                    reject(event.data.error);
                  }
                }
              });
            }).catch((error) => {
              console.log('Sync registration failed:', error);
            });
          });
        }
      }, 2000);

  }
}
