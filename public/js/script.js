"use strict";

const App = (function() {
  const css = (el, bool = false) => bool ? document.querySelectorAll(el) : document.querySelector(el);
  const ready = function() {
    const config = {
      root: '/kommentae/public',
      blue:  '#1b7fa6',
      red: '#eb2727',
      white: '#fff',
      grey: '#cfcfcf',
      black: 'rgba(0,0,0,0.85)',
      lightBlack: 'rgba(0,0,0,0.25)'
    };

    const userForm = css('.user-form') || false;
    const logout = css('.logout') || false;
    const conn = new WebSocket('ws://localhost:8080');
    conn.onopen = function (e) {
      console.log("Connection established!");
    };

    conn.onmessage = function (e) {
      console.log(e.data);
    };
///////////////////////////////////////////////////////////////////////////// UserForm {}
    const UserForm = {
      type: 'login',
      ready: true,

      switch: function(el, complete, button) {
        el.map(element => {
          element[0].style.opacity = element[1];
        })
        setTimeout(function() {
          el.map(element => {
            element[0].style.height = element[2];
            element[0].style.marginBottom = element[3];
          })

          UserForm.type = complete;
        }, 500);

        let buttons = css('.user-form__btn > button', true);

        Array.prototype.slice.call(buttons).map((btn, i) => {
          btn.style.top = button[i][0];
          btn.style.opacity = button[i][1];
        });
      },

      clear: function(username, password, email) {
        username.value = '';
        password.value = '';
        email.value = '';
      }
    };
///////////////////////////////////////////////////////////////////////////// Response {}
    const Response = {
      isJSON: function(response) {
        let success = false;

        try {
          if(JSON.parse(response) && typeof JSON.parse(response) === 'object') success = true;
        } catch(e) { console.log(e) };

        return success;
      },

      http: function(callback, method, url, send = '', header = 'application/x-www-form-urlencoded') {
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if(this.status === 200 && this.readyState === 4) {
            let response = this.responseText;
            console.log(response);

            if(Response.isJSON(response)) {
              let data = JSON.parse(response);
              callback(data);
            }
          }
        };

        xhttp.open(method, url, true);
        xhttp.setRequestHeader('content-type', header);
        xhttp.send(send);
      }
    };// End of Response {}
///////////////////////////////////////////////////////////////////////////// Storage {}
    const Storage = {
      set: function (ssid) {
        localStorage.setItem('ssid', ssid);
        sessionStorage.setItem('ssid', ssid);
      },

      get: function () {
        let ssid = localStorage.getItem('ssid') ? localStorage.getItem('ssid') : sessionStorage.getItem('ssid');
        return { ssid };
      },

      clear: function () {
        localStorage.clear();
        sessionStorage.clear();
      }
    }; // End of Storage {}
///////////////////////////////////////////////////////////////////////////// User {}
    const User = {
      username: '',
      get: function () {
        let username = User.username;

        return { username };
      },

      set: function(ssid) {
        Response.http(function (response) {
          if (response.ready) User.username = response.username;
          else console.log('User not found.');
        }, 'get', config.root + '/api/user?ssid=' + ssid);
      },

      login: function(username, password, warning, load) {
        load.classList.add('user-form__btn--load');
        Response.http(function(response) {
          if (response.ready) {
            Storage.set(response.ssid);
            window.location.href = response.location;
          } else {
            warning.innerHTML = response.warning;
            load.classList.remove('user-form__btn--load');
            UserForm.ready = true;
          }
        }, 'post', config.root + '/api/login', 'username=' + username + '&password=' + password);
      },

      signup: function (username, password, email, warning, load) {
        load.classList.add('user-form__btn--load');
        Response.http(function (response) {
          if (response.ready) {
            Storage.set(response.ssid);
            window.location.href = response.location;
          } else {
            let warnings = '';
            response.warnings.map(warn => {
              warnings += warn + '<br>';
            });

            warning.innerHTML = warnings;
            load.classList.remove('user-form__btn--load');
            UserForm.ready = true;
          }
        }, 'post', config.root + '/api/signup', 'username=' + username + '&password=' + password + '&email=' + email);
      },

      reset: function (email, warning, load) {
        load.classList.add('user-form__btn--load');
        Response.http(function (response) {
          if (response.ready) {
            warning.innerHTML = response.warning;
            warning.classList.add('success');
            email.value = '';
            load.classList.remove('user-form__btn--load');
          } else {
            warning.innerHTML = response.warning;
            load.classList.remove('user-form__btn--load');
            warning.classList.remove('success');
          }
          UserForm.ready = true;
        }, 'post', config.root + '/api/reset', 'email=' + email.value);
      },

      logout: function() {
        Storage.clear();
        Response.http(function (response) {
          if (response.ready) window.location.href = response.location;
        }, 'post', config.root + '/api/logout', 'logout=true');
      }
    }; // End of User {}
///////////////////////////////////////////////////////////////////////////// userForm --
    if(userForm) {
      userForm.onsubmit = e => e.preventDefault();
      userForm.onkeydown = (e) => {
        if((e.key.toLowerCase() === 'enter' || e.keyCode === 13) && UserForm.ready) {
          if (UserForm.type === 'login') loginBtn.click();
          else if (UserForm.type === 'signup') signupBtn.click();
          else if (UserForm.type === 'reset') resetBtn.click();
          else console.log('You did something stupid.');
          UserForm.ready = false;
        }
      };

      const userBtn = css('.user-form__btn'),
      loginBtn = css('.user-form__login-btn'),
      signupBtn = css('.user-form__signup-btn'),
      resetBtn = css('.user-form__reset-btn'),
      warning = css('.user-form__warning');

      let userFormHeader = css('.user-form h2'),
      resetPassword = css('.reset-password'),
      switchFormHTML = css('.user-form__switch'),
      switchForm = css('.user-form__switch > span'),
      username = css('.user-form__field-username'),
      email = css('.user-form__field-email'),
      password = css('.user-form__field-password');

      const switchFormText = (header, switchData, switchHTML, opacity, top, displayOrOpacity, bool= false) => {
        userFormHeader.innerHTML = header;
        switchFormHTML.firstChild.data = switchData;
        switchForm.innerHTML = switchHTML;
        switchFormHTML.style.opacity = opacity;
        userFormHeader.style.top = top;
        if (bool) resetPassword.style.display = displayOrOpacity;
        else {
          resetPassword.style.display = 'block';
          resetPassword.style.opacity = displayOrOpacity;
        }
      };

      switchForm.onclick = function () {
        warning.classList.remove('success');
        warning.innerHTML = '';
        switchFormHTML.style.opacity = '0';
        userFormHeader.style.top = '-15px';
        if(UserForm.type === 'login') {
          resetPassword.style.opacity = '0';
          setTimeout(() => switchFormText('Signup', 'Have an account?', 'Login', '1', '0', 'none', true), 500);
          UserForm.switch([
            [username, '1', '70px', '7px'], 
            [password, '1', '70px', '7px'], 
            [email, '1', '70px', '7px']
          ], 'signup', [['70px', '0'], ['0', '1'], ['70px', '0']]);
          email.children[1].tabIndex = '2';
          password.children[1].tabIndex = '3';
        } else if (UserForm.type === 'signup' || UserForm.type === 'reset') {
          setTimeout(() => switchFormText('Login', 'Don\'t have an account?', 'Signup', '1', '0', '1'), 500);
          UserForm.switch([
            [username, '1', '70px', '7px'], 
            [password, '1', '70px', '7px'], 
            [email, '0', '0', '0']
          ], 'login', [['0', '1'], ['70px', '0'], ['70px', '0']]);
          email.children[1].tabIndex = '3';
          password.children[1].tabIndex = '2';
        }
      };

      resetPassword.onclick = function() {
        warning.innerHTML = '';
        userFormHeader.style.top = '-15px';
        setTimeout(() => switchFormText('Reset', 'Have an account?', 'Login', '1', '0', 'none', true), 500);
        UserForm.switch([
          [username, '0', '0', '0'], 
          [password, '0', '0', '0'], 
          [email, '1', '70px', '7px']
        ], 'reset', [['70px', '0'], ['70px', '0'], ['0', '1']]);
      };
      loginBtn.onclick = () => User.login(username.lastElementChild.value, password.lastElementChild.value, warning, userBtn);
      signupBtn.onclick = () => User.signup(username.lastElementChild.value, password.lastElementChild.value, email.lastElementChild.value, warning, userBtn);
      resetBtn.onclick = () => User.reset(email.lastElementChild, warning, userBtn);
    } // End of user form

    ///////////////////////////////////////////// LOGOUT
    if (logout) logout.onclick = () => User.logout();
///////////////////////////////////////////////////////////////////////////// Comment {}
    const Comment = {
      images: '',

      time: function(timestamp) {
        let time;

        let minutes = Math.round(((new Date().getTime() / 1000) - timestamp) / 60); // minutes
        if (minutes < 1) time = 'now';
        else if (minutes >= 60 && minutes < (60 * 24)) time = Math.round(minutes / 60) + 'h';
        else if (minutes >= (60 * 24)) time = Math.round(minutes / 60 / 24) + 'd';
        else time = minutes + 'm';

        return time;
      },

      component: function(cid, username, message, posted, secret) {
        let time = Comment.time(posted);

        message = message.replace(/&lt;b&gt;(.*)&lt;\/b&gt;/g, '<b>$1</b>');
        message = message.replace(/&lt;i&gt;(.*)&lt;\/i&gt;/g, '<b>$1</b>');
        message = message.replace(/&lt;size=([\d\.]+)&gt;(.*)&lt;\/size&gt;/g, function(_, size, content) {
          if (size >= 0.85 && size <= 2.25) return `<span style="font-size: ${size}rem">${content}</span>`;
        });
        message = message.replace(/&lt;color=([\w\s]+)&gt;(.*)&lt;\/color&gt;/g, '<span style="color: $1">$2</span>');
        message = message.replace(/&lt;image=(https:\/\/[\w\.\/\-\%]*jpg)&gt;(.*)&lt;\/image&gt;/g, '<img class="km-image" src="$1"> $2');


        return `
          <section class="km-block km-comment__block" data-postid="${cid}">
            <div class="km-timestamp" data-timestamp="${posted}">${time}</div>
            <div class="km-username km-comment__username">${username}</div>
            <div class="km-message km-comment__message">${message}</div>
            <footer class="km-footer km-comment__footer">
              <span class="km-reply">Reply</span>
              <span class="km-report" data-secret="${secret}">Report</span>
            </footer>
            
            <div class="km-replies"></div>

            <div class="km-reply__form"></div>
          </section>
        `;
      }
    }; // End of Comment {}
    ///////////////////////////////////////////////////////////////////////////// Reply {}
    const Reply = {
      component: function (username, message) {
        return `
          <section class="km-block km-reply__block">
            <div class="km-username km-reply__username">${username}</div>
            <div class="km-message km-reply__message">${message}</div>
            <footer class="km-footer km-reply__footer">
              <span class="km-reply">Reply</span>
              <span class="km-report">Report</span>
            </footer>
          </section>
        `;
      }
    }; // End of Reply {}
///////////////////////////////////////////////////////////////////////////// Reload {}
    const modal = css('.km-modal') || false;
    let kmTimestamps = css('.km-timestamp', true) || false;

    const Reload = {
      images: function() {
        if (modal) {
          Comment.images = css('.km-image', true) || false;
          Array.prototype.slice.call(Comment.images).map(image => {
            image.onclick = function () {
              console.log('Clicked');
              modal.style.display = 'flex';
              modal.children[1].src = this.src;
            };
          })
        }
      },

      comments: function(display) {
        Response.http(function(response) {
          if(response.ready) {
            for(let i = 0; i < response.data.length; i++) {
              display.insertAdjacentHTML('afterbegin', Comment.component(
                response.data[i].id,
                response.data[i].username,
                response.data[i].comment,
                response.data[i].posted,
                response.data[i].secret
              ));
            }

            Reload.images();
          } else if(logout) logout.click();
        }, 'get', config.root + '/api/comment?comments=all&ssid=' + Storage.get().ssid);
      },

      time: function() {
        setInterval(function() {
          kmTimestamps = css('.km-timestamp', true);
          if(kmTimestamps) {
            for (let i = 0; i < kmTimestamps.length; i++) {
              if (kmTimestamps[i].innerHTML !== Comment.time(kmTimestamps[i].dataset.timestamp))
                kmTimestamps[i].innerHTML = Comment.time(kmTimestamps[i].dataset.timestamp);
            }
          }
        }, 1000);
      }
    }; // End of Reload {}

///////////////////////////////////////////////////////////////////////////// Select {}
    const Select = {
      selectedText: function (textarea, tag) {
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;

        let selection = textarea.value.substring(start, end);
        let sliced = textarea.value.slice(0, start) + tag[0] + selection + tag[1] + textarea.value.slice(end);
        textarea.value = sliced;
      }
    }; // End of Select {}

    // KOMMENTA
    const kommenta = css('.kommenta') || false;
    if(kommenta) {
      const kmCommentsDisplay = css('.km-comments__display'),
      kmCommentBold = css('.km-comment__bold'),
      kmCommentItalic = css('.km-comment__italic'),
      kmCommentSize = css('.km-comment__size'),
      kmCommentColor = css('.km-comment__color'),
      kmCommentFont = css('.km-comment__font'),
      kmCommentImage = css('.km-comment__image');

      const kmCommentTextarea = css('.km-comment__textarea'),
      kmCommentShade = css('.km-comment-textarea--shade'),
      kmCommentPost = css('.km-comment__post'),
      kmCommentCancel = css('.km-comment__cancel');

      const kmCommentFormAnimation = (textarea) => {
        if (textarea.value.length > 0 && textarea.value.match(/[^\s]+/g)) {
          kmCommentShade.style.backgroundColor = config.blue;
          kmCommentPost.style.backgroundColor = config.blue;
          kmCommentPost.style.color = config.white;
        } else {
          kmCommentShade.style.backgroundColor = config.lightBlack;
          kmCommentPost.style.backgroundColor = config.grey;
          kmCommentPost.style.color = config.black;
        }
      };

      kmCommentTextarea.oninput = function () {
        kmCommentFormAnimation(kmCommentTextarea);

        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      };
      kmCommentTextarea.onfocus = () => kmCommentShade.style.width = '100%';
      kmCommentTextarea.onblur = function () {
        if(!(this.value.length > 0) && !(this.value.match(/[^\s\n]+/g)))
          kmCommentShade.style.width = '0';
      };

      kmCommentCancel.onclick = () => {
        kmCommentTextarea.value = '';
        kmCommentFormAnimation(kmCommentTextarea);
      }
      
      kmCommentPost.onclick = function() {
        if (kmCommentTextarea.value.length > 0 && kmCommentTextarea.value.match(/[^\s\n]+/g)) {
          let ssid = Storage.get().ssid;
          Response.http(function(response) {
            if(response.ready) {
              kmCommentsDisplay.insertAdjacentHTML('afterbegin', Comment.component(
                response.id,
                response.username, 
                response.comment,
                response.posted,
                response.secret
              ));

              kmCommentTextarea.value = '';
              kmCommentFormAnimation(kmCommentTextarea);
              Reload.images();
            } else console.log('Error occured.');
          }, 'post', config.root + '/api/comment', 'ssid=' + ssid + '&comment=' + kmCommentTextarea.value)
        }
      }; // end of comment post

      kmCommentBold.onclick = () => Select.selectedText(kmCommentTextarea, ['<b>', '</b>']);
      kmCommentItalic.onclick = () => Select.selectedText(kmCommentTextarea, ['<i>', '</i>']);
      kmCommentSize.onclick = () => Select.selectedText(kmCommentTextarea, ['<size=1>', '</size>']);
      kmCommentColor.onclick = () => Select.selectedText(kmCommentTextarea, ['<color=inherit>', '</color>']);
      kmCommentFont.onclick = () => Select.selectedText(kmCommentTextarea, ['<font=inherit>', '</font>']);
      kmCommentImage.onclick = () => Select.selectedText(kmCommentTextarea, ['<image=#>', '</image>']);
      // Load comments
      Reload.comments(kmCommentsDisplay);
      Reload.time();
      //////////////////////////////////////////////////////////////////// Modal
      const kmModalClose = css('.km-modal__close') || false;
      if(kmModalClose) {
        kmModalClose.onclick = () => modal.style.display = 'none';
      }
    } // end of KOMMENTA
  };

  return { ready };
})();

window.onload = () => App.ready();