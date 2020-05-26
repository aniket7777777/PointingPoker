import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SocketService} from '../socket.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  selectedOption = new FormControl('');
  private file: any;
  private roomId: any;

  constructor(private formBuilder: FormBuilder,
              private socketService: SocketService,
              private snackbar: MatSnackBar,
              private router: Router) {

  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      accessCode: '',
      uploadUrl: ''
    });
  }

  upload(): void {
    this.socketService.upload(this.file, this.loginForm.get('username').value)
      .subscribe(response => {
        this.snackbar.open('File Uploaded!', '', {
          panelClass: ['ml-success-snackbar'],
          duration: 3000
        });
        this.roomId = response;
      }, error1 => {
        this.snackbar.open('File Uploaded!', '', {
          panelClass: ['ml-error-snackbar'],
          duration: 3000
        });
      });
  }

  login(): void {
    this.socketService.setUsername(this.loginForm.get('username').value);
    if (this.selectedOption.value === 'manual') {
      this.socketService.send('createManually', {username: this.loginForm.get('username').value});
    } else {
      if (this.roomId == null) {
        this.roomId = this.loginForm.get('accessCode').value;
      }
      this.socketService.setRoomId(this.roomId);
      this.socketService.send('login', {username: this.loginForm.get('username').value, roomId: this.roomId.toString()});
    }
    this.router.navigate(['/pointingDashboard']);
  }

  fileChange(element) {
    this.file = element.target.files[0];
  }
}
